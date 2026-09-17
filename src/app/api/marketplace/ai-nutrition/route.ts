import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiSuccess, apiError, handleOptions, withErrorHandler } from '@/lib/api-response';
import { mairaClient } from '@/lib/maira/maira-client';
import { logger } from '@/lib/logger';

export async function OPTIONS() {
  return handleOptions();
}

const nutritionQuerySchema = z.object({
  species: z.string().default('Dog'),
  breed: z.string().optional(),
  age: z.string().optional(),
  weight: z.string().optional(),
  allergies: z.string().optional(),
  query: z.string().min(2, 'Query must be at least 2 characters long'),
  imageUrl: z.string().url().optional(),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = nutritionQuerySchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400, parsed.error.issues);
  }

  const { species, breed, age, weight, allergies, query } = parsed.data;
  const profileId = process.env.MAIRA_MARKETPLACE_PROFILE_ID || '66e15325';
  const datasetId = process.env.MAIRA_MARKETPLACE_DATASET_ID;

  let adviceNarrative = '';
  let providerUsed = 'Nuzzle Nutrition Intelligence Engine';
  let recommendedProducts: any[] = [];

  // 1. Try Gigalogy MAIRA if configured
  if (mairaClient.isConfigured()) {
    try {
      logger.info('Marketplace Nutrition: Querying MAIRA RAG...', { query, profileId });
      const prompt = `[Patient: ${species}, Breed: ${breed || 'N/A'}, Age: ${age || 'N/A'}, Weight: ${weight || 'N/A'}, Allergies: ${allergies || 'None'}] Question: ${query}`;

      const mairaRes = await mairaClient.ask({
        user_id: `nutrition_usr_${Date.now()}`,
        query: prompt,
        conversation_type: 'question',
        gpt_profile_id: profileId,
        context_preference: datasetId ? { preferred: { dataset_id: datasetId } } : undefined,
        top_k: 8,
        is_keyword_enabled: true,
      });

      adviceNarrative = mairaRes.answer;
      providerUsed = 'Gigalogy MAIRA Nutrition Advisor (Profile: 66e15325)';
    } catch (err: any) {
      logger.warn('MAIRA Nutrition query failed, using built-in clinical dietary fallback:', err?.message || err);
    }
  }

  // 2. Built-in nutrition rules fallback
  if (!adviceNarrative) {
    const isCat = species.toLowerCase().includes('cat') || species.toLowerCase().includes('kitten');
    const lowerQ = query.toLowerCase();

    // Check toxic foods
    let toxicityWarning: string | null = null;
    if (lowerQ.includes('chocolate') || lowerQ.includes('grape') || lowerQ.includes('raisin') || lowerQ.includes('onion') || lowerQ.includes('garlic') || lowerQ.includes('xylitol')) {
      toxicityWarning = '⚠️ STRICT DANGER: This item is toxic to pets and can cause acute organ failure. Do NOT feed!';
    } else if (lowerQ.includes('watermelon') || lowerQ.includes('apple') || lowerQ.includes('pumpkin') || lowerQ.includes('carrot') || lowerQ.includes('blueberry')) {
      toxicityWarning = '✅ SAFE IN MODERATION: Seedless watermelon, carrots, cooked pumpkin, and blueberries are healthy, fiber-rich treats.';
    }

    adviceNarrative = isCat
      ? `For a ${age || 'adult'} ${breed || 'feline'}, strict animal protein and mandatory Taurine are essential. Cats are obligate carnivores and must not be fed vegetarian or grain-heavy diets. Ensure plenty of moisture through high-quality wet food to support renal and urinary health.`
      : `For a ${age || 'adult'} ${breed || 'canine'}, a balanced protein-to-fat ratio with wholesome carbohydrates (sweet potato, brown rice) supports sustained energy. For pets weighing ${weight || 'standard weight'}, divide portions into two measured meals daily.`;

    if (toxicityWarning) {
      adviceNarrative = `${toxicityWarning}\n\n${adviceNarrative}`;
    }

    recommendedProducts = isCat
      ? [
          {
            id: 'mkt_cat_1',
            name: 'Royal Canin Feline Health Nutrition (Adult Instinctive Wet & Dry)',
            category: 'Cat Food',
            price: 2450,
            currency: 'BDT',
            matchReason: 'Rich in dietary Taurine, Omega-3, and urinary tract pH control.',
            seller: 'UrbanHound Dhaka Official',
          },
          {
            id: 'mkt_cat_2',
            name: 'Pure Wild Alaskan Salmon Oil (Coat & Skin Health)',
            category: 'Supplements',
            price: 1650,
            currency: 'BDT',
            matchReason: 'Reduces seasonal shedding and supports joint mobility.',
            seller: 'Nuzzle Verified Pet Care',
          },
        ]
      : [
          {
            id: 'mkt_dog_1',
            name: 'Farmina N&D Ocean Salmon & Cod (Grain-Free Hypoallergenic)',
            category: 'Dog Food',
            price: 3800,
            currency: 'BDT',
            matchReason: 'Single novel marine protein source ideal for sensitive stomachs and chicken allergies.',
            seller: 'UrbanHound Dhaka Official',
          },
          {
            id: 'mkt_dog_2',
            name: 'Glucosamine & Chondroitin Hip Joint Chews',
            category: 'Supplements',
            price: 1950,
            currency: 'BDT',
            matchReason: 'Strengthens cartilage and eases joint mobility in growing and adult dogs.',
            seller: 'Cascade Vet Supply',
          },
        ];
  }

  return apiSuccess({
    query,
    species,
    breed: breed || 'Not specified',
    dietaryGuidance: adviceNarrative,
    recommendedProducts,
    provider: providerUsed,
    profileId,
    timestamp: new Date().toISOString(),
  }, 200, 'Nutrition and diet consultation generated successfully.');
});
