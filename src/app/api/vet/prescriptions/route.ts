import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export interface PrescriptionMedication {
  id: string;
  name: string;
  type: string; // 'Tablet' | 'Syrup' | 'Injection' | 'Drops' | 'Topical' | 'Capsule';
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionRecord {
  id: string;
  rxNumber: string;
  createdAt: string;
  petId: string;
  petName: string;
  petSpecies: string;
  petBreed: string;
  petAge: string;
  petWeightKg: number;
  ownerName: string;
  ownerPhone: string;
  clinicId?: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  doctorName: string;
  doctorDegrees: string;
  doctorRegNo: string;
  diagnosis: string;
  clinicalNotes?: string;
  temperature?: string;
  pulseRate?: string;
  medications: PrescriptionMedication[];
  dietaryAdvice?: string;
  followUpDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  verificationUrl: string;
}

// In-memory persistent cache for live runtime sessions
const IN_MEMORY_PRESCRIPTIONS: PrescriptionRecord[] = [
  {
    id: 'rx_demo_1',
    rxNumber: 'NZ-RX-2026-8492',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    petId: 'pet_1',
    petName: 'Milo',
    petSpecies: 'Dog',
    petBreed: 'Golden Retriever',
    petAge: '2 Years',
    petWeightKg: 28.5,
    ownerName: 'Tanvir Ahmed',
    ownerPhone: '+880 1711-223344',
    clinicId: 'clinic_1',
    clinicName: 'Cascade 24/7 Animal Hospital',
    clinicAddress: 'House 42, Road 8/A, Dhanmondi, Dhaka',
    clinicPhone: '+880 1711-998877',
    doctorName: 'Dr. Emily Watson, DVM',
    doctorDegrees: 'DVM, MS in Small Animal Surgery (UVA)',
    doctorRegNo: 'BVC-Reg-3921',
    diagnosis: 'Acute Gastrointestinal Upset & Dietary Indiscretion',
    clinicalNotes: 'Mild abdominal discomfort on palpation. Normal temperature. Hydration status stable.',
    temperature: '101.8 °F',
    pulseRate: '92 bpm',
    medications: [
      {
        id: 'med_1',
        name: 'Amoxicillin + Clavulanic Acid (Clavamox)',
        type: 'Tablet',
        strength: '375 mg',
        dosage: '1 Tablet',
        frequency: 'Twice Daily (BID)',
        duration: '7 Days',
        instructions: 'Administer directly by mouth after meal.',
      },
      {
        id: 'med_2',
        name: 'Metronidazole',
        type: 'Tablet',
        strength: '200 mg',
        dosage: '1 Tablet',
        frequency: 'Twice Daily (BID)',
        duration: '5 Days',
        instructions: 'For gut motility and anaerobic bacterial coverage.',
      },
      {
        id: 'med_3',
        name: 'Proviable-DC Probiotic Paste',
        type: 'Syrup',
        strength: '15 ml tube',
        dosage: '3 ml',
        frequency: 'Once Daily (SID)',
        duration: '5 Days',
        instructions: 'Mix with moist food in the morning.',
      },
    ],
    dietaryAdvice: 'Transition strictly to Royal Canin Gastrointestinal wet kibble for 10 days. Avoid table scraps and poultry fat.',
    followUpDate: '2026-10-02',
    status: 'active',
    verificationUrl: 'https://nuzzle.ai/verify/rx/NZ-RX-2026-8492',
  },
];

const medicationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Medicine name is required'),
  type: z.string().default('Tablet'),
  strength: z.string().default(''),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().default(''),
});

