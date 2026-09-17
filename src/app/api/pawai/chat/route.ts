import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions, withErrorHandler } from '@/lib/api-response';
import { executeChatWithFailover } from '@/lib/llm';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const runtime = 'nodejs';

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
  const body = await req.json().catch(() => ({}));

  // Normalize single message / prompt / query / text to messages array
  let normalizedMessages = body.messages;
  if (!Array.isArray(normalizedMessages)) {
    const singleMsg = body.message || body.prompt || body.query || body.text || (typeof body === 'string' ? body : '');
    if (singleMsg && typeof singleMsg === 'string' && singleMsg.trim()) {
      normalizedMessages = [{ role: 'user', content: singleMsg.trim() }];
    }
  } else {
    // Ensure each item has role and content
    normalizedMessages = normalizedMessages.map((m: any) => {
      if (typeof m === 'string') {
        return { role: 'user', content: m };
      }
      return {
        role: m.role || 'user',
        content: m.content || m.text || m.body || '',
      };
    }).filter((m: any) => typeof m.content === 'string' && m.content.trim().length > 0);
  }

  const normalizedPayload = {
    ...body,
    messages: normalizedMessages,
  };

  const parsed = chatSchema.safeParse(normalizedPayload);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || 'Invalid chat request', 400, parsed.error.issues);
  }

  const response = await executeChatWithFailover(parsed.data);

  return apiSuccess(response, 200, 'PawDoctor AI response generated.');
});

