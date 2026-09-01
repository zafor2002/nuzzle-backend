import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const species = searchParams.get('species');

    const adoptions = [
      {
        id: 'adopt_1',
        name: 'Milo & Luna',
        species: 'Cat',
        breed: 'Domestic Short Hair (Bonded Pair)',
        age: '6 months',
        gender: 'Male & Female',
        organizationName: 'Dhaka Animal Welfare Shelter (DAWS)',
        organizationAvatar: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=200&auto=format&fit=crop&q=80',
        location: 'Dhanmondi, Dhaka',
        vaccinated: true,
        neutered: true,
        microchipped: true,
        adoptionFee: 'Free (Adoption Agreement Required)',
        mediaUrls: ['https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=800&auto=format&fit=crop&q=80'],
        bio: 'Inseparable brother and sister rescued from Dhanmondi. Playful, litter-box trained, and love cuddles.',
        matchPercentage: 96,
      },
      {
        id: 'adopt_2',
        name: 'Biscuit',
        species: 'Dog',
        breed: 'Deshi Indie Pup',
        age: '3 months',
        gender: 'Male',
        organizationName: 'PAW Foundation Bangladesh',
        organizationAvatar: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=200&auto=format&fit=crop&q=80',
        location: 'Uttara, Dhaka',
        vaccinated: true,
        neutered: false,
        microchipped: true,
        adoptionFee: 'Free',
        mediaUrls: ['https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&auto=format&fit=crop&q=80'],
        bio: 'Brave, intelligent, and super affectionate pup. Great with children and eager to learn tricks.',
        matchPercentage: 92,
      },
    ];

    const filtered = species && species !== 'All'
      ? adoptions.filter(a => a.species.toLowerCase() === species.toLowerCase())
      : adoptions;

    return apiSuccess(filtered);
  } catch (error: any) {
    console.error('API /api/adoption GET error:', error);
    return apiError(error.message || 'Failed to fetch adoption listings', 500);
  }
}

const createAdoptionSchema = z.object({
  name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().optional(),
  age: z.string().min(1),
  gender: z.string().min(1),
  organizationName: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(1),
  mediaUrls: z.array(z.string()).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createAdoptionSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const newAdoption = {
      id: `adopt_${Date.now()}`,
      ...data,
      vaccinated: true,
      neutered: false,
      microchipped: true,
      adoptionFee: 'Free',
      matchPercentage: 95,
      createdAt: 'Just now',
    };

    return apiSuccess(newAdoption, 201, 'Adoption listing posted successfully.');
  } catch (error: any) {
    console.error('API /api/adoption POST error:', error);
    return apiError(error.message || 'Failed to create adoption listing', 500);
  }
}
