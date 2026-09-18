import { ILLMProvider, TriageRequest, TriageResult, ChatRequest, ChatResponse, RecommendedClinic } from './types';
import { VETERINARY_TRIAGE_SYSTEM_PROMPT, VETERINARY_CHAT_SYSTEM_PROMPT, buildTriageUserPrompt, buildChatUserPrompt } from './prompts';
import { checkEmergencyFastPath, EMERGENCY_CLINIC } from './emergency-guard';

const DEFAULT_CLINIC: RecommendedClinic = {
  id: 'vet_cascade_247',
  name: 'Dr. Sarah Al-Mansoor, DVM',
  clinicName: 'Cascade 24/7 Emergency & Surgical Hospital',
  phone: '+880 1711-998877',
  location: 'Gulshan-2 / Dhanmondi, Dhaka',
  isProPriority: true,
};

const DEFAULT_OPENAI_KEY =
  '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';

export class OpenAIProvider implements ILLMProvider {
  readonly name = 'OpenAI GPT-4o-mini';
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || DEFAULT_OPENAI_KEY;
    this.model = model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  async triage(req: TriageRequest): Promise<TriageResult> {
    const emergency = checkEmergencyFastPath(req);
    if (emergency) {
      return emergency;
    }

    if (!this.isAvailable()) {
      throw new Error('OpenAI API key is not configured');
    }

    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const userPrompt = buildTriageUserPrompt(req);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: VETERINARY_TRIAGE_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(4500),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty content');
    }

    const parsed = JSON.parse(content);

    return {
      triageId: `trg_openai_${Date.now()}`,
      petName: req.petName || 'Pet',
      species: req.species || 'Dog',
      urgency: parsed.urgency || 'moderate',
      urgencyLabel: parsed.urgencyLabel || (parsed.urgency === 'emergency' ? 'Emergency Care Required' : 'Schedule Vet Visit'),
      urgencyColor: parsed.urgencyColor || (parsed.urgency === 'emergency' ? '#EF4444' : parsed.urgency === 'low' ? '#10B981' : '#F59E0B'),
      summary: parsed.summary || 'Clinical assessment completed by PawDoctor AI.',
      recommendedActions: Array.isArray(parsed.recommendedActions) && parsed.recommendedActions.length > 0
        ? parsed.recommendedActions
        : ['Keep pet comfortable and monitor for symptoms.', 'Consult with your veterinarian.'],
      redFlags: Array.isArray(parsed.redFlags) && parsed.redFlags.length > 0
        ? parsed.redFlags
        : ['Pale or blue gums', 'Difficulty breathing or extreme lethargy'],
      recommendedClinic: parsed.urgency === 'emergency' ? EMERGENCY_CLINIC : DEFAULT_CLINIC,
      disclaimer: parsed.disclaimer || 'PawDoctor AI provides preliminary guidance based on veterinary triage taxonomies and does not replace in-person diagnosis by a licensed veterinarian.',
      createdAt: new Date().toISOString(),
      provider: this.name,
    };
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key is not configured');
    }

    const endpoint = 'https://api.openai.com/v1/chat/completions';

    let systemPrompt = VETERINARY_CHAT_SYSTEM_PROMPT;
    if (req.petContext) {
      const { petName, species, breed, age, weight } = req.petContext;
      systemPrompt += `\n\n[Active Patient Context: Name: ${petName || 'Unknown'}, Species: ${species || 'Pet'}, Breed: ${breed || 'Mixed'}, Age: ${age || 'N/A'}, Weight: ${weight || 'N/A'}]`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...req.messages.map(m => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(4500),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const replyText = data?.choices?.[0]?.message?.content || 'I am PawDoctor AI. How may I assist with your pet today?';

    return {
      reply: replyText,
      suggestedQuestions: [
        'What are the main warning signs I should watch for?',
        'How can I keep my pet comfortable at home?',
        'Does my pet need an emergency veterinary clinic right now?',
      ],
      provider: this.name,
      timestamp: new Date().toISOString(),
    };
  }
}
