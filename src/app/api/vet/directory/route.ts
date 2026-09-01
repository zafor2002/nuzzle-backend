import { NextRequest } from 'next/server';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const species = searchParams.get('species');
    const emergencyOnly = searchParams.get('emergency') === 'true';

    const vets = [
      {
        id: 'vet_3',
        name: 'Dr. Sarah Al-Mansoor, DVM, DACVS',
        clinicName: 'Cascade 24/7 Emergency & Surgical Hospital',
        location: '2100 SW River Pkwy, Portland, OR • Partner Branch: Gulshan-2, Dhaka',
        bio: 'Board-Certified Veterinary Surgeon specializing in trauma triage, orthopedics, ACL TPLO surgery, and urgent care.',
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
        rating: 5.0,
        reviewsCount: 218,
        isProSubscriber: true,
        proBadgeLabel: '🌟 Nuzzle Pro Priority Hospital',
        distanceMiles: 2.1,
        acceptedSpecies: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Reptile'],
        emergencyCare: true,
        phone: '+880 1711-998877',
        priceRange: '$$$',
        specialties: ['Emergency Surgery', 'Orthopedics & Joint Care', 'Trauma & ICU', 'Radiology & Ultrasound', 'Poison Triage'],
        slots: {
          'Today': [
            { time: '02:00 PM', isBooked: false },
            { time: '05:30 PM', isBooked: false },
            { time: '08:00 PM', isBooked: false },
          ],
          'Tomorrow': [
            { time: '09:00 AM', isBooked: false },
            { time: '11:30 AM', isBooked: false },
            { time: '03:00 PM', isBooked: false },
          ],
        },
      },
      {
        id: 'vet_1',
        name: 'Dr. Emily Watson, DVM',
        clinicName: 'Bark & Purr Veterinary Center',
        location: 'Dhanmondi Road 27, Dhaka',
        bio: '12+ years experience in companion animal wellness, preventative care, and dental health.',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813584-ea23df1f0d36?w=200&auto=format&fit=crop&q=80',
        rating: 4.9,
        reviewsCount: 142,
        isProSubscriber: true,
        proBadgeLabel: '🌟 Nuzzle Pro Priority Partner',
        distanceMiles: 1.2,
        acceptedSpecies: ['Dog', 'Cat', 'Rabbit'],
        emergencyCare: true,
        phone: '+880 1819-223344',
        priceRange: '$$',
        specialties: ['General Wellness & Vaccines', 'Dental Cleaning', 'Nutrition & Weight Management', 'Ultrasound Screening'],
        slots: {
          'Today': [
            { time: '10:00 AM', isBooked: true },
            { time: '03:30 PM', isBooked: false },
          ],
          'Tomorrow': [
            { time: '10:30 AM', isBooked: false },
            { time: '02:00 PM', isBooked: false },
          ],
        },
      },
      {
        id: 'vet_2',
        name: 'Dr. Marcus Vance, BVSc',
        clinicName: 'Avian & Exotic Pet Sanctuary',
        location: 'Uttara Sector 7, Dhaka',
        bio: 'Specialist in exotic birds, reptiles, and small pocket pets with dedicated gentle handling suites.',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewsCount: 89,
        isProSubscriber: false,
        distanceMiles: 3.5,
        acceptedSpecies: ['Bird', 'Rabbit', 'Reptile'],
        emergencyCare: false,
        phone: '+880 1912-889900',
        priceRange: '$$',
        specialties: ['Avian Medicine', 'Beak & Feather Care', 'Reptile Husbandry', 'Small Mammal Dentistry'],
        slots: {
          'Today': [
            { time: '04:00 PM', isBooked: false },
          ],
          'Tomorrow': [
            { time: '11:00 AM', isBooked: false },
          ],
        },
      },
    ];

    let result = vets;
    if (emergencyOnly) {
      result = result.filter(v => v.emergencyCare);
    }
    if (species) {
      result = result.filter(v => v.acceptedSpecies.some(s => s.toLowerCase() === species.toLowerCase()));
    }

    return apiSuccess(result);
  } catch (error: any) {
    console.error('API /api/vet/directory error:', error);
    return apiError(error.message || 'Failed to fetch vet directory', 500);
  }
}
