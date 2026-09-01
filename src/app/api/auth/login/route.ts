import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase-auth';
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

    const { email, password, role } = parsed.data;

    // 1. Real Credentials Login (Email + Password) via Supabase Auth
    if (email && password) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('email not confirmed')) {
          // If user exists in PostgreSQL, allow direct seamless sign-in
          const dbOwner = await prisma.owner.findFirst({
            where: { email },
            include: { pets: true },
          });
          if (dbOwner) {
            return apiSuccess({
              user: {
                id: dbOwner.id,
                email: dbOwner.email,
                username: dbOwner.username,
                displayName: dbOwner.displayName,
                avatarUrl: dbOwner.avatarUrl,
                bio: dbOwner.bio,
                role: 'parent',
              },
              owner: dbOwner,
              role: 'parent',
              token: `jwt_${dbOwner.id}_${Date.now()}`,
              session: null,
            }, 200, 'Signed in successfully (Email confirmation pending in Supabase).');
          }
        }
        return apiError(authError.message, 401);
      }

      const user = authData.user;
      if (!user) {
        return apiError('Authentication failed. No user found.', 401);
      }

      // Fetch or sync Owner profile from PostgreSQL
      let owner = await prisma.owner.findFirst({
        where: {
          OR: [
            { id: user.id },
            { email: user.email! },
          ],
        },
        include: { pets: true },
      });

      if (!owner) {
        // Upsert if not in DB yet
        const userMeta = user.user_metadata || {};
        owner = await prisma.owner.create({
          data: {
            id: user.id,
            email: user.email!,
            username: userMeta.username || user.email!.split('@')[0],
            displayName: userMeta.displayName || userMeta.username || 'Pet Parent',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            bio: '🐾 Nuzzle Member | Dhaka, Bangladesh',
          },
          include: { pets: true },
        });
      }

      const inferredRole = (user.user_metadata?.role as 'parent' | 'store' | 'vet') || 'parent';

      return apiSuccess({
        user: {
          id: user.id,
          email: user.email,
          username: owner.username,
          displayName: owner.displayName,
          avatarUrl: owner.avatarUrl,
          bio: owner.bio,
          role: inferredRole,
        },
        owner,
        role: inferredRole,
        token: authData.session?.access_token || `jwt_${user.id}_${Date.now()}`,
        refreshToken: authData.session?.refresh_token,
        session: authData.session,
      }, 200, 'Signed in successfully via Supabase Auth.');
    }

    // 2. Quick Demo Role Switcher (For rapid testing)
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

    return apiError('Please provide an email and password to sign in.', 400);
  } catch (error: any) {
    console.error('API /api/auth/login error:', error);
    return apiError(error.message || 'Authentication error', 500);
  }
}
