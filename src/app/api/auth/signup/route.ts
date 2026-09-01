import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase-auth';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

const signupSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(72),
  username: z.string().trim().toLowerCase().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),
  displayName: z.string().trim().min(1).max(100),
  role: z.enum(['parent', 'store', 'vet']).default('parent'),
  storeCategory: z.string().optional(),
  clinicName: z.string().optional(),
  petName: z.string().optional(),
  petSpecies: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, parsed.error.format());
    }

    const { email, password, username, displayName, role, storeCategory, clinicName, petName, petSpecies } = parsed.data;

    // 1. Check if user already exists in PostgreSQL
    const existingUser = await prisma.owner.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return apiError('An account with this email or username already exists.', 409);
    }

    // 2. Register User in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          displayName,
          role,
        },
      },
    });

    if (authError) {
      return apiError(authError.message, 400);
    }

    const userId = authData.user?.id || `usr_${Date.now()}`;

    // 3. Create linked Owner in PostgreSQL database
    const newOwner = await prisma.owner.upsert({
      where: { id: userId },
      update: {
        email,
        username,
        displayName,
      },
      create: {
        id: userId,
        email,
        username,
        displayName,
        avatarUrl: role === 'vet' 
          ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80'
          : role === 'store'
          ? 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        bio: role === 'store' 
          ? `Verified Pet Boutique (${storeCategory || 'Pet Supplies'}) • Dhaka, Bangladesh`
          : role === 'vet'
          ? `Veterinary Practitioner at ${clinicName || 'Nuzzle Partner Clinic'} • Dhaka`
          : '🐾 Pet Parent in Dhaka | Animal Lover',
      },
    });

    // 4. If pet information was supplied, create the initial Pet profile
    let initialPet = null;
    if (petName) {
      initialPet = await prisma.pet.create({
        data: {
          id: `pet_${Date.now()}`,
          name: petName,
          species: petSpecies || 'Dog',
          breed: petSpecies === 'Cat' ? 'Domestic Shorthair' : 'Golden Retriever',
          avatarUrl: petSpecies === 'Cat' 
            ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&auto=format&fit=crop&q=80',
          bio: `Loved companion of ${displayName}`,
          ownerId: newOwner.id,
        },
      });
    }

    const token = authData.session?.access_token || `jwt_${userId}_${Date.now()}`;
    const refreshToken = authData.session?.refresh_token;

    return apiSuccess({
      user: {
        id: userId,
        email,
        username,
        displayName,
        role,
        avatarUrl: newOwner.avatarUrl,
        bio: newOwner.bio,
      },
      owner: newOwner,
      pet: initialPet,
      token,
      refreshToken,
      session: authData.session,
    }, 201, 'Account created successfully in Supabase.');
  } catch (error: any) {
    console.error('API /api/auth/signup error:', error);
    return apiError(error.message || 'Internal server error during registration', 500);
  }
}
