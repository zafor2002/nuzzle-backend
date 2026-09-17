import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase-auth';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';
import {
  decodeLocalSessionToken,
  findLocalUserById,
  findLocalUser,
  withTimeout,
} from '@/lib/auth-service';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    // 1. Check for Local Resilience Token (e.g. nuzzle_local_* or nuzzle_token_*)
    if (token) {
      const localPayload = decodeLocalSessionToken(token);
      if (localPayload?.id) {
        const localUser = findLocalUserById(localPayload.id) || findLocalUser(localPayload.username || localPayload.email);
        if (localUser) {
          return apiSuccess({
            id: localUser.id,
            email: localUser.email,
            username: localUser.username,
            displayName: localUser.displayName,
            avatarUrl: localUser.avatarUrl,
            bio: localUser.bio,
            role: localUser.role,
            isAnonymous: false,
            followersCount: 142,
            followingCount: 89,
            pets: localUser.pets || [],
          }, 200, 'User session restored from Local Resilience Store.');
        }
      }

      // 2. If it's a Supabase JWT, attempt verification with timeout
      try {
        const authRes = await withTimeout(
          supabase.auth.getUser(token),
          2500,
          'Supabase session validation timeout'
        );

        if (!authRes.error && authRes.data.user) {
          const user = authRes.data.user;
          let dbOwner: any = null;

          try {
            dbOwner = await prisma.owner.findFirst({
              where: { OR: [{ id: user.id }, { email: user.email! }] },
              include: { pets: true },
            });
          } catch (dbErr) {
            console.warn('[AuthMe] Prisma lookup skipped:', dbErr);
          }

          const meta = user.user_metadata || {};
          return apiSuccess({
            id: user.id,
            email: user.email,
            username: dbOwner?.username || meta.username || user.email?.split('@')[0],
            displayName: dbOwner?.displayName || meta.displayName || 'Pet Parent',
            avatarUrl: dbOwner?.avatarUrl || meta.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            bio: dbOwner?.bio || '🐾 Nuzzle Member | Dhaka, Bangladesh',
            role: meta.role || 'parent',
            isAnonymous: false,
            followersCount: 120,
            followingCount: 65,
            pets: dbOwner?.pets || [],
          }, 200, 'User session restored from Supabase.');
        }
      } catch (authErr) {
        console.warn('[AuthMe] Supabase validation unavailable:', authErr);
      }
    }

    // 3. Fallback: Return primary demo user (Alex Rivers) with companion Waffles
    const defaultUser = findLocalUser('pawprints_alex');
    if (defaultUser) {
      return apiSuccess({
        id: defaultUser.id,
        email: defaultUser.email,
        username: defaultUser.username,
        displayName: defaultUser.displayName,
        avatarUrl: defaultUser.avatarUrl,
        bio: defaultUser.bio,
        role: defaultUser.role,
        isAnonymous: false,
        followersCount: 248,
        followingCount: 112,
        pets: defaultUser.pets,
      }, 200, 'Default active session retrieved.');
    }

    return apiSuccess({
      id: 'owner_me',
      username: 'pawprints_alex',
      displayName: 'Alex Rivers',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: '🐾 Golden retriever dad & Siamese cat servant | Nature hiker | Dhaka',
      role: 'parent',
      isAnonymous: false,
      followersCount: 248,
      followingCount: 112,
      pets: [],
    });
  } catch (error: any) {
    console.error('API /api/auth/me error:', error);
    return apiError(error.message || 'Failed to fetch current user session', 500);
  }
}
