import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read connection string from .env.local
const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const match = env.match(/DATABASE_URL="([^"]+)"/);
const connStr = match ? match[1] : null;

if (!connStr) {
  console.error('❌ Could not find DATABASE_URL in .env.local');
  process.exit(1);
}

// Read the 50 benchmark pets JSON
const jsonPath = path.join(__dirname, '..', 'datasets', 'lost_found_radar_dataset.json');
const petsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const client = new pg.Client({ connectionString: connStr });

async function seed() {
  try {
    console.log('📡 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected to Supabase!');

    // Pick an existing owner or create a dedicated benchmark radar account
    const ownerRes = await client.query('SELECT id FROM "Owner" LIMIT 1;');
    let defaultOwnerId = 'bc91e5f8-e013-4a5a-991a-35a8aaac8758'; // default to existing user

    if (ownerRes.rows.length > 0) {
      defaultOwnerId = ownerRes.rows[0].id;
    } else {
      // Ensure emergency radar owner exists
      await client.query(`
        INSERT INTO "Owner" (id, email, username, "displayName", "avatarUrl", bio, "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id) DO NOTHING;
      `, [
        defaultOwnerId,
        'radar@nuzzle.ai',
        'nuzzle_radar',
        'Nuzzle Emergency Pet Radar',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        'Automated AI Lost & Found Radar Network',
      ]);
    }

    console.log(`👤 Using Owner ID [${defaultOwnerId}] for benchmark entries.`);

    let petCount = 0;
    let postCount = 0;

    for (const item of petsData) {
      const petId = `pet_${item.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const postId = `lf_post_${item.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      // 1. Upsert Pet
      await client.query(`
        INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          species = EXCLUDED.species,
          breed = EXCLUDED.breed,
          "avatarUrl" = EXCLUDED."avatarUrl",
          bio = EXCLUDED.bio,
          "updatedAt" = NOW();
      `, [
        petId,
        defaultOwnerId,
        item.name,
        item.species,
        item.breed,
        item.imageUrl,
        `${item.primaryColor}. ${item.distinctiveFeatures}. Collar: ${item.collar}`,
      ]);
      petCount++;

      // 2. Upsert LostFoundPost
      const desc = `${item.name} (${item.breed}, ${item.species}) missing from ${item.lastSeenLocation}. Features: ${item.distinctiveFeatures}. Collar: ${item.collar}. Reward: ৳${item.rewardBDT?.toLocaleString() || '15,000'}. Contact: ${item.ownerName} (${item.contactPhone}).`;

      await client.query(`
        INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          description = EXCLUDED.description,
          "lastSeenLat" = EXCLUDED."lastSeenLat",
          "lastSeenLng" = EXCLUDED."lastSeenLng",
          "contactInfo" = EXCLUDED."contactInfo";
      `, [
        postId,
        defaultOwnerId,
        petId,
        item.status || 'lost',
        desc,
        item.lat || null,
        item.lng || null,
        `${item.ownerName} (${item.contactPhone})`,
      ]);
      postCount++;
    }

    console.log(`🎉 Successfully seeded into Supabase:`);
    console.log(`   - ${petCount} Pets in "Pet" table`);
    console.log(`   - ${postCount} Reports in "LostFoundPost" table`);

    // Verify
    const finalCount = await client.query('SELECT count(*) FROM "LostFoundPost";');
    console.log(`📊 Total LostFoundPost rows in Supabase: ${finalCount.rows[0].count}`);

  } catch (err) {
    console.error('❌ Supabase Seeding Error:', err);
  } finally {
    await client.end();
  }
}

seed();
