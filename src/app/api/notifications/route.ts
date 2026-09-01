import { NextRequest } from 'next/server';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const notifications = [
      {
        id: 'notif_1',
        type: 'reaction',
        actorName: 'Sophia & Cleopatra',
        actorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        message: 'gave a Nuzzle 💜 to Waffles stick trophy moment!',
        targetPostId: 'post_1',
        isRead: false,
        createdAt: '15m ago',
      },
      {
        id: 'notif_2',
        type: 'comment',
        actorName: 'Oliver (Corgi)',
        actorAvatar: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=200&auto=format&fit=crop&q=80',
        message: 'commented: "Branch manager of the year award goes to Waffles!"',
        targetPostId: 'post_1',
        isRead: false,
        createdAt: '1h ago',
      },
      {
        id: 'notif_3',
        type: 'emergency_alert',
        actorName: '5-Mile Radar',
        actorAvatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop&q=80',
        message: '🚨 Missing Golden Cocker Spaniel reported 0.8 mi from your location (Gulshan-2).',
        targetPostId: 'lf_1',
        isRead: true,
        createdAt: '2h ago',
      },
    ];

    return apiSuccess(notifications);
  } catch (error: any) {
    console.error('API /api/notifications GET error:', error);
    return apiError(error.message || 'Failed to fetch notifications', 500);
  }
}

export async function PATCH(_req: NextRequest) {
  try {
    return apiSuccess({ message: 'All notifications marked as read.' }, 200);
  } catch (error: any) {
    console.error('API /api/notifications PATCH error:', error);
    return apiError(error.message || 'Failed to update notifications', 500);
  }
}
