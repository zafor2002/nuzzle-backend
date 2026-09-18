import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '../src/generated/prisma/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🐾 Starting Lost & Found Benchmark Dataset Seeding...');

  const jsonPath = path.join(__dirname, '..', 'datasets', 'lost_found_radar_dataset.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Dataset file not found:', jsonPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const pets = JSON.parse(raw);

  console.log(`📋 Found ${pets.length} pet records to seed.`);

  // Create demo pet owners if they do not exist
  const dummyOwnerId = 'demo-radar-owner-id';
  const owner = await prisma.owner.upsert({
    where: { id: dummyOwnerId },
    update: {},
    create: {
      id: dummyOwnerId,
      email: 'radar-demo@nuzzle.ai',
      username: 'nuzzle_radar_official',
      displayName: 'Nuzzle Emergency Radar',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      bio: 'Official Nuzzle Pet Radar lost and found automated rescue network.',
    },
  });

  let createdCount = 0;
  for (const item of pets) {
    // 1. Create or update Pet
    const pet = await prisma.pet.upsert({
      where: { id: `pet_${item.id}` },
      update: {
        name: item.name,
        species: item.species,
        breed: item.breed,
        avatarUrl: item.imageUrl,
        bio: `${item.primaryColor}. ${item.distinctiveFeatures}. Collar: ${item.collar}`,
      },
      create: {
        id: `pet_${item.id}`,
        ownerId: owner.id,
        name: item.name,
        species: item.species,
        breed: item.breed,
        avatarUrl: item.imageUrl,
        bio: `${item.primaryColor}. ${item.distinctiveFeatures}. Collar: ${item.collar}`,
      },
    });

    // 2. Create or update LostFoundPost
    await prisma.lostFoundPost.upsert({
      where: { id: `lf_post_${item.id}` },
      update: {
        status: item.status || 'lost',
        description: `${item.name} (${item.breed}, ${item.species}) missing from ${item.lastSeenLocation}. Features: ${item.distinctiveFeatures}. Collar: ${item.collar}. Reward: ৳${item.rewardBDT?.toLocaleString() || '15,000'}.`,
        lastSeenLat: item.lat,
        lastSeenLng: item.lng,
        contactInfo: `${item.ownerName} (${item.contactPhone})`,
      },
      create: {
        id: `lf_post_${item.id}`,
        ownerId: owner.id,
        petId: pet.id,
        status: item.status || 'lost',
        description: `${item.name} (${item.breed}, ${item.species}) missing from ${item.lastSeenLocation}. Features: ${item.distinctiveFeatures}. Collar: ${item.collar}. Reward: ৳${item.rewardBDT?.toLocaleString() || '15,000'}.`,
        lastSeenLat: item.lat,
        lastSeenLng: item.lng,
        contactInfo: `${item.ownerName} (${item.contactPhone})`,
      },
    });

    createdCount++;
  }

  console.log(`✅ Successfully seeded ${createdCount} benchmark pets and lost reports into the database!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
