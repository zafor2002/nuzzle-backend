-- ===========================================================================
-- Nuzzle 50-Pet Lost & Found Benchmark Dataset for Supabase PostgreSQL
-- Run in Supabase Dashboard -> SQL Editor
-- ===========================================================================

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_101', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Rocky', 'Dog', 'German Shepherd', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800', 'Black and Tan. Large pointed erect ears with slight nick on left ear and black saddle. Collar: Red nylon collar with silver Nuzzle QR tag', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_101', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_101', 'lost', 'Rocky (German Shepherd, Dog) missing from Banani Road 11 near Kemal Ataturk Ave. Features: Large pointed erect ears with slight nick on left ear and black saddle. Collar: Red nylon collar with silver Nuzzle QR tag. Reward: ৳15,000. Contact: Kazi Tanvir (+880 1711-998877).', 23.7937, 90.4066, 'Kazi Tanvir (+880 1711-998877)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_102', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Milo', 'Cat', 'Persian', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 'Pure White. One blue eye and one amber eye (heterochromia/odd-eyed) with fluffy tail. Collar: Light pink velvet collar with gold bell', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_102', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_102', 'lost', 'Milo (Persian, Cat) missing from Gulshan-2 near Lake Park. Features: One blue eye and one amber eye (heterochromia/odd-eyed) with fluffy tail. Collar: Light pink velvet collar with gold bell. Reward: ৳10,000. Contact: Nabila Rahman (+880 1819-223344).', 23.7925, 90.4167, 'Nabila Rahman (+880 1819-223344)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_103', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Shadow', 'Dog', 'Siberian Husky', 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800', 'Silver Grey and White. Striking ice-blue eyes with white face mask and bushy black-tipped tail. Collar: Blue reflective chest harness no leash attached', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_103', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_103', 'lost', 'Shadow (Siberian Husky, Dog) missing from Uttara Sector 7 Park Lake drive. Features: Striking ice-blue eyes with white face mask and bushy black-tipped tail. Collar: Blue reflective chest harness no leash attached. Reward: ৳25,000. Contact: Arif Chowdhury (+880 1912-334455).', 23.8698, 90.3986, 'Arif Chowdhury (+880 1912-334455)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_104', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Simba', 'Cat', 'Deshi / Indie Shorthair', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800', 'Orange Ginger Tabby. White socks on all four paws with dark striped ringed tail. Collar: Yellow flea collar with nameplate', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_104', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_104', 'lost', 'Simba (Deshi / Indie Shorthair, Cat) missing from Dhanmondi Road 27 near Robindro Shorobor. Features: White socks on all four paws with dark striped ringed tail. Collar: Yellow flea collar with nameplate. Reward: ৳5,000. Contact: Samiul Huq (+880 1611-445566).', 23.7538, 90.3768, 'Samiul Huq (+880 1611-445566)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_105', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Bruno', 'Dog', 'Golden Retriever', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800', 'Golden Honey Cream. Floppy ears with a white star patch on chest and thick feathered tail. Collar: Brown leather collar with brass nameplate', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_105', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_105', 'lost', 'Bruno (Golden Retriever, Dog) missing from Bashundhara R/A Block C near Playground. Features: Floppy ears with a white star patch on chest and thick feathered tail. Collar: Brown leather collar with brass nameplate. Reward: ৳20,000. Contact: Dr. Farhan Aziz (+880 1722-556677).', 23.8151, 90.4323, 'Dr. Farhan Aziz (+880 1722-556677)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_106', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Luna', 'Cat', 'British Shorthair', '90.3948', 'Solid Grey Blue. Chubby round cheeks with deep copper eyes and dense plush fur. Collar: Teal safety breakaway collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_106', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_106', '12000', 'Luna (British Shorthair, Cat) missing from Banani DOHS Road 4. Features: Chubby round cheeks with deep copper eyes and dense plush fur. Collar: Teal safety breakaway collar. Reward: ৳880. Contact: https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800 (Tahmina Akter).', 2026, 23.7992, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800 (Tahmina Akter)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_107', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Tiger', 'Dog', 'Deshi Mixed Breed', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800', 'Fawn Brindle. Curled tail over back with black muzzle and alert pointed ears. Collar: No collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_107', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_107', 'lost', 'Tiger (Deshi Mixed Breed, Dog) missing from Mirpur DOHS Gate 2. Features: Curled tail over back with black muzzle and alert pointed ears. Collar: No collar. Reward: ৳8,000. Contact: Imran Hossain (+880 1944-778899).', 23.8341, 90.3742, 'Imran Hossain (+880 1944-778899)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_108', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Cleo', 'Cat', 'Siamese', 'https://images.unsplash.com/photo-1513360309081-36f20ca80216?w=800', 'Seal Point Cream. Dark brown mask ears and paws with cross-eyed expression. Collar: Purple collar with tiny brass bell', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_108', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_108', 'lost', 'Cleo (Siamese, Cat) missing from Lalmatia Block D near Minar Masjid. Features: Dark brown mask ears and paws with cross-eyed expression. Collar: Purple collar with tiny brass bell. Reward: ৳10,000. Contact: Rubina Yasmin (+880 1552-889900).', 23.7571, 90.3695, 'Rubina Yasmin (+880 1552-889900)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_109', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Max', 'Dog', 'Rottweiler', 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=800', 'Black and Rust Mahogany. Docked tail with broad muscular head and tan eyebrow dots. Collar: Thick black tactical collar with handle', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_109', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_109', 'lost', 'Max (Rottweiler, Dog) missing from Mohakhali DOHS Road 18. Features: Docked tail with broad muscular head and tan eyebrow dots. Collar: Thick black tactical collar with handle. Reward: ৳30,000. Contact: Major (Retd.) Tariq (+880 1714-112233).', 23.7778, 90.3934, 'Major (Retd.) Tariq (+880 1714-112233)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_110', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Coco', 'Dog', 'Shih Tzu', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', 'White and Honey Brown. Long silky coat tied in topknot with red band and dark round eyes. Collar: Rainbow patterned harness', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_110', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_110', 'lost', 'Coco (Shih Tzu, Dog) missing from Baridhara Diplomatic Zone Park road. Features: Long silky coat tied in topknot with red band and dark round eyes. Collar: Rainbow patterned harness. Reward: ৳15,000. Contact: Zoya Khan (+880 1822-990011).', 23.7998, 90.4208, 'Zoya Khan (+880 1822-990011)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_111', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Bella', 'Cat', 'Calico (Tri-color)', 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800', 'Orange Black and White. Triangular orange spot covering right eye and white bib chest. Collar: Green collar with vaccination rabies tag', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_111', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_111', 'lost', 'Bella (Calico (Tri-color), Cat) missing from Dhanmondi 8/A near Dhanmondi Lake. Features: Triangular orange spot covering right eye and white bib chest. Collar: Green collar with vaccination rabies tag. Reward: ৳7,000. Contact: Afreen Sultana (+880 1933-221100).', 23.7485, 90.3752, 'Afreen Sultana (+880 1933-221100)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_112', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Charlie', 'Dog', 'Beagle', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800', 'Tricolor Black Tan White. White blaze on snout with white tail flag and long drooping ears. Collar: Orange hunting safety collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_112', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_112', 'lost', 'Charlie (Beagle, Dog) missing from Uttara Sector 11 Playground. Features: White blaze on snout with white tail flag and long drooping ears. Collar: Orange hunting safety collar. Reward: ৳18,000. Contact: Nafis Iqbal (+880 1719-334411).', 23.8765, 90.3912, 'Nafis Iqbal (+880 1719-334411)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_113', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Pepper', 'Dog', 'Pug', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800', 'Fawn with Black Mask. Wrinkled forehead with tightly curled double-curl tail and black velvety ears. Collar: Black padded harness with silver tag', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_113', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_113', 'lost', 'Pepper (Pug, Dog) missing from Shantinagar near Twin Towers. Features: Wrinkled forehead with tightly curled double-curl tail and black velvety ears. Collar: Black padded harness with silver tag. Reward: ৳12,000. Contact: Tanzeem Ahmed (+880 1688-554433).', 23.7382, 90.4131, 'Tanzeem Ahmed (+880 1688-554433)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_114', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Kiwi', 'Bird', 'African Grey Parrot', 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800', 'Silver Grey with Crimson Tail. Feather loss on chest ringed identification band on left foot. Collar: No collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_114', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_114', 'lost', 'Kiwi (African Grey Parrot, Bird) missing from Gulshan-1 Road 134. Features: Feather loss on chest ringed identification band on left foot. Collar: No collar. Reward: ৳20,000. Contact: Sarah Mahmud (+880 1755-667788).', 23.7781, 90.4158, 'Sarah Mahmud (+880 1755-667788)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_115', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Oreo', 'Cat', 'Tuxedo (Black and White)', '90.4011', 'Black body with pure white chest bib. white front paws. Collar: and white whiskers', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_115', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_115', '6000', 'Oreo (Tuxedo (Black and White), Cat) missing from Reflective silver collar. Features: white front paws. Collar: and white whiskers. Reward: ৳880. Contact: https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800 (Mahinur Begum).', null, 23.7461, 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800 (Mahinur Begum)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_116', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Zeus', 'Dog', 'Doberman Pinscher', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800', 'Black and Rust. Cropped erect ears with sleek glossy coat and athletic chest. Collar: Red studded leather collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_116', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_116', 'lost', 'Zeus (Doberman Pinscher, Dog) missing from Gulshan-2 Madani Avenue. Features: Cropped erect ears with sleek glossy coat and athletic chest. Collar: Red studded leather collar. Reward: ৳25,000. Contact: Ahsanul Karim (+880 1715-001122).', 23.7963, 90.4225, 'Ahsanul Karim (+880 1715-001122)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_117', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Oliver', 'Dog', 'Welsh Corgi', 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=800', 'Sable and White. Short stubby legs with large fox-like ears and white neck ruff. Collar: Green fabric collar with bell', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_117', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_117', 'lost', 'Oliver (Welsh Corgi, Dog) missing from Banani Block F. Features: Short stubby legs with large fox-like ears and white neck ruff. Collar: Green fabric collar with bell. Reward: ৳22,000. Contact: Raisa Ahmed (+880 1812-445566).', 23.7912, 90.4041, 'Raisa Ahmed (+880 1812-445566)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_118', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Mochi', 'Cat', 'Scottish Fold', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 'Cream Tabby. Folded ears with huge round owl-like copper eyes. Collar: Yellow velvet collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_118', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_118', 'lost', 'Mochi (Scottish Fold, Cat) missing from Dhanmondi Road 4/A. Features: Folded ears with huge round owl-like copper eyes. Collar: Yellow velvet collar. Reward: ৳15,000. Contact: Farhana Haque (+880 1915-778899).', 23.7431, 90.3789, 'Farhana Haque (+880 1915-778899)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_119', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Cooper', 'Dog', 'Labrador Retriever', 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800', 'Chocolate Brown. Broad otter tail with deep hazel eyes and athletic physique. Collar: Orange nylon collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_119', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_119', 'lost', 'Cooper (Labrador Retriever, Dog) missing from Bashundhara Block I. Features: Broad otter tail with deep hazel eyes and athletic physique. Collar: Orange nylon collar. Reward: ৳18,000. Contact: Mahir Zaman (+880 1618-990011).', 23.8211, 90.4356, 'Mahir Zaman (+880 1618-990011)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_120', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Loki', 'Dog', 'French Bulldog', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', 'Brindle Dark. Bat-shaped erect ears with flat wrinkly snout and compact muscular build. Collar: Grey camo harness', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_120', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_120', 'lost', 'Loki (French Bulldog, Dog) missing from Uttara Sector 3. Features: Bat-shaped erect ears with flat wrinkly snout and compact muscular build. Collar: Grey camo harness. Reward: ৳28,000. Contact: Sanjida Parvin (+880 1718-223344).', 23.8642, 90.3951, 'Sanjida Parvin (+880 1718-223344)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_121', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Gizmo', 'Cat', 'Maine Coon', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800', 'Brown Classic Tabby. Tufted lynx-like ear tips with bushy raccoon tail and lion-like mane ruff. Collar: Red breakaway collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_121', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_121', 'lost', 'Gizmo (Maine Coon, Cat) missing from Baridhara DOHS. Features: Tufted lynx-like ear tips with bushy raccoon tail and lion-like mane ruff. Collar: Red breakaway collar. Reward: ৳20,000. Contact: Kamrul Hassan (+880 1555-667788).', 23.8112, 90.4189, 'Kamrul Hassan (+880 1555-667788)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_122', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Daisy', 'Dog', 'Poodle (Standard)', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800', 'Apricot Cream. Curly fluffy hypoallergenic coat with pompom tail grooming. Collar: Purple collar with crystal rhinestones', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_122', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_122', 'lost', 'Daisy (Poodle (Standard), Dog) missing from Dhanmondi Road 15/A. Features: Curly fluffy hypoallergenic coat with pompom tail grooming. Collar: Purple collar with crystal rhinestones. Reward: ৳20,000. Contact: Nusrat Jahan (+880 1823-112233).', 23.7512, 90.3721, 'Nusrat Jahan (+880 1823-112233)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_123', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Rusty', 'Dog', 'Irish Setter', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800', 'Deep Mahogany Red. Feathered long ears and chest with sleek chestnut mahogany coat. Collar: Brown leather collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_123', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_123', 'lost', 'Rusty (Irish Setter, Dog) missing from Banani Road 19/A. Features: Feathered long ears and chest with sleek chestnut mahogany coat. Collar: Brown leather collar. Reward: ৳24,000. Contact: Zubair Al-Mamun (+880 1712-889900).', 23.7951, 90.4082, 'Zubair Al-Mamun (+880 1712-889900)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_124', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Chloe', 'Cat', 'Ragdoll', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 'Blue Bicolor. Vivid sapphire blue eyes with inverted white V mark on face and plush white mitts. Collar: Pink satin collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_124', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_124', 'lost', 'Chloe (Ragdoll, Cat) missing from Gulshan-1 Road 24. Features: Vivid sapphire blue eyes with inverted white V mark on face and plush white mitts. Collar: Pink satin collar. Reward: ৳16,000. Contact: Sabrina Mehnaz (+880 1922-334455).', 23.7812, 90.4172, 'Sabrina Mehnaz (+880 1922-334455)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_125', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Toby', 'Dog', 'Jack Russell Terrier', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800', 'White with Tan Patches. Rough coat with spot over left eye and constantly wagging tail. Collar: Blue striped nylon collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_125', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_125', 'lost', 'Toby (Jack Russell Terrier, Dog) missing from Mirpur 10 Circle. Features: Rough coat with spot over left eye and constantly wagging tail. Collar: Blue striped nylon collar. Reward: ৳10,000. Contact: Rashedul Islam (+880 1612-556677).', 23.8071, 90.3688, 'Rashedul Islam (+880 1612-556677)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_126', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Snowball', 'Rabbit', 'Holland Lop', 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800', 'Pure White. Floppy drooping ears with pink nose and soft fluffy cotton tail. Collar: No collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_126', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_126', 'lost', 'Snowball (Holland Lop, Rabbit) missing from Uttara Sector 5. Features: Floppy drooping ears with pink nose and soft fluffy cotton tail. Collar: No collar. Reward: ৳5,000. Contact: Ayesha Siddiqa (+880 1733-445566).', 23.8671, 90.3921, 'Ayesha Siddiqa (+880 1733-445566)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_127', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Sammy', 'Dog', 'Boxer', 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=800', 'Fawn with White Flash. Undershot jaw with muscular chest and docked tail. Collar: Black heavy duty collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_127', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_127', 'lost', 'Sammy (Boxer, Dog) missing from Mohakhali Wireless gate. Features: Undershot jaw with muscular chest and docked tail. Collar: Black heavy duty collar. Reward: ৳18,000. Contact: Shafiqul Alam (+880 1815-667788).', 23.7792, 90.4012, 'Shafiqul Alam (+880 1815-667788)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_128', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Ziggy', 'Cat', 'Bengal', 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800', 'Leopard Spotted Rosetted. Glittering gold coat with dark rosettes and nocturnal green eyes. Collar: Orange reflective collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_128', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_128', 'lost', 'Ziggy (Bengal, Cat) missing from Banani Road 27. Features: Glittering gold coat with dark rosettes and nocturnal green eyes. Collar: Orange reflective collar. Reward: ৳25,000. Contact: Tanvir Chowdhury (+880 1716-990011).', 23.7978, 90.4032, 'Tanvir Chowdhury (+880 1716-990011)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_129', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Buddy', 'Dog', 'Cocker Spaniel', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800', 'Golden Buff. Long silky pendulum ears with soulful brown eyes and white chest patch. Collar: Red plaid collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_129', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_129', 'lost', 'Buddy (Cocker Spaniel, Dog) missing from Bashundhara Block D. Features: Long silky pendulum ears with soulful brown eyes and white chest patch. Collar: Red plaid collar. Reward: ৳16,000. Contact: Mominul Huq (+880 1918-112233).', 23.8182, 90.4289, 'Mominul Huq (+880 1918-112233)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_130', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Nala', 'Cat', 'Abyssinian', 'https://images.unsplash.com/photo-1513360309081-36f20ca80216?w=800', 'Ruddy Agouti. Ticked coat resembling a wild cat with large alert almond eyes. Collar: Brown leather breakaway collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_130', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_130', 'lost', 'Nala (Abyssinian, Cat) missing from Dhanmondi Road 2. Features: Ticked coat resembling a wild cat with large alert almond eyes. Collar: Brown leather breakaway collar. Reward: ৳14,000. Contact: Laila Arjumand (+880 1615-334455).', 23.7412, 90.3812, 'Laila Arjumand (+880 1615-334455)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_131', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Buster', 'Dog', 'Bullmastiff', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800', 'Fawn with Black Mask. Massive broad skull with wrinkled brow and deep muscular chest. Collar: Thick spiked leather collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_131', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_131', 'lost', 'Buster (Bullmastiff, Dog) missing from Nikunja-2. Features: Massive broad skull with wrinkled brow and deep muscular chest. Collar: Thick spiked leather collar. Reward: ৳30,000. Contact: Tariqul Bashar (+880 1711-223344).', 23.8312, 90.4178, 'Tariqul Bashar (+880 1711-223344)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_132', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Penny', 'Dog', 'Dachshund', 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=800', 'Reddish Smooth. Long low body with short legs and floppy velvety ears. Collar: Yellow harness', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_132', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_132', 'lost', 'Penny (Dachshund, Dog) missing from Lalmatia Block C. Features: Long low body with short legs and floppy velvety ears. Collar: Yellow harness. Reward: ৳12,000. Contact: Shireen Akhtar (+880 1817-445566).', 23.7552, 90.3712, 'Shireen Akhtar (+880 1817-445566)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_133', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Casper', 'Cat', 'Turkish Angora', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800', 'White. Silky plume tail with amber eyes and slender aristocratic frame. Collar: Teal silk ribbon collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_133', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_133', 'lost', 'Casper (Turkish Angora, Cat) missing from Baridhara Road 8. Features: Silky plume tail with amber eyes and slender aristocratic frame. Collar: Teal silk ribbon collar. Reward: ৳15,000. Contact: Nasir Uddin (+880 1911-556677).', 23.8012, 90.4245, 'Nasir Uddin (+880 1911-556677)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_134', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Teddy', 'Dog', 'Chow Chow', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', 'Cinnamon Red. Dense double teddy-bear coat with distinctive blue-black tongue. Collar: Blue padded collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_134', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_134', 'lost', 'Teddy (Chow Chow, Dog) missing from Gulshan-2 Road 55. Features: Dense double teddy-bear coat with distinctive blue-black tongue. Collar: Blue padded collar. Reward: ৳25,000. Contact: Fahim Muntakim (+880 1717-667788).', 23.7942, 90.4132, 'Fahim Muntakim (+880 1717-667788)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_135', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Whiskers', 'Cat', 'Russian Blue', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800', 'Shimmering Silver Blue. Vivid emerald green eyes with silvery tipped fur. Collar: Silver buckle collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_135', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_135', 'lost', 'Whiskers (Russian Blue, Cat) missing from Dhanmondi Road 11/A. Features: Vivid emerald green eyes with silvery tipped fur. Collar: Silver buckle collar. Reward: ৳18,000. Contact: Dr. Anisur Rahman (+880 1819-778899).', 23.7491, 90.3741, 'Dr. Anisur Rahman (+880 1819-778899)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_136', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Champ', 'Dog', 'Pitbull Terrier', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800', 'Blue Fawn. Muscular square jaw with white blaze down chest and energetic tail. Collar: Red tactical harness', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_136', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_136', 'lost', 'Champ (Pitbull Terrier, Dog) missing from Mirpur 1 near Zoo road. Features: Muscular square jaw with white blaze down chest and energetic tail. Collar: Red tactical harness. Reward: ৳15,000. Contact: Jasim Mahmud (+880 1619-889900).', 23.8052, 90.3541, 'Jasim Mahmud (+880 1619-889900)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_137', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Mittens', 'Cat', 'Norwegian Forest Cat', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800', 'Amber Tabby with White. Tufted paws and ears with waterproof dense coat. Collar: Purple bell collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_137', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_137', 'lost', 'Mittens (Norwegian Forest Cat, Cat) missing from Banani Road 8. Features: Tufted paws and ears with waterproof dense coat. Collar: Purple bell collar. Reward: ৳20,000. Contact: Sultana Razia (+880 1713-990011).', 23.7891, 90.4052, 'Sultana Razia (+880 1713-990011)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_138', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Flash', 'Dog', 'Greyhound', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800', 'Fawn Brindle. Aerodynamic slender body with deep chest and long arched neck. Collar: Wide martingale collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_138', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_138', 'lost', 'Flash (Greyhound, Dog) missing from Bashundhara Block G. Features: Aerodynamic slender body with deep chest and long arched neck. Collar: Wide martingale collar. Reward: ৳22,000. Contact: Kazi Rashed (+880 1914-223344).', 23.8192, 90.4312, 'Kazi Rashed (+880 1914-223344)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_139', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Pip', 'Bird', 'Cockatiel', 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800', 'Grey and Yellow. Orange cheek patches with prominent yellow crest feathers. Collar: No collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_139', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_139', 'lost', 'Pip (Cockatiel, Bird) missing from Uttara Sector 13. Features: Orange cheek patches with prominent yellow crest feathers. Collar: No collar. Reward: ৳8,000. Contact: Nusrat Parveen (+880 1814-334455).', 23.8791, 90.3942, 'Nusrat Parveen (+880 1814-334455)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_140', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Simcoe', 'Dog', 'Australian Shepherd', 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800', 'Blue Merle. Mottled grey black and white coat with one blue eye and one brown eye. Collar: Teal woven collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_140', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_140', 'lost', 'Simcoe (Australian Shepherd, Dog) missing from Dhanmondi Road 9/A. Features: Mottled grey black and white coat with one blue eye and one brown eye. Collar: Teal woven collar. Reward: ৳26,000. Contact: Arindam Ghosh (+880 1718-445566).', 23.7472, 90.3732, 'Arindam Ghosh (+880 1718-445566)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_141', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Cleopatra', 'Cat', 'Sphynx', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 'Hairless Pink and Grey. Wrinkled suede skin with large bat ears and lemon-shaped eyes. Collar: Fleece warm sweater', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_141', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_141', 'lost', 'Cleopatra (Sphynx, Cat) missing from Gulshan-1 Avenue. Features: Wrinkled suede skin with large bat ears and lemon-shaped eyes. Collar: Fleece warm sweater. Reward: ৳35,000. Contact: Tahira Kabir (+880 1613-556677).', 23.7831, 90.4142, 'Tahira Kabir (+880 1613-556677)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_142', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Scout', 'Dog', 'Border Collie', '23.7962', 'Black and White. Classic white blaze on face. Collar: white collar neck ruff', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_142', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_142', '+880 1816-667788', 'Scout (Border Collie, Dog) missing from and intense herding gaze. Features: Classic white blaze on face. Collar: white collar neck ruff. Reward: ৳15,000. Contact: 90.4021 (https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800).', null, null, '90.4021 (https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_143', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Mocha', 'Dog', 'Cavalier King Charles', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', 'Blenheim Chestnut and White. Silky feathering on ears and feet with soulful large dark eyes. Collar: Pink jeweled collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_143', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_143', 'lost', 'Mocha (Cavalier King Charles, Dog) missing from Baridhara Park road. Features: Silky feathering on ears and feet with soulful large dark eyes. Collar: Pink jeweled collar. Reward: ৳22,000. Contact: Zinat Ara (+880 1715-778899).', 23.8031, 90.4212, 'Zinat Ara (+880 1715-778899)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_144', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Shadow', 'Cat', 'Bombay', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800', 'Solid Jet Black. Glossy patent leather black coat with bright copper-penny eyes. Collar: Green glow reflective collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_144', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_144', 'lost', 'Shadow (Bombay, Cat) missing from Lalmatia Block E. Features: Glossy patent leather black coat with bright copper-penny eyes. Collar: Green glow reflective collar. Reward: ৳10,000. Contact: Mahbubul Huq (+880 1913-889900).', 23.7591, 90.3681, 'Mahbubul Huq (+880 1913-889900)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_145', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Barnaby', 'Dog', 'Basset Hound', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800', 'Tri-color. Long velvety drooping ears with wrinkled brow and short bowed front legs. Collar: Brown harness', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_145', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_145', 'lost', 'Barnaby (Basset Hound, Dog) missing from Mirpur DOHS Road 7. Features: Long velvety drooping ears with wrinkled brow and short bowed front legs. Collar: Brown harness. Reward: ৳18,000. Contact: Major Sayed (+880 1614-990011).', 23.8372, 90.3721, 'Major Sayed (+880 1614-990011)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_146', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Puff', 'Rabbit', 'Netherland Dwarf', 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800', 'Smoke Grey. Tiny erect ears with compact round body and bright curious eyes. Collar: No collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_146', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_146', 'lost', 'Puff (Netherland Dwarf, Rabbit) missing from Bashundhara Block B. Features: Tiny erect ears with compact round body and bright curious eyes. Collar: No collar. Reward: ৳6,000. Contact: Sharmin Sultana (+880 1714-001122).', 23.8132, 90.4291, 'Sharmin Sultana (+880 1714-001122)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_147', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Kobe', 'Dog', 'Akita Inu', 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800', 'Red Fawn with White Mask. Plush double coat with curled tail curled tightly over back. Collar: Wide black nylon collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_147', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_147', 'lost', 'Kobe (Akita Inu, Dog) missing from Uttara Sector 1. Features: Plush double coat with curled tail curled tightly over back. Collar: Wide black nylon collar. Reward: ৳30,000. Contact: Tanvirul Islam (+880 1818-112233).', 23.8612, 90.3972, 'Tanvirul Islam (+880 1818-112233)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_148', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Honey', 'Cat', 'Persian Chinchilla', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 'Silver Shaded White. Emerald green eyes lined with black eyeliner and black paw pads. Collar: Pink rhinestone collar', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_148', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_148', 'lost', 'Honey (Persian Chinchilla, Cat) missing from Dhanmondi Road 28. Features: Emerald green eyes lined with black eyeliner and black paw pads. Collar: Pink rhinestone collar. Reward: ৳18,000. Contact: Dr. Rehana Begum (+880 1916-223344).', 23.7562, 90.3771, 'Dr. Rehana Begum (+880 1916-223344)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_149', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Thor', 'Dog', 'Great Dane', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800', 'Harlequin (White with Torn Black Patches). Towering height with elegant long stride and deep muzzle. Collar: Thick leather collar with brass handle', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_149', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_149', 'lost', 'Thor (Great Dane, Dog) missing from Gulshan-2 Lake road. Features: Towering height with elegant long stride and deep muzzle. Collar: Thick leather collar with brass handle. Reward: ৳35,000. Contact: Saadman Sakib (+880 1719-334455).', 23.7915, 90.4182, 'Saadman Sakib (+880 1719-334455)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

