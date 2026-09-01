import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

const triageSchema = z.object({
  petName: z.string().default('Pet'),
  species: z.string().default('Dog'),
  age: z.string().optional(),
  symptoms: z.string().min(3),
  duration: z.string().optional(),
  isProSubscriber: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = triageSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { petName, species, symptoms } = parsed.data;
    const lower = symptoms.toLowerCase();

    let urgency: 'low' | 'moderate' | 'emergency' = 'moderate';
    let urgencyLabel = 'Schedule Vet Visit (24-48h)';
    let urgencyColor = '#F59E0B';
    let summary = `Our clinical triage engine analyzed ${petName}'s symptoms. Non-emergency clinical evaluation recommended.`;
    let recommendedActions: string[] = [
      'Ensure access to clean, fresh water at all times.',
      'Keep your pet indoors in a calm, temperature-controlled room.',
      'Record a 15-second video of any unusual behavior or posture for your veterinarian.',
    ];
    let redFlags: string[] = [
      'Pale, bluish, or white gums',
      'Difficulty breathing or rapid shallow panting',
      'Repeated unproductive vomiting or swelling of abdomen',
    ];

    // High Urgency / Emergency Detection Keywords (Bangla & English)
    if (
      lower.includes('blood') ||
      lower.includes('bleeding') ||
      lower.includes('choking') ||
      lower.includes('breathe') ||
      lower.includes('breathing') ||
      lower.includes('collapse') ||
      lower.includes('unconscious') ||
      lower.includes('seizure') ||
      lower.includes('poison') ||
      lower.includes('chocolate') ||
      lower.includes('vomit blood') ||
      lower.includes('রক্ত') ||
      lower.includes('শ্বাসকষ্ট') ||
      lower.includes('বিষ')
    ) {
      urgency = 'emergency';
      urgencyLabel = 'Emergency Care Required (Immediate)';
      urgencyColor = '#EF4444';
      summary = `⚠️ CRITICAL: The symptoms described ("${symptoms}") indicate a potentially life-threatening condition requiring immediate hands-on emergency veterinary care.`;
      recommendedActions = [
        'Transport your pet to the nearest 24/7 Emergency Veterinary Hospital immediately.',
        'Keep pet calm, warm, and minimize physical movement during transport.',
        'Do NOT administer human medications (e.g. Paracetamol/Aspirin are toxic to pets).',
        'Call the clinic ahead while en route so trauma staff can prepare.',
      ];
      redFlags = [
        'Extreme lethargy or unresponsiveness',
        'Inability to stand or walk',
        'Persistent seizures lasting >2 minutes',
      ];
    } else if (
      lower.includes('itch') ||
      lower.includes('scratch') ||
      lower.includes('sleepy') ||
      lower.includes('mild') ||
      lower.includes('tick') ||
      lower.includes('খুশকি') ||
      lower.includes('চুলকানি')
    ) {
      urgency = 'low';
      urgencyLabel = 'Monitor at Home';
      urgencyColor = '#10B981';
      summary = `${petName} is exhibiting mild symptoms that can likely be monitored comfortably at home with hydration and observation over the next 24 hours.`;
      recommendedActions = [
        'Check coat for external parasites or environmental allergens.',
        'Provide small, bland meals (e.g. boiled chicken & rice for dogs).',
        'Avoid strenuous exercise or direct midday heat.',
      ];
    }

    const responseData = {
      triageId: `trg_${Date.now()}`,
      petName,
      species,
      urgency,
      urgencyLabel,
      urgencyColor,
      summary,
      recommendedActions,
      redFlags,
      recommendedClinic: {
        id: 'vet_3',
        name: 'Dr. Sarah Al-Mansoor, DVM',
        clinicName: 'Cascade 24/7 Emergency & Surgical Hospital',
        phone: '+880 1711-998877',
        location: 'Gulshan-2 / Dhanmondi, Dhaka',
        isProPriority: true,
      },
      disclaimer: 'PawDoctor AI provides preliminary guidance based on veterinary triage taxonomies and does not replace in-person diagnosis by a licensed veterinarian.',
      createdAt: new Date().toISOString(),
    };

    return apiSuccess(responseData, 200, 'Triage analysis completed.');
  } catch (error: any) {
    console.error('API /api/pawai/triage error:', error);
    return apiError(error.message || 'Triage processing failed', 500);
  }
}
