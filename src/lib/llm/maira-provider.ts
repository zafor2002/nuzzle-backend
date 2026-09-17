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
    // 1. Emergency safety fast-path
    const emergency = checkEmergencyFastPath(req);
    if (emergency) {
      return emergency;
    }

    if (!this.isAvailable()) {
      throw new Error('Gigalogy MAIRA API key is not configured');
    }

    const petName = req.petName || 'Pet';
    const species = req.species || 'Dog';
    const breed = req.breed || 'Mixed';
    const query = `[Patient: ${petName}, Species: ${species}, Breed: ${breed}, Age: ${req.age || 'N/A'}, Duration: ${req.duration || 'N/A'}] Symptoms: ${req.symptoms}`;

    const datasetId = process.env.MAIRA_VET_DATASET_ID || '9dfc7c57-c072-441c-b653-1cf98247f990';
    const profileId = process.env.MAIRA_VET_PROFILE_ID || process.env.MAIRA_PROFILE_ID || '9884416a-abd3-4e9c-a893-b2b0cab2bc60';

    logger.info('MairaProvider: Querying MAIRA RAG for triage', { petName, symptoms: req.symptoms });

    const mairaRes = await mairaClient.ask({
      user_id: `nuzzle_usr_${Date.now()}`,
      query,
      conversation_type: 'question',
      gpt_profile_id: profileId,
      context_preference: datasetId ? { preferred: { dataset_id: datasetId } } : undefined,
      top_k: 15,
      is_keyword_enabled: true,
    });

    let urgency: 'low' | 'moderate' | 'emergency' = 'moderate';
    let urgencyLabel = 'Schedule Vet Visit (24-48h)';
    let urgencyColor = '#F59E0B';

    const lowerAns = mairaRes.answer.toLowerCase();
    if (lowerAns.includes('emergency') || lowerAns.includes('critical') || lowerAns.includes('immediate')) {
      urgency = 'emergency';
      urgencyLabel = 'Emergency Care Required (Immediate)';
      urgencyColor = '#EF4444';
    } else if (lowerAns.includes('mild') || lowerAns.includes('home') || lowerAns.includes('monitor')) {
      urgency = 'low';
      urgencyLabel = 'Monitor at Home';
      urgencyColor = '#10B981';
    }

    return {
      triageId: `trg_maira_${Date.now()}`,
      petName,
      species,
      urgency,
      urgencyLabel,
      urgencyColor,
      summary: mairaRes.answer,
      recommendedActions: [
        'Review the verified clinical triage guidelines from Gigalogy MAIRA.',
        'Keep pet comfortable and hydrated in a calm, quiet room.',
        'Consult with your licensed veterinarian if symptoms progress.',
      ],
      redFlags: [
        'Rapid shallow breathing or collapse',
        'Persistent vomiting or pale gums',
      ],
      recommendedClinic: urgency === 'emergency' ? EMERGENCY_CLINIC : DEFAULT_CLINIC,
      disclaimer: 'PawDoctor AI powered by Gigalogy MAIRA RAG provides clinical decision support. Always consult a licensed veterinarian for urgent diagnoses.',
      createdAt: new Date().toISOString(),
      provider: `${this.name} (Ref Docs: ${mairaRes.reference_documents?.length || 0})`,
    };
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!this.isAvailable()) {
      throw new Error('Gigalogy MAIRA API key is not configured');
    }

    const lastMsg = req.messages[req.messages.length - 1]?.content || '';
    const petName = req.petContext?.petName || 'your pet';
    const query = req.petContext
      ? `[Pet: ${petName}, Species: ${req.petContext.species || 'Dog'}, Breed: ${req.petContext.breed || 'N/A'}] ${lastMsg}`
      : lastMsg;

    const mairaRes = await mairaClient.ask({
      user_id: `nuzzle_usr_${Date.now()}`,
      query,
      conversation_type: 'chat',
      session_id: `sess_${petName.toLowerCase()}_${Date.now()}`,
      gpt_profile_id: process.env.MAIRA_VET_PROFILE_ID || process.env.MAIRA_PROFILE_ID || '9884416a-abd3-4e9c-a893-b2b0cab2bc60',
      top_k: 15,
      is_keyword_enabled: true,
    });

    return {
      reply: mairaRes.answer,
      suggestedQuestions: [
        `What are safe foods and supplements for ${petName}?`,
        `How can I prevent allergies in my pet?`,
        `When should ${petName} visit a certified clinic?`,
      ],
      provider: this.name,
      timestamp: new Date().toISOString(),
    };
  }
}
