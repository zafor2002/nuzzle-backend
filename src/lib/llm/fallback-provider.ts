import { ILLMProvider, TriageRequest, TriageResult, ChatRequest, ChatResponse, RecommendedClinic } from './types';
import { checkEmergencyFastPath, EMERGENCY_CLINIC } from './emergency-guard';

const DEFAULT_CLINIC: RecommendedClinic = {
  id: 'vet_general_1',
  name: 'Dr. Evelyn Martinez, DVM',
  clinicName: 'Nuzzle Central Wellness & Vet Care',
  phone: '+880 1711-223344',
  location: 'Banani / Gulshan, Dhaka',
  isProPriority: false,
};

export class FallbackProvider implements ILLMProvider {
  readonly name = 'Nuzzle Clinical Heuristic Engine';

  isAvailable(): boolean {
    return true; // Always available as local zero-downtime engine
  }

  async triage(req: TriageRequest): Promise<TriageResult> {
    // 1. Check emergency fast path first
    const emergency = checkEmergencyFastPath(req);
    if (emergency) {
      return emergency;
    }

    const petName = req.petName || 'Pet';
    const species = req.species || 'Dog';
    const symptoms = (req.symptoms || '').toLowerCase();

    // 2. Moderate Urgency checks (vomit, diarrhea, limp, ear, appetite, cough)
    const isModerate =
      symptoms.includes('vomit') ||
      symptoms.includes('diarrhea') ||
      symptoms.includes('limp') ||
      symptoms.includes('ear') ||
      symptoms.includes('cough') ||
      symptoms.includes('fever') ||
      symptoms.includes('letharg') ||
      symptoms.includes('not eating') ||
      symptoms.includes('বমি') ||
      symptoms.includes('ডায়রিয়া') ||
      symptoms.includes('খাবার খাচ্ছে না');

    if (isModerate) {
      return {
        triageId: `trg_mod_${Date.now()}`,
        petName,
        species,
        urgency: 'moderate',
        urgencyLabel: 'Schedule Vet Visit (24-48h)',
        urgencyColor: '#F59E0B',
        summary: `Our clinical engine analyzed ${petName}'s symptoms ("${req.symptoms}"). The symptoms indicate a moderate health issue that warrants a professional clinical examination within the next 24 to 48 hours.`,
        recommendedActions: [
          'Withhold rich or fatty treats; offer small portions of plain boiled chicken and rice.',
          'Ensure continuous access to fresh water to prevent dehydration.',
          'Monitor body temperature, stool consistency, and energy levels closely.',
          'Book an appointment with your veterinarian if symptoms do not resolve within 24 hours.',
        ],
        redFlags: [
          'Vomiting persisting more than 3 times in 12 hours',
          'Complete refusal of water leading to dry, tacky gums',
          'Blood visible in stool or vomitus',
          'Sudden severe lethargy or inability to stand',
        ],
        recommendedClinic: DEFAULT_CLINIC,
        disclaimer: 'PawDoctor AI provides preliminary guidance based on veterinary triage taxonomies and does not replace in-person diagnosis by a licensed veterinarian.',
        createdAt: new Date().toISOString(),
        provider: this.name,
      };
    }

    // 3. Low Urgency / Home Care
    return {
      triageId: `trg_low_${Date.now()}`,
      petName,
      species,
      urgency: 'low',
      urgencyLabel: 'Monitor at Home',
      urgencyColor: '#10B981',
      summary: `${petName} is exhibiting mild symptoms that can typically be managed and monitored safely at home. No immediate clinical emergency was detected.`,
      recommendedActions: [
        'Keep your pet in a clean, quiet, and temperature-controlled environment.',
        'Inspect fur, skin, and paws for any minor external irritation or tick bites.',
        'Maintain a consistent feeding schedule and ensure adequate hydration.',
        'Note down any changes in behavior or appetite over the next 24-36 hours.',
      ],
      redFlags: [
        'Symptoms worsening or spreading over the next 48 hours',
        'Development of continuous scratching causing open skin wounds',
        'Loss of playful behavior or onset of coughing',
      ],
      recommendedClinic: DEFAULT_CLINIC,
      disclaimer: 'PawDoctor AI provides preliminary guidance based on veterinary triage taxonomies and does not replace in-person diagnosis by a licensed veterinarian.',
      createdAt: new Date().toISOString(),
      provider: this.name,
    };
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const lastMsg = req.messages[req.messages.length - 1]?.content || '';
    const q = lastMsg.toLowerCase();
    const petName = req.petContext?.petName || 'your pet';

    let reply = `Hello! I am PawDoctor AI. I've noted your question regarding ${petName}. For general wellness, ensure clean water, balanced nutrition, and appropriate exercise. If you notice persistent lethargy or appetite changes, booking a checkup with a licensed vet is always recommended.`;
    let urgency: 'low' | 'moderate' | 'emergency' = 'low';

    if (q.includes('chocolate') || q.includes('poison') || q.includes('grape') || q.includes('onion') || q.includes('bleeding')) {
      reply = `🚨 URGENT WARNING: Ingesting this substance can be severely toxic to pets! Please contact Cascade 24/7 Emergency Hospital (+880 1711-998877) immediately or your local poison control clinic. Do NOT wait for symptoms to appear.`;
      urgency = 'emergency';
    } else if (q.includes('food') || q.includes('diet') || q.includes('weight') || q.includes('calori')) {
      reply = `🥑 Nutrition Insight: For ${petName}, a balanced diet with minimum 26% protein and controlled fat is essential. Avoid feeding table scraps, allium vegetables (garlic/onions), or sweets. Providing fresh water alongside high-quality kibble or veterinary-approved cooked meals ensures optimal vitality.`;
    } else if (q.includes('vaccin') || q.includes('rabies') || q.includes('shot')) {
      reply = `💉 Preventive Care: Core vaccinations (Rabies, DHPP for dogs, FVRCP for cats) are critical every 1-3 years depending on local veterinary guidelines. Regular deworming every 3 months is also vital for indoor and outdoor pets.`;
    }

    return {
      reply,
      suggestedQuestions: [
        `What are safe fruits & veggies for ${petName}?`,
        `How often should ${petName} visit the vet?`,
        `What are common signs of pet allergies?`,
      ],
      urgency,
      provider: this.name,
      timestamp: new Date().toISOString(),
    };
  }
}
