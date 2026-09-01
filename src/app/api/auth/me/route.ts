import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    // If token exists, try to locate owner or return default profile
    let owner = await prisma.owner.findFirst({
      include: {
        pets: {
          include: {
            healthLogs: true,
          },
        },
      },
    });

    if (!owner) {
      // Return default starter profile
      return apiSuccess({
        id: 'owner_me',
        username: 'pawprints_alex',
        displayName: 'Alex Rivers',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: '🐾 Golden retriever dad & Siamese cat servant | Nature hiker | Pet nutrition enthusiast 🥑',
        isAnonymous: false,
        followersCount: 1420,
        followingCount: 388,
        pets: [
          {
            id: 'pet_1',
            name: 'Waffles',
            species: 'Dog',
            breed: 'Golden Retriever',
            avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80',
            age: '2 yrs 4 mos',
            weight: '29.5 kg',
            microchipId: '985-1410-0921-334',
            aiPersonality: 'Silly Goofball & Master Fetcher',
            energyLevel: 'High Zoomies',
          },
          {
            id: 'pet_2',
            name: 'Mochi',
            species: 'Cat',
            breed: 'Siamese mix',
            avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80',
            age: '1 yr 8 mos',
            weight: '4.2 kg',
            microchipId: '985-1410-0921-889',
            aiPersonality: 'Sunbeam Connoisseur & Silent Judge',
            energyLevel: 'Midnight Sprint',
          },
        ],
      });
    }

    return apiSuccess(owner);
  } catch (error: any) {
    console.error('API /api/auth/me error:', error);
    return apiError(error.message || 'Failed to fetch current user session', 500);
  }
}
