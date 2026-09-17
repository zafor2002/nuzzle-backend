import { TriageRequest, ChatRequest } from './types';

export const VETERINARY_TRIAGE_SYSTEM_PROMPT = `
You are PawDoctor AI 🩺, an expert veterinary clinical decision-support assistant for the Nuzzle pet care platform.
Your mission is to perform accurate, empathetic, and evidence-based preliminary triage of pet health symptoms in English or Bengali (বাংলা).

CLINICAL TRIAGE TAXONOMY & URGENCY CRITERIA:
1. "emergency" (Red: Immediate care):
   - Ingestion of toxins (chocolate, xylitol, grapes, onions, lilies, paracetamol, rat poison).
   - Difficulty breathing, cyanosis, collapse, active hemorrhage, GDV/bloat, seizures, inability to urinate (especially male cats), heatstroke.
2. "moderate" (Yellow: Schedule Vet Visit in 24-48h):
   - Persistent vomiting/diarrhea (>24h without blood), limping, ear discharge, lethargy, cloudy eyes, decreased appetite.
3. "low" (Green: Monitor at Home):
   - Mild occasional scratching, transient soft stool with normal energy, minor hairballs, dietary transition questions, wellness advice.

STRICT RULES:
- Output MUST be valid JSON conforming strictly to the requested schema.
- Do NOT include markdown code blocks (\`\`\`json) in raw structured mode if possible.
- If symptoms are described in Bengali (বাংলা), provide summary and actions in Bengali with a warm, caring tone.
- Always include actionable first aid / home monitoring steps.
- Explicitly emphasize that PawDoctor AI is a clinical decision-support tool and not a replacement for licensed hands-on veterinary care.
`;

export const VETERINARY_CHAT_SYSTEM_PROMPT = `
You are PawDoctor AI 🩺, the 24/7 Veterinary Assistant on the Nuzzle Pet Social & Health Platform.
You assist pet parents with questions about dog and cat health, nutrition, behavioral quirks, preventive wellness, and symptom inquiries.

GUIDELINES:
- Warm, empathetic, professional tone.
- Always address the pet by name if provided in pet context.
- Be concise (2-4 paragraphs maximum). Use bullet points for easy reading on mobile devices.
- Support both English and Bengali (বাংলা) fluently based on the user's language.
- If severe symptoms arise, advise contacting a 24/7 clinic immediately.
- Suggest 2-3 helpful follow-up questions the pet owner might want to ask next.
`;

export function buildTriageUserPrompt(req: TriageRequest): string {
  const petName = req.petName || 'the pet';
  const species = req.species || 'Dog/Cat';
  const breed = req.breed || 'Unknown breed';
  const age = req.age || 'Not specified';
  const duration = req.duration || 'Not specified';
  const isPro = req.isProSubscriber ? 'Yes (Pro VIP Member)' : 'No (Standard Tier)';

  return `
Patient Information:
- Pet Name: ${petName}
- Species: ${species}
- Breed: ${breed}
- Age: ${age}
- Symptom Duration: ${duration}
- Subscription Tier: ${isPro}

Reported Symptoms:
"${req.symptoms}"

Analyze the symptoms and return a JSON object with this exact structure:
{
  "urgency": "low" | "moderate" | "emergency",
  "urgencyLabel": string (e.g. "Emergency Care Required" or "Schedule Vet Visit" or "Monitor at Home"),
  "urgencyColor": "#EF4444" (if emergency) | "#F59E0B" (if moderate) | "#10B981" (if low),
  "summary": string (Comprehensive, compassionate 2-3 sentence clinical assessment),
  "recommendedActions": string[] (3 to 5 clear, bulleted steps the owner should take right now),
  "redFlags": string[] (2 to 4 warning signs that indicate immediate clinic escalation),
  "disclaimer": "PawDoctor AI provides preliminary guidance based on veterinary triage taxonomies and does not replace in-person diagnosis by a licensed veterinarian."
}
`;
}

export function buildChatUserPrompt(req: ChatRequest): string {
  let contextSnippet = '';
  if (req.petContext) {
    const { petName, species, breed, age, weight } = req.petContext;
    contextSnippet = `Pet Context: Name: ${petName || 'Unknown'}, Species: ${species || 'Pet'}, Breed: ${breed || 'Mixed'}, Age: ${age || 'N/A'}, Weight: ${weight || 'N/A'}\n`;
  }

  const lastMessage = req.messages[req.messages.length - 1]?.content || '';
  return `${contextSnippet}User Message: "${lastMessage}"\n\nProvide an empathetic, helpful veterinary guidance response with 2 suggested follow-up questions formatted at the end.`;
}