INSERT INTO "Pet" (id, "ownerId", name, species, breed, "avatarUrl", bio, "updatedAt")
VALUES ('pet_lf_150', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'Chico', 'Dog', 'Chihuahua', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800', 'Tan and White. Apple-domed skull with large bat ears and tiny delicate frame. Collar: Red festive sweater', NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, "avatarUrl" = EXCLUDED."avatarUrl", "updatedAt" = NOW();

INSERT INTO "LostFoundPost" (id, "ownerId", "petId", status, description, "lastSeenLat", "lastSeenLng", "contactInfo", "createdAt")
VALUES ('lf_post_lf_150', 'bc91e5f8-e013-4a5a-991a-35a8aaac8758', 'pet_lf_150', 'lost', 'Chico (Chihuahua, Dog) missing from Mohakhali DOHS Road 5. Features: Apple-domed skull with large bat ears and tiny delicate frame. Collar: Red festive sweater. Reward: ৳10,000. Contact: Farzana Yasmin (+880 1617-445566).', 23.7751, 90.3962, 'Farzana Yasmin (+880 1617-445566)', NOW())
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, "lastSeenLat" = EXCLUDED."lastSeenLat", "lastSeenLng" = EXCLUDED."lastSeenLng", "contactInfo" = EXCLUDED."contactInfo";

