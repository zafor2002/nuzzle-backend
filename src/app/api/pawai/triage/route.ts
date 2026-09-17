import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions, withErrorHandler } from '@/lib/api-response';
import { executeTriageWithFailover } from '@/lib/llm';

export async function OPTIONS() {
  return handleOptions();
}

const triageSchema = z.object({
  petName: z.string().default('Pet'),
  species: z.string().default('Dog'),
  breed: z.string().optional(),
  age: z.string().optional(),
  symptoms: z.string().min(3, 'Symptoms description must be at least 3 characters long'),
  duration: z.string().optional(),
  isProSubscriber: z.boolean().default(false),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = triageSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400, parsed.error.issues);
  }

  const triageResult = await executeTriageWithFailover(parsed.data);

  return apiSuccess(triageResult, 200, 'Triage analysis completed.');
});
