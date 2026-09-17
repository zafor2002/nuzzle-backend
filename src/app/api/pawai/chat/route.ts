import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions, withErrorHandler } from '@/lib/api-response';
import { executeChatWithFailover } from '@/lib/llm';

export async function OPTIONS() {
  return handleOptions();
}

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1, 'Message content cannot be empty'),
      })
    )
    .min(1, 'At least one message is required'),
  petContext: z
    .object({
      petName: z.string().optional(),
      species: z.string().optional(),
      breed: z.string().optional(),
      age: z.string().optional(),
      weight: z.string().optional(),
      isProSubscriber: z.boolean().optional(),
    })
    .optional(),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = chatSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400, parsed.error.issues);
  }

  const response = await executeChatWithFailover(parsed.data);

  return apiSuccess(response, 200, 'PawDoctor AI response generated.');
});
