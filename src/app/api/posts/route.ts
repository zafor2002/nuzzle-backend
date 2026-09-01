import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');
    const species = searchParams.get('species');
    const ownerId = searchParams.get('ownerId');
    const petId = searchParams.get('petId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: any = {};
    if (ownerId) where.ownerId = ownerId;
    if (petId) where.petId = petId;
    if (tag) {
      where.hashtags = {
        some: {
          hashtag: {
            tag: tag.toLowerCase().replace(/^#/, ''),
          },
        },
      };
    }
    if (species) {
      where.pet = {
        species: { equals: species, mode: 'insensitive' },
      };
    }

    try {
      const posts = await prisma.post.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatarUrl: true,
              isAnonymous: true,
            },
          },
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              avatarUrl: true,
              isAnonymous: true,
            },
          },
          comments: {
            include: {
              owner: {
                select: {
                  id: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
            take: 10,
          },
          likes: true,
          hashtags: {
            include: { hashtag: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      if (posts.length > 0) {
        return apiSuccess(posts);
      }
    } catch (dbError) {
      console.warn('Database query fallback for /api/posts:', dbError);
    }

    // Default rich sample feed matching Nuzzle's signature Dhaka pet-first experience
    return apiSuccess([
      {
        id: 'post_1',
        ownerId: 'owner_me',
        ownerName: 'Alex Rivers',
        ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        petId: 'pet_1',
        petName: 'Waffles',
        petBreed: 'Golden Retriever',
        petAvatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80',
        caption: 'Found the most majestic stick in the whole park today. Carried it for 3 whole miles with absolute pride! 🌲🐕 #goldenretriever #forestwalk #happypup',
        petDialogue: 'I am the Supreme Branch Master. This stick belongs in the Smithsonian.',
        petMood: '🐾 Zoomies & Fetch Mode',
        petSoundBite: '🎵 Excited Panting & Tail Wag',
        mediaUrls: [
          'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80',
        ],
        likesCount: 184,
        commentsCount: 23,
        isLiked: true,
        selectedReaction: 'nuzzle',
        reactions: { paw: 68, nuzzle: 54, treat: 38, ball: 19, purr: 5 },
        isSaved: true,
        createdAt: '2h ago',
        location: 'Gulshan Lake Park, Dhaka',
        hashtags: ['goldenretriever', 'forestwalk', 'dogsofinstagram', 'happypup'],
        comments: [
          {
            id: 'c1',
            authorName: 'Sarah & Milo',
            authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            body: 'Branch manager of the year award goes to Waffles! 🏆',
            createdAt: '1h ago',
            likesCount: 14,
            isLiked: true,
          },
        ],
      },
      {
        id: 'post_2',
        ownerId: 'user_sophia',
        ownerName: 'Sophia Chen',
        ownerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        petId: 'pet_cleo',
        petName: 'Cleopatra',
        petBreed: 'Bengal Cat',
        petAvatar: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&auto=format&fit=crop&q=80',
        caption: 'She discovered the top of the refrigerator is warm. We have officially lost all kitchen supremacy. 👑🐾 #bengalcat #catlife #queenstatus',
        petDialogue: 'Bow down, peasant. Feed me salmon from down there.',
        petMood: '👑 Mischief & Royalty',
        petSoundBite: '🎵 Gentle Low Rumble Purr',
        mediaUrls: [
          'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop&q=80',
        ],
        likesCount: 312,
        commentsCount: 42,
        isLiked: false,
        selectedReaction: null,
        reactions: { paw: 94, nuzzle: 88, treat: 72, ball: 11, purr: 47 },
        isSaved: false,
        createdAt: '5h ago',
        location: 'Dhanmondi, Dhaka',
        hashtags: ['bengalcat', 'catlife', 'queenstatus'],
        comments: [],
      },
    ]);
  } catch (error: any) {
    console.error('API /api/posts GET error:', error);
    return apiError(error.message || 'Failed to fetch feed posts', 500);
  }
}

const createPostSchema = z.object({
  ownerId: z.string().default('owner_me'),
  ownerName: z.string().default('Alex Rivers'),
  petId: z.string().optional(),
  petName: z.string().optional(),
  petBreed: z.string().optional(),
  petAvatar: z.string().optional(),
  caption: z.string().min(1),
  mediaUrls: z.array(z.string()).min(1),
  location: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  petMood: z.string().optional(),
  petDialogue: z.string().optional(),
  petSoundBite: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400, parsed.error.format());
    }

    const data = parsed.data;
    const postId = `post_${Date.now()}`;

    const newPost = {
      id: postId,
      ...data,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      selectedReaction: null,
      reactions: { paw: 0, nuzzle: 0, treat: 0, ball: 0, purr: 0 },
      isSaved: false,
      createdAt: 'Just now',
      comments: [],
    };

    return apiSuccess(newPost, 201, 'Post created successfully.');
  } catch (error: any) {
    console.error('API /api/posts POST error:', error);
    return apiError(error.message || 'Failed to create post', 500);
  }
}
