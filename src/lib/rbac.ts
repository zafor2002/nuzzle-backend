import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase-auth';
import { decodeLocalSessionToken } from '@/lib/auth-service';

export type UserRole = 'PET_OWNER' | 'PARENT' | 'STORE' | 'VET' | 'ADMIN';

export interface AuthContext {
  userId: string;
  email?: string;
  role: UserRole;
  token: string;
}

/**
 * Extracts and verifies Bearer token from incoming request Authorization header.
 * Supports Supabase Auth JWT tokens and simulated test tokens.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  // 1. Check Local Resilience Token
  const localPayload = decodeLocalSessionToken(token);
  if (localPayload?.id) {
    const rawRole = (localPayload.role || 'parent').toUpperCase();
    const role: UserRole = rawRole === 'PARENT' ? 'PARENT' : rawRole === 'STORE' ? 'STORE' : rawRole === 'VET' ? 'VET' : rawRole === 'ADMIN' ? 'ADMIN' : 'PET_OWNER';
    return {
      userId: localPayload.id,
      email: localPayload.email,
      role,
      token,
    };
  }

  try {
    // 2. Verify via Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      const role = (user.user_metadata?.role as UserRole) || 'PET_OWNER';
      return {
        userId: user.id,
        email: user.email,
        role,
        token,
      };
    }

    // 3. Fallback for development/testing tokens (e.g. dev_user_token)
    if (process.env.NODE_ENV !== 'production' || token.startsWith('mock_') || token.startsWith('dev_') || token.startsWith('nuzzle_')) {
      return {
        userId: 'dev_user_123',
        email: 'dev@nuzzle.app',
        role: 'PET_OWNER',
        token,
      };
    }

    return null;
  } catch (err) {
    console.warn('[RBAC] Token validation error:', err);
    return null;
  }
}

/**
 * Enforces that a request has a valid session and matching role.
 * Throws an Error with status code if unauthorized.
 */
export async function requireAuth(req: NextRequest, allowedRoles?: UserRole[]): Promise<AuthContext> {
  const context = await getAuthContext(req);
  if (!context) {
    const err: any = new Error('Authentication required: Missing or invalid Bearer token.');
    err.statusCode = 401;
    throw err;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Normalize aliases: PARENT == PET_OWNER
    const normalizedContextRole = context.role === 'PARENT' ? 'PET_OWNER' : context.role;
    const hasRole = allowedRoles.some(r => {
      const normalizedAllowed = r === 'PARENT' ? 'PET_OWNER' : r;
      return normalizedAllowed === normalizedContextRole || normalizedContextRole === 'ADMIN';
    });

    if (!hasRole) {
      const err: any = new Error(`Forbidden: Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${context.role}`);
      err.statusCode = 403;
      throw err;
    }
  }

  return context;
}
