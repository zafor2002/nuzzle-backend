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
    // 1. Check emergency fast path first (poisons, acute trauma, dyspnea)
    const emergency = checkEmergencyFastPath(req);
    if (emergency) {
      return emergency;
    }

    const petName = req.petName || 'Pet';
    const species = (req.species || 'Dog').trim();
    const isCat = species.toLowerCase().includes('cat') || species.toLowerCase().includes('feline');
    const isDog = species.toLowerCase().includes('dog') || species.toLowerCase().includes('canine');
    const isRabbit = species.toLowerCase().includes('rabbit') || species.toLowerCase().includes('bunny');
    const breed = req.breed || (isCat ? 'Companion Cat' : isDog ? 'Companion Dog' : 'Companion Pet');
    const symptoms = (req.symptoms || '').toLowerCase();
    const duration = req.duration ? ` over ${req.duration}` : '';

    // Category 1: Polydipsia / Polyuria (Excessive drinking / excessive urination)
    if (
      symptoms.includes('water') ||
      symptoms.includes('drink') ||
      symptoms.includes('thirsty') ||
      symptoms.includes('thirst') ||
      symptoms.includes('urin') ||
      symptoms.includes('pee') ||
      symptoms.includes('পানি')
    ) {
      const conditionFocus = isCat
        ? 'In cats, polydipsia (excessive drinking) is a cardinal clinical indicator most commonly linked to Chronic Kidney Disease (CKD), Feline Diabetes Mellitus, Hyperthyroidism, or Lower Urinary Tract Disease (FLUTD).'
        : isDog
        ? 'In dogs, polydipsia and polyuria frequently signal Diabetes Mellitus, Renal Insufficiency, Cushing’s Disease (hyperadrenocorticism), or a Urinary Tract Infection (UTI).'
        : 'Excessive water consumption indicates potential metabolic, renal, or glycemic disruption requiring clinical lab analysis.';

      return {
        triageId: `trg_poly_${Date.now()}`,
        petName,
        species,
        urgency: 'moderate',
        urgencyLabel: 'Schedule Vet Visit (24-48h)',
        urgencyColor: '#F59E0B',
        summary: `Clinical assessment for ${petName} (${species} • ${breed}): ${conditionFocus} Given the reported symptoms ("${req.symptoms}"${duration}), a prompt urinalysis (checking specific gravity, glucose, protein) and serum biochemistry panel (BUN, Creatinine, ALT) are strongly recommended within 24–48 hours.`,
        recommendedActions: [
          'CRITICAL: NEVER restrict water access. Withholding water when a pet has kidney or diabetic dysfunction can trigger rapid hypovolemic dehydration.',
          'Measure and record 24-hour water intake (normal intake is approx. 50–60 ml per kg of body weight daily).',
          isCat ? 'Observe litter box usage closely for increased clump volume or signs of dysuria (straining to urinate).' : 'Monitor urination frequency, volume, and whether accidents occur inside the home.',
          'Bring a fresh urine sample (under 2–3 hours old) to your veterinary appointment to expedite diagnostic testing.',
        ],
        redFlags: [
          'Sudden onset of vomiting, severe lethargy, or refusal to eat',
          'Sweet or acetone-like breath odor (indicative of diabetic ketoacidosis)',
          'Complete inability to pass urine (acute urethral obstruction — immediate surgical emergency)',
          'Weakness, collapse, or ataxia in hind limbs',
        ],
        recommendedClinic: DEFAULT_CLINIC,
        disclaimer: 'PawDoctor AI provides preliminary guidance based on veterinary triage taxonomies and does not replace in-person diagnosis by a licensed veterinarian.',
        createdAt: new Date().toISOString(),
        provider: `${this.name} (Polydipsia/Metabolic Protocol)`,
      };
    }

    // Category 2: Gastrointestinal (Vomiting, Diarrhea, Refusal of Food)
    if (
      symptoms.includes('vomit') ||
      symptoms.includes('diarrhea') ||
      symptoms.includes('throw up') ||
      symptoms.includes('not eating') ||
      symptoms.includes('appetite') ||
      symptoms.includes('stomach') ||
      symptoms.includes('বমি') ||
      symptoms.includes('ডায়রিয়া')
    ) {
      return {
        triageId: `trg_gi_${Date.now()}`,
        petName,
        species,
        urgency: 'moderate',
        urgencyLabel: 'Schedule Vet Visit (24-48h)',
        urgencyColor: '#F59E0B',
        summary: `Gastroenterology evaluation for ${petName} (${species}): The reported symptoms ("${req.symptoms}"${duration}) reflect active gastrointestinal irritation or enteritis. While occasional episodes may stem from dietary indiscretion, persistent GI distress carries high risk of electrolyte imbalance and dehydration.`,
        recommendedActions: [
          'Offer a gentle bland diet: 70% boiled skinless white chicken breast or turkey + 30% plain cooked white rice, served in small frequent portions.',
          'Provide small sips of fresh water or ice cubes to prevent sudden stomach distension that triggers vomiting.',
          'Check pet gum color and hydration: gums should be moist and pink. If tacky or pale, dehydration is progressing.',
          'Withhold all rich treats, table scraps, commercial dental chews, and dairy products until recovery is verified.',
        ],
        redFlags: [
          'Blood present in vomitus (hematemesis) or stool (hematochezia / black tarry melena)',
          'Vomiting persisting more than 3 episodes in a 12-hour period',
          'Unproductive retching or abdominal enlargement (signs of acute GDV / gastric torsion)',
          'Complete refusal of water for over 18 hours or severe submandibular depression',
        ],
        recommendedClinic: DEFAULT_CLINIC,
        disclaimer: 'PawDoctor AI provides preliminary guidance based on veterinary triage taxonomies and does not replace in-person diagnosis by a licensed veterinarian.',
        createdAt: new Date().toISOString(),
        provider: `${this.name} (Gastroenterology Protocol)`,
      };
    }

    // Category 3: Orthopedic & Musculoskeletal (Limping, Lameness, Paw Favoring, Stiffness)
    if (
      symptoms.includes('limp') ||
      symptoms.includes('paw') ||
      symptoms.includes('leg') ||
      symptoms.includes('walk') ||
      symptoms.includes('jump') ||
      symptoms.includes('stiff') ||
      symptoms.includes('হাঁটতে')
    ) {
      return {
        triageId: `trg_ortho_${Date.now()}`,
        petName,
        species,
        urgency: 'moderate',
        urgencyLabel: 'Schedule Vet Visit (24-48h)',
        urgencyColor: '#F59E0B',
        summary: `Musculoskeletal assessment for ${petName} (${species} • ${breed}): Lameness or abnormal gait indicates localized pain, soft tissue strain, joint inflammation (luxating patella, cruciate ligament tears), or foreign body paw irritation.`,
        recommendedActions: [
          'Strict exercise restriction: confine to a single room or crate rest. Only short leash walks for bathroom elimination.',
          'Inspect the affected paw carefully under good lighting: check between digital pads for foxtails, burrs, glass splinters, or broken claws.',
          'WARNING: NEVER administer human pain relievers (Advil, Tylenol, Paracetamol, Ibuprofen) — they cause fatal liver/kidney necrosis in pets.',
          'Apply a cool compress wrapped in a clean cloth for 10 minutes to suspected joint swelling if ${petName} tolerates it calmly.',
        ],
        redFlags: [
          'Complete refusal to bear any weight on the limb (toe-touch or non-weight bearing)',
          'Audible clicking or visual angular deformity around joints or long bones',
          'Vocalizing, biting, or intense distress when the leg is gently touched',
          'Swelling, significant localized heat, or sudden loss of motor control in the paw',
        ],
        recommendedClinic: DEFAULT_CLINIC,
        disclaimer: 'PawDoctor AI provides preliminary guidance based on veterinary triage taxonomies and does not replace in-person diagnosis by a licensed veterinarian.',
        createdAt: new Date().toISOString(),
        provider: `${this.name} (Orthopedic/Gait Protocol)`,
      };
    }

    // Category 4: Dermatology, Allergies & Ears (Itching, Scratching, Ear shaking, Red patches)
    if (
      symptoms.includes('scratch') ||
      symptoms.includes('itch') ||
      symptoms.includes('ear') ||
      symptoms.includes('skin') ||
      symptoms.includes('flea') ||
      symptoms.includes('tick') ||
      symptoms.includes('hair') ||
      symptoms.includes('fur') ||
      symptoms.includes('কান')
    ) {
      return {
        triageId: `trg_derm_${Date.now()}`,
        petName,
        species,
        urgency: 'moderate',
        urgencyLabel: 'Schedule Vet Visit (24-48h)',
        urgencyColor: '#F59E0B',
        summary: `Dermatological and otic evaluation for ${petName}: Symptoms ("${req.symptoms}"${duration}) are characteristic of allergic dermatitis, ear canal infection (otitis externa from yeast/bacteria), or ectoparasitic infestation.`,
        recommendedActions: [
          'Inspect the inner ear pinnae: check for coffee-ground discharge (mites), yellowish exudate, or pungent yeast odor.',
          'Use an Elizabethan collar (cone) or soft recovery donut to prevent self-mutilation and secondary bacterial infection from chronic scratching.',
          'Avoid inserting cotton swabs or home remedies (hydrogen peroxide/vinegar) into the ear canal, which can rupture the tympanic membrane.',
          'Schedule an otoscopic exam and skin cytology with your veterinarian to identify whether bacteria, yeast, or allergies are the root cause.',
        ],
        redFlags: [
          'Marked head tilt or involuntary rhythmic eye twitching (nystagmus / vestibular syndrome)',
          'Ear flap swelling into a thick fluid-filled cushion (aural hematoma requiring drainage)',
          'Open bleeding wounds, oozing pus, or intense erythema with severe pain',
        ],
        recommendedClinic: DEFAULT_CLINIC,
        disclaimer: 'PawDoctor AI provides preliminary guidance based on veterinary triage taxonomies and does not replace in-person diagnosis by a licensed veterinarian.',
        createdAt: new Date().toISOString(),
        provider: `${this.name} (Dermatology/Otology Protocol)`,
      };
    }

    // Category 5: Respiratory & Coughing (Cough, Wheeze, Sneeze, Discharge)
    if (
      symptoms.includes('cough') ||
      symptoms.includes('sneeze') ||
      symptoms.includes('wheez') ||
      symptoms.includes('breath') ||
      symptoms.includes('nasal') ||
      symptoms.includes('কাশি')
    ) {
      return {
        triageId: `trg_resp_${Date.now()}`,
        petName,
        species,
        urgency: 'moderate',
        urgencyLabel: 'Schedule Vet Visit (24-48h)',
        urgencyColor: '#F59E0B',
        summary: `Respiratory assessment for ${petName} (${species}): The reported symptoms ("${req.symptoms}"${duration}) indicate upper airway irritation, kennel cough complex (Bordetella in dogs), feline herpesvirus flare, or tracheal reactivity.`,
        recommendedActions: [
          'Provide humidity therapy: bring ${petName} into a steamy bathroom for 10–15 minutes twice daily to loosen airway secretions.',
          'Switch from neck collars to a chest harness to eliminate all mechanical pressure on the sensitive trachea.',
          'Count resting respiratory rate: count breaths per minute while pet is deeply asleep (healthy baseline is under 30 breaths/min).',
          'Isolate from other pets in the household if infectious tracheobronchitis is suspected.',
        ],
        redFlags: [
          'Open-mouth breathing in cats (always an immediate life-threatening emergency)',
          'Blue, purple, or pale white gum coloration (cyanosis / hypoxia)',
          'Abdominal effort during breathing or neck extended forward with gasping',
          'High fever accompanied by thick colored green/yellow nasal discharge',
        ],
        recommendedClinic: DEFAULT_CLINIC,
        disclaimer: 'PawDoctor AI provides preliminary guidance based on veterinary triage taxonomies and does not replace in-person diagnosis by a licensed veterinarian.',
        createdAt: new Date().toISOString(),
        provider: `${this.name} (Respiratory Protocol)`,
      };
    }

    // Category 6: Dynamic Home Care & Wellness (Mild or General Symptoms)
    return {
      triageId: `trg_low_${Date.now()}`,
      petName,
      species,
      urgency: 'low',
      urgencyLabel: 'Monitor at Home',
      urgencyColor: '#10B981',
      summary: `Clinical wellness review for ${petName} (${species} • ${breed}): Based on the reported symptoms ("${req.symptoms}"${duration}), current observations suggest a mild or localized issue that can safely be managed with structured home observation and supportive care.`,
      recommendedActions: [
        `Ensure ${petName} has continuous access to clean, fresh water and a quiet, climate-controlled resting area.`,
        'Keep a structured log of daily appetite, energy levels, and stool consistency over the next 24–48 hours.',
        'Avoid abrupt diet transitions, novel treats, or strenuous physical activity while monitoring.',
        'If symptoms do not begin to stabilize within 36 hours, schedule a routine wellness visit with Dr. Evelyn Martinez.',
      ],
      redFlags: [
        'Development of continuous vomiting, bloody discharge, or refusal of all liquids',
        'Marked drop in energy, prolonged disorientation, or reluctance to rise',
        'Significant elevation in body temperature (above 39.2°C / 102.5°F)',
      ],
      recommendedClinic: DEFAULT_CLINIC,
      disclaimer: 'PawDoctor AI provides preliminary guidance based on veterinary triage taxonomies and does not replace in-person diagnosis by a licensed veterinarian.',
      createdAt: new Date().toISOString(),
      provider: `${this.name} (Supportive Wellness Protocol)`,
    };
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const lastMsg = req.messages[req.messages.length - 1]?.content || '';
    const q = lastMsg.toLowerCase();
    const petName = req.petContext?.petName || 'your pet';
    const species = req.petContext?.species || 'companion pet';
    const breed = req.petContext?.breed || 'pet';

    let reply = '';
    let urgency: 'low' | 'moderate' | 'emergency' = 'low';
    let suggestedQuestions: string[] = [];

    // Emergency queries
    if (q.includes('chocolate') || q.includes('poison') || q.includes('grape') || q.includes('onion') || q.includes('lily') || q.includes('bleeding')) {
      reply = `🚨 URGENT CLINICAL ALERT for ${petName}: Ingestion of toxic compounds (chocolate/theobromine, grapes, allium plants, lilies) can trigger acute organ failure! Please call Cascade 24/7 Emergency Hospital (+880 1711-998877) or your nearest emergency veterinary facility immediately. Do NOT attempt to induce vomiting at home without direct veterinary guidance.`;
      urgency = 'emergency';
      suggestedQuestions = [
        'What emergency clinic is open right now near me?',
        'What should I bring to the emergency vet hospital?',
        'How can I keep my pet safe during transport?',
      ];
    } else if (q.includes('water') || q.includes('drink') || q.includes('thirsty') || q.includes('thirst') || q.includes('pee') || q.includes('urin')) {
      reply = `💧 Clinical Hydration Analysis for ${petName} (${species}): Noticeable changes in water intake (polydipsia) are very important clinical signs. In ${species}s, increased thirst often points to early kidney changes (CKD), diabetes mellitus, urinary tract infections, or endocrine imbalances. 

Key Guidance:
1. Never withhold water — your pet needs this to flush out metabolic waste.
2. Track daily water intake in milliliters (healthy guideline: 50–60 ml per kg of body weight).
3. Schedule a comprehensive urinalysis and blood chemistry panel with your veterinarian within 24–48 hours.`;
      urgency = 'moderate';
      suggestedQuestions = [
        `What are the early signs of diabetes in a ${species}?`,
        `How is kidney disease diagnosed in ${petName}?`,
        `What tests will the vet run for excessive drinking?`,
      ];
    } else if (q.includes('food') || q.includes('diet') || q.includes('nutrition') || q.includes('eat') || q.includes('feed') || q.includes('calori')) {
      reply = `🥑 Nutritional Strategy for ${petName} (${breed}): A balanced nutritional profile supports coat sheen, immune resilience, and joint longevity. 

Key Nutritional Principles:
- Core Protein: Ensure high-digestibility animal protein (minimum 26% for adult dogs, 32% for adult cats with taurine).
- Hydration: Incorporate rotational wet food or broth toppers to support urinary tract health.
- Forbidden Foods: Always avoid onions, garlic, grapes, raisins, macadamia nuts, and artificial sweetener Xylitol/Birch Bark Extract.`;
      suggestedQuestions = [
        `What is the ideal daily calorie intake for ${petName}?`,
        `What human vegetables and fruits are safe for a ${species}?`,
        `How do I transition ${petName} to a new food safely?`,
      ];
    } else if (q.includes('vaccin') || q.includes('shot') || q.includes('rabies') || q.includes('deworm')) {
      reply = `💉 Preventive Health Protocol for ${petName}: Core immunization is essential for lifelong defense against lethal pathogens.

Recommended Guidelines:
- Core Vaccines: Rabies (every 1–3 years) + DHPP (Dogs) or FVRCP (Cats) every 1–3 years following puppy/kitten boosters.
- Parasite Prevention: Broad-spectrum deworming every 3 months, combined with monthly topical or oral flea/tick prevention.
- Annual Health Screening: Yearly dental wellness checks and fecal flotation tests ensure complete protection.`;
      suggestedQuestions = [
        `What vaccine schedule is required for ${petName}?`,
        `What are common mild side effects after pet vaccinations?`,
        `How often should ${petName} be dewormed?`,
      ];
    } else if (q.includes('limp') || q.includes('leg') || q.includes('paw') || q.includes('walk')) {
      reply = `🐾 Orthopedic Guidance for ${petName}: Limping or favoring a limb signals musculoskeletal discomfort or pad injury.

Immediate Steps:
1. Strict rest: Restrict running, stairs, and jumping on furniture for the next 24 hours.
2. Pad check: Check paw pads for embedded thorns, foxtails, torn nails, or cuts.
3. Crucial Warning: NEVER give human pain medications (Ibuprofen/Paracetamol) — they are toxic to pets.
4. Book an examination if ${petName} cannot bear weight or if lameness persists beyond 24 hours.`;
      urgency = 'moderate';
      suggestedQuestions = [
        `How do I check ${petName}'s paws safely at home?`,
        `What veterinary pain medications are safe for pets?`,
        `When does limping require an emergency X-ray?`,
      ];
    } else {
      reply = `Hello! I am PawDoctor AI, your 24/7 veterinary clinical assistant. I have reviewed your question regarding ${petName} (${species} • ${breed}). 

For "${lastMsg}":
- Maintain a structured daily routine with balanced nutrition, hydration, and regular exercise tailored to ${petName}'s age and breed.
- Closely observe any shifts in behavior, energy levels, or water intake over the next 24 hours.
- If you notice any signs of distress, pain, or gastrointestinal upset, connecting with Dr. Evelyn Martinez at Nuzzle Central Wellness (+880 1711-223344) is always recommended.`;
      suggestedQuestions = [
        `What should I monitor for ${petName} over the next 24 hours?`,
        `What are the most common health concerns for a ${breed}?`,
        `How can I book a wellness visit at Nuzzle Central Wellness?`,
      ];
    }

    return {
      reply,
      suggestedQuestions,
      urgency,
      provider: `${this.name} (Dynamic Taxonomy)`,
      timestamp: new Date().toISOString(),
    };
  }
}
