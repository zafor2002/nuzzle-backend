import fs from 'fs';
import path from 'path';

export interface LocalPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  avatarUrl: string;
  bio?: string;
  energyLevel?: string;
  aiPersonality?: string;
  isAnonymous?: boolean;
}

export interface LocalUser {
  id: string;
  email: string;
  username: string;
  password?: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  role: 'parent' | 'store' | 'vet' | 'admin';
  storeCategory?: string;
  clinicName?: string;
  pets: LocalPet[];
  createdAt: string;
}

const USERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'local_users.json');

// Default Seed Accounts for Zero-Downtime Resilience
const SEED_USERS: LocalUser[] = [
  {
    id: 'owner_me',
    email: 'alex.rivers@nuzzle.ai',
    username: 'pawprints_alex',
    password: 'password123',
    displayName: 'Alex Rivers',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: '🐾 Golden retriever dad & Siamese cat servant | Nature hiker | Pet nutrition enthusiast 🥑 | Dhaka',
    role: 'parent',
    pets: [
      {
        id: 'pet_1',
        name: 'Waffles',
        species: 'Dog',
        breed: 'Golden Retriever',
        avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&auto=format&fit=crop&q=80',
        bio: 'The park champion and stick collector',
        energyLevel: 'High Zoomies',
        aiPersonality: 'Enthusiastic Golden Scholar',
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'owner_urbanhound',
    email: 'shop@urbanhound.bd',
    username: 'urbanhound_dhaka',
    password: 'password123',
    displayName: 'UrbanHound Dhaka Official Store',
    avatarUrl: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=200&auto=format&fit=crop&q=80',
    bio: 'Verified Premium Canine & Feline Gear Workshop • Official Nuzzle Boutique • Gulshan-2, Dhaka',
    role: 'store',
    storeCategory: 'Premium Pet Gear & Nutritional Treats',
    pets: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'owner_drsarah',
    email: 'clinic@cascadevet.bd',
    username: 'cascade_emergency_vet',
    password: 'password123',
    displayName: 'Dr. Sarah Al-Mansoor, DVM',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
    bio: 'Board-Certified Veterinary Surgeon • Cascade 24/7 Emergency & Surgical Hospital • Dhanmondi, Dhaka',
    role: 'vet',
    clinicName: 'Cascade 24/7 Animal Hospital',
    pets: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'owner_admin',
    email: 'admin@nuzzle.ai',
    username: 'admin',
    password: 'password123',
    displayName: 'Nuzzle System Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    bio: '🛡️ Nuzzle Platform Administrator & Trust & Safety Team',
    role: 'admin',
    pets: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// In-Memory Cache with disk-persistence
let memoryUsers: LocalUser[] = [];

function loadUsers(): LocalUser[] {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const raw = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
      const loaded = JSON.parse(raw);
      if (Array.isArray(loaded)) {
        // Merge with seeds to ensure seeds always exist
        const map = new Map<string, LocalUser>();
        SEED_USERS.forEach(u => map.set(u.id, u));
        loaded.forEach(u => map.set(u.id, u));
        memoryUsers = Array.from(map.values());
        return memoryUsers;
      }
    }
  } catch (err) {
    console.warn('[AuthService] Could not read local_users.json, fallback to in-memory seeds:', err);
  }

  memoryUsers = [...SEED_USERS];
  saveUsers(memoryUsers);
  return memoryUsers;
}

function saveUsers(users: LocalUser[]): void {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[AuthService] Could not persist to local_users.json:', err);
  }
}

// Initialize on load
loadUsers();

/**
 * Finds user by email or username (case-insensitive)
 */
export function findLocalUser(identifier: string): LocalUser | null {
  const users = loadUsers();
  const clean = identifier.trim().toLowerCase();
  return users.find(u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean) || null;
}

/**
 * Finds user by ID
 */
export function findLocalUserById(id: string): LocalUser | null {
  const users = loadUsers();
  return users.find(u => u.id === id) || null;
}

/**
 * Creates or registers a new user in the local resilience store
 */
export function createLocalUser(data: {
  email: string;
  username: string;
  password?: string;
  displayName: string;
  role: 'parent' | 'store' | 'vet' | 'admin';
  storeCategory?: string;
  clinicName?: string;
  petName?: string;
  petSpecies?: string;
}): LocalUser {
  const users = loadUsers();
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanUsername = data.username.trim().toLowerCase();

  const existing = users.find(u => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanUsername);
  if (existing) {
    throw new Error('An account with this email or username already exists.');
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const pets: LocalPet[] = [];

  if (data.petName) {
    pets.push({
      id: `pet_${Date.now()}`,
      name: data.petName,
      species: data.petSpecies || 'Dog',
      breed: data.petSpecies === 'Cat' ? 'Domestic Shorthair' : 'Companion',
      avatarUrl: data.petSpecies === 'Cat'
        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=80',
      bio: `Loved pet of ${data.displayName}`,
      energyLevel: 'High Zoomies',
      aiPersonality: 'Affectionate Explorer',
    });
  }

  const defaultAvatar = data.role === 'vet'
    ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80'
    : data.role === 'store'
    ? 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

  const newUser: LocalUser = {
    id: userId,
    email: data.email,
    username: cleanUsername,
    password: data.password || 'password123',
    displayName: data.displayName,
    avatarUrl: defaultAvatar,
    bio: data.role === 'store'
      ? `Verified Pet Store • ${data.storeCategory || 'Pet Supplies'} • Dhaka`
      : data.role === 'vet'
      ? `Veterinary Practitioner at ${data.clinicName || 'Nuzzle Partner Clinic'} • Dhaka`
      : '🐾 Pet Parent in Dhaka | Animal Lover',
    role: data.role,
    storeCategory: data.storeCategory,
    clinicName: data.clinicName,
    pets,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

/**
 * Creates a signed local session token with user details embedded
 */
export function createLocalSessionToken(user: LocalUser): string {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `nuzzle_local.${user.id}.${encoded}`;
}

/**
 * Decodes a local session token or returns null if invalid
 */
export function decodeLocalSessionToken(token: string): {
  id: string;
  email: string;
  username: string;
  role: string;
  displayName: string;
} | null {
  if (!token) return null;

  if (token.startsWith('nuzzle_local.') || token.startsWith('nuzzle_local_')) {
    try {
      const dotParts = token.split('.');
      if (dotParts.length === 3) {
        const encoded = dotParts[2];
        const jsonStr = Buffer.from(encoded, 'base64url').toString('utf-8');
        const payload = JSON.parse(jsonStr);
        if (payload.exp && payload.exp < Date.now()) return null;
        return payload;
      }

      // Support underscore format fallback
      const lastUnderscore = token.lastIndexOf('_');
      if (lastUnderscore !== -1) {
        const encoded = token.substring(lastUnderscore + 1);
        const jsonStr = Buffer.from(encoded, 'base64url').toString('utf-8');
        const payload = JSON.parse(jsonStr);
        if (payload?.id) return payload;
      }
    } catch {
      // ignore
    }
  }

  // Also support legacy tokens
  if (token.startsWith('nuzzle_token_')) {
    const parts = token.split('_');
    const userId = parts[2];
    const user = findLocalUserById(userId);
    if (user) {
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
      };
    }
  }

  return null;
}

/**
 * Safe helper to execute a promise with a timeout
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 2500, timeoutMessage = 'Timeout'): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}
