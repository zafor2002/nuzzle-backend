import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase-auth';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    let authenticatedUserId: string | null = null;
    let supabaseUser: any = null;

    if (token) {
      // Validate Bearer token via Supabase Auth
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
          supabaseUser = data.user;
          authenticatedUserId = data.user.id;
        }
      } catch (authErr) {
        console.warn('Supabase auth token validation error:', authErr);
      }
    }

    let owner = null;

    if (authenticatedUserId && supabaseUser) {
      const email = supabaseUser.email;

      // 1. First look up by Supabase user ID OR by email to prevent unique constraint crashes
      try {
        owner = await prisma.owner.findFirst({
          where: {
            OR: [
              { id: authenticatedUserId },
              ...(email ? [{ email }] : []),
            ],
          },
          include: {
            pets: {
              include: {
                healthLogs: true,
              },
            },
          },
        });
      } catch (findErr) {
        console.warn('Error querying owner by ID/email:', findErr);
      }

      // 2. If owner does not exist in DB yet, auto-provision safely
      if (!owner) {
        const meta = supabaseUser.user_metadata || {};
        const safeEmail = email || `user_${authenticatedUserId.slice(0, 8)}@nuzzle.ai`;
        const displayName = meta.full_name || meta.name || safeEmail.split('@')[0] || 'Pet Parent';
        const baseUsername = safeEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user';
        let username = `${baseUsername}_${authenticatedUserId.slice(0, 4)}`;
        const avatarUrl = meta.avatar_url || meta.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

        try {
          // Check for existing username collision
          const existingUsername = await prisma.owner.findUnique({ where: { username } }).catch(() => null);
          if (existingUsername) {
            username = `${baseUsername}_${Date.now().toString().slice(-4)}`;
          }

          owner = await prisma.owner.create({
            data: {
              id: authenticatedUserId,
              email: safeEmail,
              username,
              displayName,
              avatarUrl,
              bio: '🐾 Pet lover on Nuzzle • Welcome to Dhaka\'s Pet Community!',
            },
            include: {
              pets: {
                include: {
                  healthLogs: true,
                },
              },
            },
          });
        } catch (createErr: any) {
          console.warn('Prisma create owner collision, recovering via findFirst:', createErr?.message);
          // Safe recovery: find by email or id
          try {
            owner = await prisma.owner.findFirst({
              where: {
                OR: [
                  { email: safeEmail },
                  { id: authenticatedUserId },
                ],
              },
              include: {
                pets: {
                  include: {
                    healthLogs: true,
                  },
                },
              },
            });
          } catch (recoveryErr) {
            console.warn('Recovery query failed:', recoveryErr);
          }
        }
      }
    }

    if (!owner && !authenticatedUserId) {
      try {
        owner = await prisma.owner.findFirst({
          include: {
            pets: {
              include: {
                healthLogs: true,
              },
            },
          },
        });
      } catch (e) {
        console.warn('Fallback findFirst owner error:', e);
      }
    }

    if (!owner) {
      // Clean Fresh Profile Fallback (never crash)
      const meta = supabaseUser?.user_metadata || {};
      const safeEmail = supabaseUser?.email;
      return apiSuccess({
        id: authenticatedUserId || 'owner_me',
        username: supabaseUser ? (safeEmail?.split('@')[0] || 'pet_parent') : 'new_member',
        displayName: meta.full_name || meta.name || safeEmail?.split('@')[0] || 'New Member',
        avatarUrl: meta.avatar_url || meta.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        bio: '🐾 Pet lover on Nuzzle • Welcome to Dhaka\'s Pet Community!',
        isAnonymous: false,
        followersCount: 0,
        followingCount: 0,
        pets: [],
      });
    }

    return apiSuccess(owner);
  } catch (error: any) {
    console.error('API /api/auth/me error:', error);
    return apiError(error.message || 'Failed to fetch current user session', 500);
  }
}
