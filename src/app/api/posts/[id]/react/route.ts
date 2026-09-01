import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

const reactSchema = z.object({
  reaction: z.enum(['paw', 'nuzzle', 'treat', 'ball', 'purr']),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = reactSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('Invalid reaction type. Must be paw, nuzzle, treat, ball, or purr.', 400);
    }

    const { reaction } = parsed.data;

    return apiSuccess({
      postId: id,
      reaction,
      message: `Reacted with ${reaction} 🐾`,
    }, 200);
  } catch (error: any) {
    console.error('API /api/posts/[id]/react error:', error);
    return apiError(error.message || 'Failed to register reaction', 500);
  }
}
