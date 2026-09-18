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

export class GeminiProvider implements ILLMProvider {
  readonly name = 'Google Gemini 1.5 Flash';
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = model || process.env.LLM_MODEL || 'gemini-1.5-flash';
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  async triage(req: TriageRequest): Promise<TriageResult> {
    // Check emergency fast-path first for safety
    const emergency = checkEmergencyFastPath(req);
    if (emergency) {
      return emergency;
    }

    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const userPrompt = buildTriageUserPrompt(req);

    const requestBody = {
      system_instruction: {
        parts: [{ text: VETERINARY_TRIAGE_SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        response_mime_type: 'application/json',
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Gemini returned empty content');
    }

    // Parse JSON
    const parsed = JSON.parse(rawText);

    return {
      triageId: `trg_gemini_${Date.now()}`,
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
      throw new Error('Gemini API key is not configured');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    let systemInstruction = VETERINARY_CHAT_SYSTEM_PROMPT;
    if (req.petContext) {
      const { petName, species, breed, age, weight } = req.petContext;
      systemInstruction += `\n\n[Active Patient Context: Name: ${petName || 'Unknown'}, Species: ${species || 'Pet'}, Breed: ${breed || 'Mixed'}, Age: ${age || 'N/A'}, Weight: ${weight || 'N/A'}]`;
    }

    const contents = req.messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const requestBody = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I am PawDoctor AI. How may I assist with your pet today?';

    return {
      reply: replyText,
      suggestedQuestions: [
        'What should I monitor over the next 24 hours?',
        'Can you recommend a diet adjustment for my pet?',
        'When should I seek immediate in-person emergency care?',
      ],
      provider: this.name,
      timestamp: new Date().toISOString(),
    };
  }
}
