import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

const signupSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(72),
  username: z.string().trim().toLowerCase().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),
  displayName: z.string().trim().min(1).max(100),
  role: z.enum(['parent', 'store', 'vet']).default('parent'),
  storeCategory: z.string().optional(),
  clinicName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, parsed.error.format());
    }

    const { email, username, displayName, role, storeCategory, clinicName } = parsed.data;

    const existingUser = await prisma.owner.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return apiError('An account with this email or username already exists.', 409);
    }

    // Create Owner in database
    const ownerId = `owner_${Date.now()}`;
    const newOwner = await prisma.owner.create({
      data: {
        id: ownerId,
        email,
        username,
        displayName,
        avatarUrl: role === 'vet' 
          ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        bio: role === 'store' 
          ? `Verified Pet Boutique (${storeCategory || 'Pet Supplies'}) • Dhaka, Bangladesh`
          : role === 'vet'
          ? `Veterinary Practitioner at ${clinicName || 'Nuzzle Partner Clinic'} • Dhaka`
          : '🐾 Pet Parent in Dhaka | Animal Lover',
      },
    });

    return apiSuccess({
      owner: newOwner,
      role,
      token: `nuzzle_jwt_${ownerId}_${Date.now()}`,
    }, 201, 'Account created successfully.');
  } catch (error: any) {
    console.error('API /api/auth/signup error:', error);
    return apiError(error.message || 'Internal server error during registration', 500);
  }
}
