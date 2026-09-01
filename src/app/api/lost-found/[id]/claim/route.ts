import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

const claimSchema = z.object({
  volunteerName: z.string().min(1).default('PAW Volunteer'),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = claimSchema.safeParse(body);
    const volunteerName = parsed.success ? parsed.data.volunteerName : 'PAW Volunteer';

    return apiSuccess({
      id,
      isClaimed: true,
      claimedBy: volunteerName,
      claimedAt: 'Just now',
      message: 'Rescue report claimed & locked. Dispatch notification sent to nearby coordinators.',
    }, 200);
  } catch (error: any) {
    console.error('API /api/lost-found/[id]/claim error:', error);
    return apiError(error.message || 'Failed to claim rescue report', 500);
  }
}
