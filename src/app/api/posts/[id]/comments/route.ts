import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Sample comments for post
    const sampleComments = [
      {
        id: 'c1',
        postId: id,
        authorName: 'Sarah & Milo',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        body: 'Branch manager of the year award goes to Waffles! 🏆',
        createdAt: '1h ago',
        likesCount: 14,
        isLiked: true,
      },
      {
        id: 'c2',
        postId: id,
        authorName: 'Alex Rivers',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        body: 'Thank you everyone! He has not dropped the stick for 2 hours now 😄',
        createdAt: '35m ago',
        likesCount: 6,
        isLiked: false,
      }
    ];

    return apiSuccess(sampleComments);
  } catch (error: any) {
    console.error('API /api/posts/[id]/comments GET error:', error);
    return apiError(error.message || 'Failed to fetch comments', 500);
  }
}

const commentSchema = z.object({
  body: z.string().trim().min(1).max(500),
  authorName: z.string().default('Alex Rivers'),
  authorAvatar: z.string().optional(),
  isPet: z.boolean().default(false),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const newComment = {
      id: `c_${Date.now()}`,
      postId: id,
      authorName: data.authorName,
      authorAvatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      body: data.body,
      isPet: data.isPet,
      createdAt: 'Just now',
      likesCount: 0,
      isLiked: false,
    };

    return apiSuccess(newComment, 201, 'Comment added successfully.');
  } catch (error: any) {
    console.error('API /api/posts/[id]/comments POST error:', error);
    return apiError(error.message || 'Failed to add comment', 500);
  }
}
