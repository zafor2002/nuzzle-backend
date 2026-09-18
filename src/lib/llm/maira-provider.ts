import { ILLMProvider, TriageRequest, TriageResult, ChatRequest, ChatResponse, RecommendedClinic } from './types';
import { checkEmergencyFastPath, EMERGENCY_CLINIC } from './emergency-guard';
import { mairaClient } from '@/lib/maira/maira-client';
import { logger } from '@/lib/logger';

const DEFAULT_CLINIC: RecommendedClinic = {
  id: 'vet_cascade_247',
  name: 'Dr. Sarah Al-Mansoor, DVM',
  clinicName: 'Cascade 24/7 Emergency & Surgical Hospital',
  phone: '+880 1711-998877',
  location: 'Gulshan-2 / Dhanmondi, Dhaka',
  isProPriority: true,
};

export class MairaProvider implements ILLMProvider {
  readonly name = 'Gigalogy MAIRA Managed RAG';

  isAvailable(): boolean {
    return mairaClient.isConfigured();
  }

  async triage(req: TriageRequest): Promise<TriageResult> {
    if (!this.isAvailable()) {
      throw new Error('Gigalogy MAIRA API key is not configured');
    }

    const petName = req.petName || 'Pet';
    const species = req.species || 'Dog';
    const query = req.symptoms.trim();

    const datasetId = process.env.MAIRA_VET_DATASET_ID || '9dfc7c57-c072-441c-b653-1cf98247f990';
    const profileId = process.env.MAIRA_VET_PROFILE_ID || process.env.MAIRA_PROFILE_ID || '0a8fd1e8-45ac-4870-8f5f-cfbc7ccf58a6';

    logger.info('MairaProvider: Querying MAIRA RAG for triage (raw)', { query });

    const mairaRes = await mairaClient.ask({
      user_id: `nuzzle_usr_${Date.now()}`,
      query,
      conversation_type: 'question',
      gpt_profile_id: profileId,
      context_preference: datasetId ? { preferred: { dataset_id: datasetId } } : undefined,
      top_k: 5,
      is_keyword_enabled: true,
    });

    const lowerAns = mairaRes.answer.toLowerCase();
    const isEmergency = lowerAns.includes('emergency') || lowerAns.includes('critical') || lowerAns.includes('immediate');
    const urgency: 'low' | 'moderate' | 'emergency' = isEmergency ? 'emergency' : 'low';

    return {
      triageId: `trg_maira_${Date.now()}`,
      petName,
      species,
      urgency,
      urgencyLabel: '',
      urgencyColor: '',
      summary: mairaRes.answer.trim(),
      recommendedActions: [],
      redFlags: [],
      recommendedClinic: isEmergency ? EMERGENCY_CLINIC : DEFAULT_CLINIC,
      disclaimer: '',
      createdAt: new Date().toISOString(),
      provider: this.name,
    };
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!this.isAvailable()) {
      throw new Error('Gigalogy MAIRA API key is not configured');
    }

    const lastMsg = req.messages[req.messages.length - 1]?.content || '';

    // Include multi-turn context memory cleanly without artificial dog tags
    let query = lastMsg.trim();
    if (req.messages.length > 1) {
      const turns = req.messages
        .slice(-6)
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
      query = turns;
    }

    logger.info('MairaProvider: Querying MAIRA RAG for chat (raw)', { queryLength: query.length });

    const mairaRes = await mairaClient.ask({
      user_id: `nuzzle_usr_${Date.now()}`,
      query,
      conversation_type: 'chat',
      session_id: `sess_chat_${Date.now()}`,
      gpt_profile_id: process.env.MAIRA_VET_PROFILE_ID || process.env.MAIRA_PROFILE_ID || '0a8fd1e8-45ac-4870-8f5f-cfbc7ccf58a6',
      top_k: 5,
      is_keyword_enabled: true,
    });

    return {
      reply: mairaRes.answer.trim(),
      provider: this.name,
      timestamp: new Date().toISOString(),
    };
  }
}
