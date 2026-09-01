import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'all', 'lost', 'found', 'emergency'

    const reports = [
      {
        id: 'lf_1',
        type: 'lost',
        petName: 'Rusty',
        species: 'Dog',
        breed: 'Golden Cocker Spaniel',
        lastSeenLocation: 'Gulshan-2 Circle (Near Park), Dhaka',
        lastSeenDate: 'Today, 2:30 PM',
        reward: '৳ 5,000 BDT',
        description: 'Wearing a red collar with silver bell. Very friendly, answers to whistle.',
        mediaUrls: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80'],
        contactPhone: '+880 1711-234567',
        isResolved: false,
        distanceMiles: 0.8,
        matchScore: 94,
        isClaimed: false,
        claimedBy: null,
      },
      {
        id: 'lf_2',
        type: 'emergency_rescue',
        petName: 'Injured Street Pup',
        species: 'Dog',
        breed: 'Deshi Stray Pup',
        lastSeenLocation: 'Dhanmondi Lake Walkway (Bridge 3)',
        lastSeenDate: 'Today, 11:15 AM',
        description: 'Limping on front right paw after getting stuck near railing. Needs immediate first aid triage.',
        mediaUrls: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80'],
        contactPhone: '+880 1819-887766',
        isResolved: false,
        distanceMiles: 1.4,
        isClaimed: true,
        claimedBy: 'Volunteer Farhan (PAW Rescue)',
        claimedAt: '15m ago',
      },
      {
        id: 'lf_3',
        type: 'found',
        petName: 'Found Cat (Calico)',
        species: 'Cat',
        breed: 'Calico Short Hair',
        lastSeenLocation: 'Banani Block D, Road 11',
        lastSeenDate: 'Yesterday Evening',
        description: 'Found resting inside apartment garage. Well groomed and vocal. Looking for rightful parent.',
        mediaUrls: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80'],
        contactPhone: '+880 1912-334455',
        isResolved: false,
        distanceMiles: 2.1,
        matchScore: 88,
        isClaimed: false,
        claimedBy: null,
      },
    ];

    const filtered = filter && filter !== 'all' 
      ? reports.filter(r => r.type === filter || (filter === 'emergency' && r.type === 'emergency_rescue'))
      : reports;

    return apiSuccess(filtered);
  } catch (error: any) {
    console.error('API /api/lost-found GET error:', error);
    return apiError(error.message || 'Failed to fetch lost & found reports', 500);
  }
}

const createReportSchema = z.object({
  type: z.enum(['lost', 'found', 'emergency_rescue']),
  petName: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().optional(),
  lastSeenLocation: z.string().min(1),
  description: z.string().min(1),
  mediaUrls: z.array(z.string()).default([]),
  contactPhone: z.string().min(1),
  reward: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const newReport = {
      id: `lf_${Date.now()}`,
      ...data,
      lastSeenDate: 'Just now',
      isResolved: false,
      distanceMiles: 0.1,
      matchScore: 98,
      isClaimed: false,
      claimedBy: null,
    };

    return apiSuccess(newReport, 201, '5-Mile Emergency Radar report broadcasted successfully.');
  } catch (error: any) {
    console.error('API /api/lost-found POST error:', error);
    return apiError(error.message || 'Failed to create report', 500);
  }
}
