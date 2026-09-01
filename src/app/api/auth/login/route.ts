import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

const loginSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(1).optional(),
  role: z.enum(['parent', 'store', 'vet']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const { email, role } = parsed.data;

    // Support quick demo logins by role
    if (role) {
      const demoAccounts: Record<string, any> = {
        parent: {
          id: 'owner_me',
          email: 'alex.rivers@nuzzle.ai',
          username: 'pawprints_alex',
          displayName: 'Alex Rivers',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          bio: '🐾 Golden retriever dad & Siamese cat servant | Nature hiker | Pet nutrition enthusiast 🥑',
          role: 'parent',
        },
        store: {
          id: 'owner_urbanhound',
          email: 'shop@urbanhound.bd',
          username: 'urbanhound_dhaka',
          displayName: 'UrbanHound Dhaka Official Store',
          avatarUrl: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=200&auto=format&fit=crop&q=80',
          bio: 'Verified Premium Canine & Feline Gear Workshop • Official Nuzzle Verified Boutique • Gulshan-2, Dhaka',
          role: 'store',
          storeCategory: 'Premium Pet Gear & Nutritional Treats',
        },
        vet: {
          id: 'owner_drsarah',
          email: 'clinic@cascadevet.bd',
          username: 'cascade_emergency_vet',
          displayName: 'Dr. Sarah Al-Mansoor, DVM',
          avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
          bio: 'Board-Certified Veterinary Surgeon • Cascade 24/7 Emergency & Surgical Hospital • Dhanmondi',
          role: 'vet',
          clinicName: 'Cascade 24/7 Animal Hospital',
        },
      };

      const selected = demoAccounts[role] || demoAccounts.parent;
      return apiSuccess({
        owner: selected,
        role: selected.role,
        token: `nuzzle_token_${selected.id}_${Date.now()}`,
      }, 200, 'Logged in successfully via quick role switch.');
    }

    if (!email) {
      return apiError('Email is required for authentication.', 400);
    }

    const owner = await prisma.owner.findUnique({
      where: { email },
      include: { pets: true },
    });

    if (!owner) {
      return apiError('Invalid email or password.', 401);
    }

    return apiSuccess({
      owner,
      role: 'parent',
      token: `nuzzle_token_${owner.id}_${Date.now()}`,
    }, 200, 'Authentication successful.');
  } catch (error: any) {
    console.error('API /api/auth/login error:', error);
    return apiError(error.message || 'Authentication error', 500);
  }
}