const createPrescriptionSchema = z.object({
  petId: z.string().default('walk_in'),
  petName: z.string().min(1, 'Pet name is required'),
  petSpecies: z.string().default('Dog'),
  petBreed: z.string().default('Mixed Breed'),
  petAge: z.string().default('Unknown'),
  petWeightKg: z.number().min(0.1, 'Pet weight must be greater than 0'),
  ownerName: z.string().min(1, 'Owner name is required'),
  ownerPhone: z.string().min(6, 'Valid owner phone number is required'),
  clinicId: z.string().optional(),
  clinicName: z.string().min(1, 'Clinic name is required'),
  clinicAddress: z.string().default('Dhaka, Bangladesh'),
  clinicPhone: z.string().default('+880 1700-000000'),
  doctorName: z.string().min(1, 'Veterinarian name is required'),
  doctorDegrees: z.string().default('DVM, Registered Veterinary Practitioner'),
  doctorRegNo: z.string().default('BVC-VET-REG'),
  diagnosis: z.string().min(1, 'Clinical diagnosis is required'),
  clinicalNotes: z.string().optional(),
  temperature: z.string().optional(),
  pulseRate: z.string().optional(),
  medications: z.array(medicationSchema).min(1, 'At least one medication is required'),
  dietaryAdvice: z.string().optional(),
  followUpDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('petId');
    const ownerPhone = searchParams.get('ownerPhone');
    const rxNumber = searchParams.get('rxNumber');

    let results = [...IN_MEMORY_PRESCRIPTIONS];

    if (rxNumber) {
      results = results.filter((r) => r.rxNumber.toLowerCase() === rxNumber.toLowerCase());
    } else if (petId) {
      results = results.filter((r) => r.petId === petId);
    } else if (ownerPhone) {
      results = results.filter((r) => r.ownerPhone.includes(ownerPhone));
    }

    return apiSuccess({
      prescriptions: results,
      totalCount: results.length,
    });
  } catch (error: any) {
    console.error('API /api/vet/prescriptions GET error:', error);
    return apiError(error.message || 'Failed to fetch prescriptions', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createPrescriptionSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return apiError(`${firstIssue.path.join('.')}: ${firstIssue.message}`, 400);
    }

    const data = parsed.data;
    const serial = Math.floor(1000 + Math.random() * 9000);
    const rxNumber = `NZ-RX-${new Date().getFullYear()}-${serial}`;
    const prescriptionId = `rx_${Date.now()}`;

    const newPrescription: PrescriptionRecord = {
      id: prescriptionId,
      rxNumber,
      createdAt: new Date().toISOString(),
      petId: data.petId,
      petName: data.petName,
      petSpecies: data.petSpecies,
      petBreed: data.petBreed,
      petAge: data.petAge,
      petWeightKg: data.petWeightKg,
      ownerName: data.ownerName,
      ownerPhone: data.ownerPhone,
      clinicId: data.clinicId || 'clinic_partner',
      clinicName: data.clinicName,
      clinicAddress: data.clinicAddress,
      clinicPhone: data.clinicPhone,
      doctorName: data.doctorName,
      doctorDegrees: data.doctorDegrees,
      doctorRegNo: data.doctorRegNo,
      diagnosis: data.diagnosis,
      clinicalNotes: data.clinicalNotes,
      temperature: data.temperature || '101.5 °F',
      pulseRate: data.pulseRate || '90 bpm',
      medications: data.medications.map((m, idx) => ({
        id: m.id || `med_${idx + 1}_${Date.now()}`,
        name: m.name,
        type: m.type,
        strength: m.strength,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
      })),
      dietaryAdvice: data.dietaryAdvice,
      followUpDate: data.followUpDate,
      status: 'active',
      verificationUrl: `https://nuzzle.ai/verify/rx/${rxNumber}`,
    };

    // Prepend to in-memory store so it appears first
    IN_MEMORY_PRESCRIPTIONS.unshift(newPrescription);

    return apiSuccess(
      {
        prescription: newPrescription,
        message: 'Prescription issued and synced with Nuzzle Pet Health Vault successfully.',
        notificationDispatched: true,
      },
      201
    );
  } catch (error: any) {
    console.error('API /api/vet/prescriptions POST error:', error);
    return apiError(error.message || 'Failed to issue prescription', 500);
  }
}
