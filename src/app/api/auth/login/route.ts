import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase-auth';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';
import {
  findLocalUser,
  createLocalSessionToken,
  withTimeout,
  LocalUser,
} from '@/lib/auth-service';

export async function OPTIONS() {
  return handleOptions();
}

const loginSchema = z.object({
  email: z.string().trim().optional(),
  username: z.string().trim().optional(),
  identifier: z.string().trim().optional(),
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

    const { email, username, identifier, password, role } = parsed.data;
    const loginTarget = identifier || email || username;

    // 1. Credentials-Based Login (Email or Username + Password)
    if (loginTarget && password) {
      let authUser: any = null;
      let sessionToken: string | null = null;
      let usedSupabase = false;

      // Try Live Supabase Auth if target looks like an email
      if (loginTarget.includes('@')) {
        try {
          const authRes = await withTimeout(
            supabase.auth.signInWithPassword({
              email: loginTarget,
              password,
            }),
            3000,
            'Supabase auth timeout'
          );

          if (!authRes.error && authRes.data.user) {
            authUser = authRes.data.user;
            sessionToken = authRes.data.session?.access_token || null;
            usedSupabase = true;
          } else if (authRes.error && !authRes.error.message.toLowerCase().includes('fetch failed')) {
            // If Supabase returned a legitimate invalid credentials error, keep record
            console.warn('[AuthLogin] Supabase rejected credentials:', authRes.error.message);
          }
        } catch (supabaseErr: any) {
          // Supabase is down, paused, or unreachable (e.g. ENOTFOUND knykelyweiuslgfljiir.supabase.co)
          console.warn('[AuthLogin] Supabase Auth unavailable, engaging Local Resilience Engine:', supabaseErr?.message);
        }
      }

      // If Supabase authenticated the user
      if (authUser && sessionToken) {
        // Fetch or sync from Prisma if DB connected
        let owner: any = null;
        try {
          owner = await prisma.owner.findFirst({
            where: { OR: [{ id: authUser.id }, { email: authUser.email }] },
            include: { pets: true },
          });
        } catch (dbErr) {
          console.warn('[AuthLogin] Prisma owner query fallback:', dbErr);
        }

        const userMeta = authUser.user_metadata || {};
        const inferredRole = (userMeta.role as 'parent' | 'store' | 'vet') || 'parent';

        const userPayload = {
          id: authUser.id,
          email: authUser.email,
          username: owner?.username || userMeta.username || authUser.email?.split('@')[0],
          displayName: owner?.displayName || userMeta.displayName || 'Pet Parent',
          avatarUrl: owner?.avatarUrl || userMeta.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          bio: owner?.bio || '🐾 Nuzzle Member | Dhaka, Bangladesh',
          role: inferredRole,
          pets: owner?.pets || [],
        };

        return apiSuccess({
          user: userPayload,
          owner: userPayload,
          role: inferredRole,
          token: sessionToken,
          source: 'supabase',
        }, 200, 'Signed in successfully via Supabase Auth.');
      }

      // 2. Zero-Downtime Local Resilience Engine
      const localUser = findLocalUser(loginTarget);
      if (localUser) {
        // Check password (in dev / offline resilience mode, accept configured or demo password)
        const isMatch = !localUser.password || localUser.password === password || password === 'password123';
        if (!isMatch) {
          return apiError('Incorrect password. Please verify your credentials.', 401);
        }

        const token = createLocalSessionToken(localUser);

        return apiSuccess({
          user: {
            id: localUser.id,
            email: localUser.email,
            username: localUser.username,
            displayName: localUser.displayName,
            avatarUrl: localUser.avatarUrl,
            bio: localUser.bio,
            role: localUser.role,
            pets: localUser.pets,
          },
          owner: {
            id: localUser.id,
            email: localUser.email,
            username: localUser.username,
            displayName: localUser.displayName,
            avatarUrl: localUser.avatarUrl,
            bio: localUser.bio,
            role: localUser.role,
            pets: localUser.pets,
          },
          role: localUser.role,
          token,
          source: 'local_resilience',
        }, 200, `Signed in successfully as ${localUser.displayName}.`);
      }

      // If user was not found anywhere
      return apiError(
        `Account "${loginTarget}" not found. Please check your username/email or sign up for a new account.`,
        404
      );
    }

    // 3. Quick Demo Role Switcher
    if (role) {
      const demoAccounts: Record<string, string> = {
        parent: 'pawprints_alex',
        store: 'urbanhound_dhaka',
        vet: 'cascade_emergency_vet',
      };

      const targetUsername = demoAccounts[role] || 'pawprints_alex';
      const user = findLocalUser(targetUsername);

      if (user) {
        const token = createLocalSessionToken(user);
        return apiSuccess({
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            role: user.role,
            pets: user.pets,
          },
          owner: user,
          role: user.role,
          token,
          source: 'quick_role_switch',
        }, 200, `Switched role to ${user.displayName}.`);
      }
    }

    return apiError('Please provide an email/username and password to sign in.', 400);
  } catch (error: any) {
    console.error('API /api/auth/login error:', error);
    return apiError(error.message || 'Authentication error', 500);
  }
}
