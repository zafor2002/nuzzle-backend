import { TriageRequest, TriageResult, RecommendedClinic } from './types';

export const EMERGENCY_CLINIC: RecommendedClinic = {
  id: 'vet_cascade_247',
  name: 'Dr. Sarah Al-Mansoor, DVM (Trauma Surgeon)',
  clinicName: 'Cascade 24/7 Emergency & Surgical Hospital',
  phone: '+880 1711-998877',
  location: 'Gulshan-2 / Dhanmondi, Dhaka',
  isProPriority: true,
};

const EMERGENCY_KEYWORDS = [
  // Toxic Foods & Ingestions
  'chocolate',
  'cocoa',
  'xylitol',
  'grape',
  'raisin',
  'onion',
  'garlic',
  'paracetamol',
  'panadol',
  'tylenol',
  'aspirin',
  'rat poison',
  'rodenticide',
  'antifreeze',
  'bleach',
  'lily',
  'lilies',
  
  // Severe Physical Trauma & Life Threats
  'blood',
  'bleeding',
  'vomit blood',
  'choking',
  'cannot breathe',
  'difficulty breathing',
  'gasping',
  'collapse',
  'collapsed',
  'unconscious',
  'seizure',
  'seizures',
  'hit by car',
  'fracture',
  'broken bone',
  'swollen abdomen',
  'bloat',
  'gdv',
  'unable to urinate',
  'blocked cat',
  'pale gums',
  'blue gums',
  'cyanosis',
  'heatstroke',
  'hyperthermia',

  // Bengali Emergency Terms
  'রক্ত',
  'রক্তবমি',
  'শ্বাসকষ্ট',
  'বিষ',
  'চকলেট',
  'প্যারাসিটামল',
  'অজ্ঞান',
  'খিঁচুনি',
  'গাড়ি দুর্ঘটনা',
  'দম বন্ধ',
];

export function checkEmergencyFastPath(req: TriageRequest): TriageResult | null {
  const text = (req.symptoms || '').toLowerCase();
  const matchedKeyword = EMERGENCY_KEYWORDS.find(kw => text.includes(kw));

  if (!matchedKeyword) {
    return null;
  }

  const petName = req.petName || 'Your pet';
  const species = req.species || 'pet';

  return {
    triageId: `trg_emg_${Date.now()}`,
    petName,
    species,
    urgency: 'emergency',
    urgencyLabel: 'Emergency Care Required (Immediate)',
    urgencyColor: '#EF4444',
    summary: `⚠️ CRITICAL EMERGENCY: The reported symptom ("${matchedKeyword}") indicates a potentially life-threatening situation for ${petName}. Immediate hands-on emergency veterinary intervention is required.`,
    recommendedActions: [
      'Transport your pet to the nearest 24/7 Emergency Veterinary Hospital immediately.',
      'Call the hospital while en route so trauma/ICU staff can prepare oxygen and treatment beds.',
      'Do NOT administer any human medications (Paracetamol/Aspirin are deadly toxins to dogs and cats).',
      'Keep your pet calm, warm, and minimize movement during transport.',
      'If toxic ingestion occurred, bring the product packaging or plant sample to the clinic.',
    ],
    redFlags: [
      'Pale, bluish, or brick-red gums',
      'Loss of consciousness or unresponsiveness',
      'Persistent seizures or inability to stand',
      'Severe abdominal distension or unproductive retching',
    ],
    recommendedClinic: EMERGENCY_CLINIC,
    disclaimer: 'PawDoctor AI provides preliminary guidance based on veterinary triage taxonomies and does not replace in-person diagnosis by a licensed veterinarian.',
    createdAt: new Date().toISOString(),
    provider: 'EmergencyFastPath Guardrail',
  };
}
