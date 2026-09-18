import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '..', 'datasets', 'lost_found_radar_dataset.json');
const pets = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const ownerId = 'bc91e5f8-e013-4a5a-991a-35a8aaac8758';

let sql = `-- ===========================================================================\n`;
sql += `-- Nuzzle 50-Pet Lost & Found Benchmark Dataset for Supabase PostgreSQL\n`;
sql += `-- Run in Supabase Dashboard -> SQL Editor\n`;
sql += `-- ===========================================================================\n\n`;

for (const p of pets) {
  const petId = `pet_${p.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const postId = `lf_post_${p.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const name = p.name.replace(/'/g, "''");
  const species = p.species.replace(/'/g, "''");
  const breed = p.breed.replace(/'/g, "''");
  const bio = `${p.primaryColor}. ${p.distinctiveFeatures}. Collar: ${p.collar}`.replace(/'/g, "''");
  const desc = `${p.name} (${p.breed}, ${p.species}) missing from ${p.lastSeenLocation}. Features: ${p.distinctiveFeatures}. Collar: ${p.collar}. Reward: ৳${p.rewardBDT?.toLocaleString() || '15,000'}. Contact: ${p.ownerName} (${p.contactPhone}).`.replace(/'/g, "''");
  const contact = `${p.ownerName} (${p.contactPhone})`.replace(/'/g, "''");

  sql += `INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")\n`;
  sql += `VALUES ('${petId}', '${ownerId}', '${name}', '${species}', '${breed}', '${p.imageUrl}', '${bio}', NOW())\n`;
  sql += `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();\n\n`;

  sql += `INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")\n`;
  sql += `VALUES ('${postId}', '${ownerId}', '${petId}', '${p.status || 'lost'}', '${desc}', ${p.lat}, ${p.lng}, '${contact}', NOW())\n`;
  sql += `ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";\n\n`;
}

const outPath1 = path.join(__dirname, '..', 'datasets', 'seed_supabase_lost_found.sql');
const outPath2 = path.join(__dirname, '..', '..', 'datasets', 'seed_supabase_lost_found.sql');

fs.writeFileSync(outPath1, sql);
if (fs.existsSync(path.dirname(outPath2))) {
  fs.writeFileSync(outPath2, sql);
}

console.log(`✅ Generated Supabase SQL file: ${outPath1} (${pets.length} pets)`);
