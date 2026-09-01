import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const stories = [
      {
        id: 'story_1',
        creatorId: 'pet_1',
        creatorName: 'Waffles',
        creatorAvatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80',
        petName: 'Golden Retriever',
        hasUnseen: true,
        segments: [
          {
            id: 'seg_1',
            mediaUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80',
            caption: 'Morning park sprint was 10/10! 🐾🎾',
            durationMs: 4500,
          },
          {
            id: 'seg_2',
            mediaUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
            caption: 'Pupcup conquered in Banani! 🍦😋',
            durationMs: 4500,
          },
        ],
      },
      {
        id: 'story_2',
        creatorId: 'user_luna',
        creatorName: 'Luna & Oliver',
        creatorAvatar: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&auto=format&fit=crop&q=80',
        petName: 'Oliver (Corgi)',
        hasUnseen: true,
        segments: [
          {
            id: 'seg_3',
            mediaUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=800&auto=format&fit=crop&q=80',
            caption: 'Short legs, huge dreams ☁️🐕',
            durationMs: 4500,
          },
        ],
      },
      {
        id: 'story_3',
        creatorId: 'user_kiwi',
        creatorName: 'Kiwi The Conure',
        creatorAvatar: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&auto=format&fit=crop&q=80',
        petName: 'Kiwi (Green Cheek Conure)',
        hasUnseen: true,
        segments: [
          {
            id: 'seg_4',
            mediaUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80',
            caption: 'Vocal warmups before breakfast 🎶🦜',
            durationMs: 4500,
          },
        ],
      },
    ];

    return apiSuccess(stories);
  } catch (error: any) {
    console.error('API /api/stories GET error:', error);
    return apiError(error.message || 'Failed to fetch stories', 500);
  }
}

const createStorySchema = z.object({
  creatorId: z.string().default('pet_1'),
  creatorName: z.string().default('Waffles'),
  creatorAvatar: z.string().optional(),
  mediaUrl: z.string().url(),
  caption: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createStorySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const newStory = {
      id: `story_${Date.now()}`,
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      creatorAvatar: data.creatorAvatar || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80',
      petName: 'Pet',
      hasUnseen: true,
      segments: [
        {
          id: `seg_${Date.now()}`,
          mediaUrl: data.mediaUrl,
          caption: data.caption || '',
          durationMs: 4500,
        },
      ],
    };

    return apiSuccess(newStory, 201, 'Story published successfully.');
  } catch (error: any) {
    console.error('API /api/stories POST error:', error);
    return apiError(error.message || 'Failed to publish story', 500);
  }
}
