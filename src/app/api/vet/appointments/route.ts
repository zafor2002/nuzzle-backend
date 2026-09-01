import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const appointments = [
      {
        id: 'apt_1',
        ownerId: 'owner_me',
        petId: 'pet_1',
        petName: 'Waffles',
        petAvatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80',
        vetId: 'vet_1',
        vetName: 'Dr. Emily Watson, DVM',
        clinicName: 'Bark & Purr Veterinary Center',
        date: 'Tomorrow',
        time: '10:30 AM',
        reason: 'Annual Vaccination Booster & Dental Check',
        status: 'confirmed',
        location: 'Dhanmondi Road 27, Dhaka',
        price: '৳ 1,500 BDT',
      },
    ];

    return apiSuccess(appointments);
  } catch (error: any) {
    console.error('API /api/vet/appointments GET error:', error);
    return apiError(error.message || 'Failed to fetch appointments', 500);
  }
}

const bookAptSchema = z.object({
  ownerId: z.string().default('owner_me'),
  petId: z.string().min(1),
  petName: z.string().min(1),
  vetId: z.string().min(1),
  vetName: z.string().min(1),
  clinicName: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  reason: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookAptSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const newAppointment = {
      id: `apt_${Date.now()}`,
      ...data,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      confirmationCode: `NZL-VET-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    return apiSuccess(newAppointment, 201, 'Veterinary consultation booked successfully.');
  } catch (error: any) {
    console.error('API /api/vet/appointments POST error:', error);
    return apiError(error.message || 'Failed to book appointment', 500);
  }
}
