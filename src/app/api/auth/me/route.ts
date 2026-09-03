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

    if (token) {
      // Validate Bearer token via Supabase Auth
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        authenticatedUserId = data.user.id;
      }
    }

    let owner = null;

    if (authenticatedUserId) {
      owner = await prisma.owner.findUnique({
        where: { id: authenticatedUserId },
        include: {
          pets: {
            include: {
              healthLogs: true,
            },
          },
        },
      });
    }

    if (authenticatedUserId && !owner) {
      // Auto-provision fresh Owner for OAuth/Google users
      const { data } = await supabase.auth.getUser(token);
      const user = data?.user;
      if (user) {
        const meta = user.user_metadata || {};
        const email = user.email || `user_${user.id.slice(0, 8)}@nuzzle.ai`;
        const displayName = meta.full_name || meta.name || email.split('@')[0];
        const username = (email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user') + '_' + user.id.slice(0, 4);
        const avatarUrl = meta.avatar_url || meta.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

        owner = await prisma.owner.upsert({
          where: { id: authenticatedUserId },
          create: {
            id: authenticatedUserId,
            email,
            username,
            displayName,
            avatarUrl,
            bio: '🐾 Pet lover on Nuzzle • Welcome to Dhaka\'s Pet Community!',
          },
          update: {},
          include: {
            pets: {
              include: {
                healthLogs: true,
              },
            },
          },
        });
      }
    }

    if (!owner && !authenticatedUserId) {
      owner = await prisma.owner.findFirst({
        include: {
          pets: {
            include: {
              healthLogs: true,
            },
          },
        },
      });
    }

    if (!owner) {
      // Clean Fresh Profile Fallback
      return apiSuccess({
        id: authenticatedUserId || 'owner_me',
        username: 'new_member',
        displayName: 'New Member',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
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
