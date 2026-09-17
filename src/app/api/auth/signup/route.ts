import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase-auth';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';
import {
  findLocalUser,
  createLocalUser,
  createLocalSessionToken,
  withTimeout,
} from '@/lib/auth-service';

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

    // 1. Check if user already exists in Local Store
    const localExisting = findLocalUser(email) || findLocalUser(username);
    if (localExisting) {
      return apiError('An account with this email or username already exists.', 409);
    }

    // 2. Check if user exists in PostgreSQL (safe wrapper)
    try {
      const dbExisting = await prisma.owner.findFirst({
        where: { OR: [{ email }, { username }] },
      });
      if (dbExisting) {
        return apiError('An account with this email or username already exists.', 409);
      }
    } catch (dbErr) {
      console.warn('[AuthSignup] Prisma database check skipped (resilience mode):', dbErr);
    }

    // 3. Attempt Live Supabase Auth Registration (with circuit-breaker timeout)
    let supabaseUserId: string | null = null;
    let sessionToken: string | null = null;
    let usedSupabase = false;

    try {
      const authRes = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              displayName,
              role,
            },
          },
        }),
        3000,
        'Supabase signup timeout'
      );

      if (!authRes.error && authRes.data.user) {
        supabaseUserId = authRes.data.user.id;
        sessionToken = authRes.data.session?.access_token || null;
        usedSupabase = true;
      } else if (authRes.error) {
        console.warn('[AuthSignup] Supabase signup error:', authRes.error.message);
      }
    } catch (supabaseErr: any) {
      console.warn('[AuthSignup] Supabase Auth unavailable during registration, saving to Local Store:', supabaseErr?.message);
    }

    // 4. Create user in Local Resilience Store (guarantees zero downtime)
    const localUser = createLocalUser({
      email,
      username,
      password,
      displayName,
      role,
      storeCategory,
      clinicName,
      petName,
      petSpecies,
    });

    // 5. Attempt PostgreSQL sync if available
    try {
      const targetId = supabaseUserId || localUser.id;
      await prisma.owner.upsert({
        where: { id: targetId },
        update: { email, username, displayName },
        create: {
          id: targetId,
          email,
          username,
          displayName,
          avatarUrl: localUser.avatarUrl,
          bio: localUser.bio,
        },
      });

      if (petName) {
        await prisma.pet.create({
          data: {
            id: `pet_${Date.now()}`,
            name: petName,
            species: petSpecies || 'Dog',
            breed: petSpecies === 'Cat' ? 'Domestic Shorthair' : 'Companion',
            avatarUrl: localUser.pets[0]?.avatarUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300',
            bio: `Loved pet of ${displayName}`,
            ownerId: targetId,
          },
        });
      }
    } catch (prismaErr) {
      console.warn('[AuthSignup] Prisma persistence skipped (offline/resilience mode):', prismaErr);
    }

    const token = sessionToken || createLocalSessionToken(localUser);

    return apiSuccess({
      user: {
        id: localUser.id,
        email: localUser.email,
        username: localUser.username,
        displayName: localUser.displayName,
        role: localUser.role,
        avatarUrl: localUser.avatarUrl,
        bio: localUser.bio,
      },
      owner: localUser,
      pet: localUser.pets[0] || null,
      token,
      source: usedSupabase ? 'supabase' : 'local_resilience',
    }, 201, `Account for ${displayName} created successfully.`);
  } catch (error: any) {
    console.error('API /api/auth/signup error:', error);
    return apiError(error.message || 'Internal server error during registration', 500);
  }
}
