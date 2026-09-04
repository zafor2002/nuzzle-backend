import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const listings = [
      {
        id: 'mkt_1',
        title: 'Ergonomic Breathable Dog Harness (No-Pull)',
        category: 'Gear & Leashes',
        price: 1850,
        currency: 'BDT',
        sellerId: 'owner_urbanhound',
        sellerName: 'UrbanHound Dhaka Official',
        sellerAvatar: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=200&auto=format&fit=crop&q=80',
        sellerType: 'verified_shop',
        mediaUrls: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&auto=format&fit=crop&q=80'],
        location: 'Gulshan-2, Dhaka',
        condition: 'Brand New',
        isPromoted: true,
        rating: 4.9,
        reviewsCount: 68,
        description: 'Military-grade nylon webbing with reflective safety strips and padded chest plate.',
      },
      {
        id: 'mkt_2',
        title: 'Multi-Level Velvet Cat Tree Tower with Scratching Posts',
        category: 'Beds & Furniture',
        price: 4200,
        currency: 'BDT',
        sellerId: 'owner_urbanhound',
        sellerName: 'UrbanHound Dhaka Official',
        sellerAvatar: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=200&auto=format&fit=crop&q=80',
        sellerType: 'verified_shop',
        mediaUrls: ['https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800&auto=format&fit=crop&q=80'],
        location: 'Gulshan-2, Dhaka',
        condition: 'Brand New',
        isPromoted: true,
        rating: 5.0,
        reviewsCount: 44,
        description: '52-inch plush cat sanctuary with natural sisal rope scratching poles and hammock.',
      },
      {
        id: 'mkt_3',
        title: 'Interactive Laser & Feather Teaser Ball (USB Rechargeable)',
        category: 'Toys',
        price: 950,
        currency: 'BDT',
        sellerId: 'user_alex',
        sellerName: 'Alex Rivers',
        sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        sellerType: 'individual',
        mediaUrls: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80'],
        location: 'Banani, Dhaka',
        condition: 'Like New',
        isPromoted: false,
        rating: 4.8,
        reviewsCount: 12,
        description: 'Smart self-rotating LED pet ball with 3 speed modes for endless playful stimulation.',
      },
    ];

    const filtered = category && category !== 'All' 
      ? listings.filter(l => l.category.toLowerCase() === category.toLowerCase())
      : listings;

    return apiSuccess(filtered);
  } catch (error: any) {
    console.error('API /api/marketplace GET error:', error);
    return apiError(error.message || 'Failed to fetch marketplace listings', 500);
  }
}

const createListingSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  price: z.number().min(0),
  description: z.string().optional().default(''),
  mediaUrls: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  location: z.string().optional().default('Dhaka'),
  sellerType: z.enum(['verified_shop', 'individual', 'store', 'parent']).default('individual'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createListingSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 400);
    }

    const data = parsed.data;
    const resolvedMedia = data.mediaUrls && data.mediaUrls.length > 0 
      ? data.mediaUrls 
      : [data.imageUrl || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&auto=format&fit=crop&q=80'];

    const newListing = {
      id: `mkt_${Date.now()}`,
      title: data.title,
      category: data.category,
      price: data.price,
      description: data.description,
      mediaUrls: resolvedMedia,
      imageUrl: resolvedMedia[0],
      location: data.location,
      sellerType: data.sellerType,
      currency: 'BDT',
      sellerId: 'owner_me',
      sellerName: 'Alex Rivers',
      sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      condition: 'Brand New',
      isPromoted: false,
      rating: 5.0,
      reviewsCount: 0,
      createdAt: 'Just now',
    };

    return apiSuccess(newListing, 201, 'Marketplace listing published successfully.');
  } catch (error: any) {
    console.error('API /api/marketplace POST error:', error);
    return apiError(error.message || 'Failed to publish listing', 500);
  }
}
