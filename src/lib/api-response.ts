import { NextRequest, NextResponse } from 'next/server';
import { logRequest, logError } from './logger';
import { rateLimit } from './rate-limit';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: unknown;
  meta?: Record<string, unknown>;
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Client-Version',
};

export function apiSuccess<T>(data: T, status = 200, message?: string, meta?: Record<string, unknown>) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      message,
      meta,
    },
    {
      status,
      headers: {
        ...CORS_HEADERS,
      },
    }
  );
}

export function apiError(message: string, status = 400, errors?: unknown) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: message,
      errors,
    },
    {
      status,
      headers: {
        ...CORS_HEADERS,
      },
    }
  );
}

export function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
    },
  });
}

/**
 * Higher-order wrapper for Next.js REST API route handlers.
 * Automatically handles:
 *  1. Performance monitoring (measures latency and sets X-Response-Time header)
 *  2. Ingress rate limiting (default 120 reqs/min per IP)
 *  3. Centralized structured logging and error tracking
 *  4. Uniform JSON error envelopes for unhandled exceptions
 */
export function withErrorHandler<T = any>(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse<ApiResponse<T>> | NextResponse>
) {
  return async (req: NextRequest, context?: any) => {
    const startTime = performance.now();
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // 1. Rate Limiting Check (120 req/minute)
    const isAllowed = rateLimit(`ip:${clientIp}`, 120, 60 * 1000);
    if (!isAllowed) {
      logRequest({
        method: req.method,
        path: req.nextUrl.pathname,
        statusCode: 429,
        durationMs: performance.now() - startTime,
        message: `Rate limit exceeded for IP ${clientIp}`,
      });
      return apiError('Rate limit exceeded. Please try again in 60 seconds.', 429);
    }

    try {
      const response = await handler(req, context);
      const durationMs = performance.now() - startTime;
      
      // Inject performance monitoring header
      response.headers.set('X-Response-Time', `${durationMs.toFixed(2)}ms`);
      Object.entries(CORS_HEADERS).forEach(([k, v]) => response.headers.set(k, v));

      logRequest({
        method: req.method,
        path: req.nextUrl.pathname,
        statusCode: response.status,
        durationMs,
        message: 'Request processed successfully',
      });

      return response;
    } catch (err: any) {
      const durationMs = performance.now() - startTime;
      const status = typeof err.statusCode === 'number' ? err.statusCode : 500;
      const errorMessage = err.message || 'Internal Server Error';

      logError(`Unhandled error in ${req.method} ${req.nextUrl.pathname}: ${errorMessage}`, err, {
        path: req.nextUrl.pathname,
        method: req.method,
        statusCode: status,
      });

      const errResponse = apiError(errorMessage, status, err.errors || undefined);
      errResponse.headers.set('X-Response-Time', `${durationMs.toFixed(2)}ms`);
      Object.entries(CORS_HEADERS).forEach(([k, v]) => errResponse.headers.set(k, v));
      return errResponse;
    }
  };
}
