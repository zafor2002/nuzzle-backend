import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions, withErrorHandler } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in miles.
 * Replicates PostGIS ST_DistanceSphere / ST_DWithin geospatial functionality.
 */
function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const DEFAULT_REPORTS = [
  {
    id: 'lf_1',
    type: 'lost',
    petName: 'Rusty',
    species: 'Dog',
    breed: 'Golden Cocker Spaniel',
    lastSeenLocation: 'Gulshan-2 Circle (Near Park), Dhaka',
    coordinates: { lat: 23.7925, lng: 90.4078 },
    lastSeenDate: 'Today, 2:30 PM',
    reward: '৳ 5,000 BDT',
    description: 'Wearing a red collar with silver bell. Very friendly, answers to whistle.',
    mediaUrls: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80'],
    contactPhone: '+880 1711-234567',
    isResolved: false,
    distanceMiles: 0.8,
    matchScore: 94,
    isClaimed: false,
    claimedBy: null,
  },
  {
    id: 'lf_2',
    type: 'emergency_rescue',
    petName: 'Injured Street Pup',
    species: 'Dog',
    breed: 'Deshi Stray Pup',
    lastSeenLocation: 'Dhanmondi Lake Walkway (Bridge 3)',
    coordinates: { lat: 23.7461, lng: 90.3742 },
    lastSeenDate: 'Today, 11:15 AM',
    description: 'Limping on front right paw after getting stuck near railing. Needs immediate first aid triage.',
    mediaUrls: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80'],
    contactPhone: '+880 1819-887766',
    isResolved: false,
    distanceMiles: 1.4,
    isClaimed: true,
    claimedBy: 'Volunteer Farhan (PAW Rescue)',
    claimedAt: '15m ago',
  },
  {
    id: 'lf_3',
    type: 'found',
    petName: 'Found Cat (Calico)',
    species: 'Cat',
    breed: 'Calico Short Hair',
    lastSeenLocation: 'Banani Block D, Road 11',
    coordinates: { lat: 23.7937, lng: 90.4043 },
    lastSeenDate: 'Yesterday Evening',
    description: 'Found resting inside apartment garage. Well groomed and vocal. Looking for rightful parent.',
    mediaUrls: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80'],
    contactPhone: '+880 1912-334455',
    isResolved: false,
    distanceMiles: 2.1,
    matchScore: 88,
    isClaimed: false,
    claimedBy: null,
  },
  {
    id: 'lf_4',
    type: 'lost',
    petName: 'Milo',
    species: 'Cat',
    breed: 'Persian White',
    lastSeenLocation: 'Uttara Sector 7 Park',
    coordinates: { lat: 23.8759, lng: 90.3795 },
    lastSeenDate: '2 hours ago',
    reward: '৳ 3,000 BDT',
    description: 'White fluffy cat with green eyes. Scared of loud traffic.',
    mediaUrls: ['https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop&q=80'],
    contactPhone: '+880 1611-998877',
    isResolved: false,
    distanceMiles: 4.8,
    matchScore: 91,
    isClaimed: false,
    claimedBy: null,
  },
];

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter'); // 'all', 'lost', 'found', 'emergency'
  const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const userLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
  const radiusMiles = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 5.0; // 5-Mile Radar constraint

  let reports = DEFAULT_REPORTS.map((report) => {
    let distance = report.distanceMiles;
    if (userLat !== null && userLng !== null && report.coordinates) {
      distance = calculateDistanceMiles(userLat, userLng, report.coordinates.lat, report.coordinates.lng);
    }
    return {
      ...report,
      distanceMiles: distance,
    };
  });

  // 1. Filter by category
  if (filter && filter !== 'all') {
    reports = reports.filter(
      (r) => r.type === filter || (filter === 'emergency' && r.type === 'emergency_rescue')
    );
  }

  // 2. Geospatial 5-Mile Radar Filter
  if (userLat !== null && userLng !== null) {
    reports = reports.filter((r) => r.distanceMiles <= radiusMiles);
  }

  // 3. Sort by closest distance first
  reports.sort((a, b) => a.distanceMiles - b.distanceMiles);

  const meta = {
    radarRadiusMiles: radiusMiles,
    radarCenter: userLat && userLng ? { lat: userLat, lng: userLng } : { lat: 23.7925, lng: 90.4078, label: 'Dhaka Center' },
    totalAlertsWithinRadar: reports.length,
  };

  return apiSuccess(reports, 200, '5-Mile Radar emergency alerts retrieved.', meta);
});

const createReportSchema = z.object({
  type: z.enum(['lost', 'found', 'emergency_rescue']).optional(),
  status: z.enum(['lost', 'found', 'emergency_rescue']).optional(),
  petName: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().optional(),
  location: z.string().optional(),
  lastSeenLocation: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional().default('Emergency pet alert reported on Nuzzle Community Radar.'),
  mediaUrls: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  reward: z.string().optional(),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = createReportSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400, parsed.error.issues);
  }

  const data = parsed.data;
  const resolvedType = data.type || data.status || 'lost';
  const resolvedLocation = data.lastSeenLocation || data.location || 'Dhaka, Bangladesh';
  const resolvedMedia =
    data.mediaUrls && data.mediaUrls.length > 0
      ? data.mediaUrls
      : [data.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80'];

  const newReport = {
    id: `lf_${Date.now()}`,
    type: resolvedType,
    status: resolvedType,
    petName: data.petName,
    species: data.species,
    breed: data.breed || 'Companion',
    lastSeenLocation: resolvedLocation,
    location: resolvedLocation,
    coordinates: {
      lat: data.latitude || 23.7925,
      lng: data.longitude || 90.4078,
    },
    description: data.description,
    mediaUrls: resolvedMedia,
    imageUrl: resolvedMedia[0],
    contactName: data.contactName || 'Community Member',
    contactPhone: data.contactPhone || '+880 1700-000000',
    reward: data.reward,
    lastSeenDate: 'Just now',
    reportedDate: 'Just now',
    isResolved: false,
    distanceMiles: 0.1,
    matchScore: 98,
    isClaimed: false,
    claimedBy: null,
  };

  // Real-time RAG Sync to Gigalogy MAIRA if configured
  if (process.env.MAIRA_LOST_FOUND_DATASET_ID) {
    import('@/lib/maira/maira-client').then(({ mairaClient }) => {
      if (mairaClient.isConfigured()) {
        mairaClient
          .addDocuments(process.env.MAIRA_LOST_FOUND_DATASET_ID!, [
            {
              idx: newReport.id,
              pet_name: newReport.petName,
              species: newReport.species,
              breed: newReport.breed,
              type: newReport.type,
              location: newReport.lastSeenLocation,
              coordinates: `${newReport.coordinates.lat}, ${newReport.coordinates.lng}`,
              description: newReport.description,
              contact: newReport.contactPhone,
              image_url: newReport.imageUrl,
              content: `Lost/Found Report [${newReport.type.toUpperCase()}]: ${newReport.petName} is a ${newReport.breed} (${newReport.species}). Last seen at ${newReport.lastSeenLocation}. Details: ${newReport.description}. Contact: ${newReport.contactPhone}`,
            },
          ])
          .catch((err) => console.warn('[MAIRA Auto-Sync] Document ingestion error:', err?.message || err));
      }
    }).catch(() => {});
  }

  return apiSuccess(newReport, 201, '5-Mile Emergency Radar report broadcasted successfully.');
});
