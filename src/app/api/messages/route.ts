import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const chats = [
      {
        id: 'chat_1',
        participantId: 'owner_drsarah',
        participantName: 'Dr. Sarah Al-Mansoor (Vet)',
        participantAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
        isOnline: true,
        unreadCount: 1,
        lastMessage: 'Appointment confirmed for Waffles tomorrow at 10:30 AM! 🐾',
        lastMessageTime: '10m ago',
        messages: [
          {
            id: 'm1',
            senderId: 'owner_drsarah',
            body: 'Hello Alex! I reviewed Waffles dental history from last month.',
            createdAt: '11:00 AM',
            isMine: false,
          },
          {
            id: 'm2',
            senderId: 'owner_me',
            body: 'Great! Should we avoid food 2 hours before the dental check?',
            createdAt: '11:05 AM',
            isMine: true,
          },
          {
            id: 'm3',
            senderId: 'owner_drsarah',
            body: 'Appointment confirmed for Waffles tomorrow at 10:30 AM! 🐾 Yes, keep water available.',
            createdAt: '11:15 AM',
            isMine: false,
          },
        ],
      },
      {
        id: 'chat_2',
        participantId: 'owner_urbanhound',
        participantName: 'UrbanHound Dhaka Official',
        participantAvatar: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=200&auto=format&fit=crop&q=80',
        isOnline: true,
        unreadCount: 0,
        lastMessage: 'Your no-pull harness has been dispatched via Express Rider 📦',
        lastMessageTime: '1h ago',
        messages: [],
      },
    ];

    return apiSuccess(chats);
  } catch (error: any) {
    console.error('API /api/messages GET error:', error);
    return apiError(error.message || 'Failed to fetch messages', 500);
  }
}

const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().min(1),
  body: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'owner_me',
      recipientId: data.recipientId,
      body: data.body,
      createdAt: 'Just now',
      isMine: true,
    };

    return apiSuccess(newMessage, 201, 'Message delivered.');
  } catch (error: any) {
    console.error('API /api/messages POST error:', error);
    return apiError(error.message || 'Failed to send message', 500);
  }
}
