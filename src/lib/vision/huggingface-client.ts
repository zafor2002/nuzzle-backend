import { logger } from '@/lib/logger';

export interface HuggingFaceZeroShotResult {
  label: string;
  score: number;
}

export class HuggingFaceClient {
  private apiKey: string;
  private defaultClipModel: string;
  private defaultSiglipModel: string;

  constructor() {
    this.apiKey =
      process.env.HUGGINGFACE_API_KEY ||
      process.env.HF_TOKEN ||
      process.env.HUGGINGFACE_TOKEN ||
      '';
    this.defaultClipModel =
      process.env.HF_CLIP_MODEL || 'openai/clip-vit-base-patch32';
    this.defaultSiglipModel =
      process.env.HF_SIGLIP_MODEL || 'google/siglip-base-patch16-224';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey.trim()}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Convert an image URL or Base64 data URI into a binary Buffer.
   */
  private async resolveImageBuffer(imageUrlOrBase64: string): Promise<Buffer> {
    if (imageUrlOrBase64.startsWith('data:')) {
      const commaIdx = imageUrlOrBase64.indexOf(',');
      const base64Data = commaIdx > -1 ? imageUrlOrBase64.substring(commaIdx + 1) : imageUrlOrBase64;
      return Buffer.from(base64Data, 'base64');
    }

    if (imageUrlOrBase64.startsWith('http://') || imageUrlOrBase64.startsWith('https://')) {
      const res = await fetch(imageUrlOrBase64, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        throw new Error(`Failed to fetch image from URL [${res.status}]: ${imageUrlOrBase64}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    // Treat as raw base64 string
    return Buffer.from(imageUrlOrBase64, 'base64');
  }

  /**
   * Compute dense visual feature embeddings for a pet image using CLIP.
   * Endpoint: POST https://router.huggingface.co/hf-inference/models/{model}
   */
  async getImageEmbedding(imageUrlOrBase64: string, model = this.defaultClipModel): Promise<number[]> {
    if (!this.isConfigured()) {
      throw new Error('Hugging Face API token is not configured. Set HUGGINGFACE_API_KEY in .env.local');
    }

    const imageBuffer = await this.resolveImageBuffer(imageUrlOrBase64);
    const endpoint = `https://router.huggingface.co/hf-inference/models/${model}`;

    logger.info(`Hugging Face: Requesting visual embeddings from ${model}`);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey.trim()}`,
        'Content-Type': 'application/octet-stream',
      },
      body: new Uint8Array(imageBuffer),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Hugging Face Inference API error [${res.status}]: ${errText}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && typeof data[0] === 'number') {
      return data;
    }
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0];
    }
    throw new Error('Unexpected embedding format returned from Hugging Face');
  }

  /**
   * Zero-shot visual classification of a pet image against candidate descriptions/labels.
   * e.g. ["Rocky German Shepherd", "Luna Golden Retriever", "Milo White Persian Cat"]
   */
  async classifyZeroShot(
    imageUrlOrBase64: string,
    candidateLabels: string[],
    model = this.defaultClipModel
  ): Promise<HuggingFaceZeroShotResult[]> {
    if (!this.isConfigured()) {
      throw new Error('Hugging Face API token is not configured. Set HUGGINGFACE_API_KEY in .env.local');
    }

    const imageBuffer = await this.resolveImageBuffer(imageUrlOrBase64);
    const base64Image = imageBuffer.toString('base64');
    const endpoint = `https://router.huggingface.co/hf-inference/models/${model}`;

    logger.info(`Hugging Face: Zero-shot visual classification against ${candidateLabels.length} candidate labels`);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        image: base64Image,
        parameters: {
          candidate_labels: candidateLabels,
        },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Hugging Face Zero-Shot error [${res.status}]: ${errText}`);
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        label: item.label,
        score: typeof item.score === 'number' ? item.score : 0,
      }));
    }

    return [];
  }

  /**
   * Deep visual biometric matching using state-of-the-art Qwen2.5-VL-72B on Hugging Face Router.
   * Compares the sighted pet photo directly against registered lost pet profiles.
   */
  async matchPetBiometricsWithVision(
    imageUrl: string,
    candidates: any[],
    sightingDescription: string,
    model = 'Qwen/Qwen2.5-VL-72B-Instruct'
  ): Promise<{
    isPet: boolean;
    detectedSubject?: string;
    detectedSpecies?: string;
    detectedBreed?: string;
    matchedCandidateId: string | null;
    matchStatus: 'VISUAL_BIOMETRIC_MATCH' | 'NO_MATCH' | 'NOT_A_PET';
    confidenceScore: number;
    visualComparison?: {
      coatMatch?: string;
      facialAndEars?: string;
      collarObserved?: string;
      distinctiveFeatures?: string;
    };
    aiAnalysis: string;
  } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const candidateSummary = candidates
      .map(
        (c, i) =>
          `[Candidate ${i + 1}] ID: "${c.id}", Pet Name: "${c.pet?.name}", Species: "${c.pet?.species || 'Dog'}", Breed: "${c.pet?.breed}", Description: "${c.description}"`
      )
      .join('\n');

    const prompt = `You are Nuzzle Visual Pet Biometric AI.
Analyze the provided image with clinical accuracy.

STEP 1 - SUBJECT VERIFICATION:
- Is there an actual domestic pet (dog, cat, rabbit, bird, etc.) in the image?
- If the image depicts a human (politician, celebrity, man, woman, person, selfie), clothing, car, document, building, food, or any non-pet object:
  Set:
  "isPet": false,
  "detectedSubject": "<human / person / object detected>",
  "matchedCandidateId": null,
  "matchStatus": "NOT_A_PET",
  "confidenceScore": 0.0,
  "aiAnalysis": "The uploaded photo does not depict a pet. Sighting analysis detected a human or non-pet subject. Please upload a clear photo of the sighted animal."

STEP 2 - PET BIOMETRIC COMPARISON (Only if isPet is true):
Analyze the pet's species, breed morphology, facial structure, coat coloration, and any visible collar/tag.
Compare against these candidate lost pets:
${candidateSummary}

Rules for matching:
- A dog must NEVER match a cat or rabbit.
- Different breeds (e.g. Beagle vs German Shepherd) must NOT match unless there is clear visual ambiguity.
- If there is a genuine visual match with one candidate, set:
  "isPet": true,
  "matchedCandidateId": "<ID of matching candidate>",
  "matchStatus": "VISUAL_BIOMETRIC_MATCH",
  "confidenceScore": <number between 0.75 and 0.98>
- If the pet does NOT match any candidate in the list, set:
  "isPet": true,
  "matchedCandidateId": null,
  "matchStatus": "NO_MATCH",
  "confidenceScore": <number between 0.05 and 0.35>,
  "aiAnalysis": "Sighted pet identified as a <detectedBreed>, but does not match any currently active lost pet reports in the radar database."

User sighting notes: "${sightingDescription}".

Return ONLY a strict JSON object:
{
  "isPet": <boolean>,
  "detectedSubject": "<e.g. Human / Dog / Cat>",
  "detectedSpecies": "<Dog, Cat, Rabbit, Bird, or None>",
  "detectedBreed": "<identified breed or N/A>",
  "matchedCandidateId": <string ID or null>,
  "matchStatus": "<VISUAL_BIOMETRIC_MATCH | NO_MATCH | NOT_A_PET>",
  "confidenceScore": <number between 0.0 and 1.0>,
  "visualComparison": {
    "coatMatch": "<comparison of coat color and patterns>",
    "facialAndEars": "<comparison of ears, eyes, muzzle>",
    "collarObserved": "<collar or tag observations>",
    "distinctiveFeatures": "<any notable unique marks>"
  },
  "aiAnalysis": "<crisp 2-sentence clinical explanation>"
}`;

    let resolvedImageUrl = imageUrl;
    try {
      const buf = await this.resolveImageBuffer(imageUrl);
      resolvedImageUrl = `data:image/jpeg;base64,${buf.toString('base64')}`;
    } catch (imgErr) {
      logger.warn('Notice converting image to base64:', { error: String(imgErr) });
    }

    const endpoint = 'https://router.huggingface.co/v1/chat/completions';
    logger.info(`Hugging Face Vision: Comparing pet photo with ${candidates.length} candidates using ${model}`);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: resolvedImageUrl } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 600,
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      const err = await res.text();
      logger.warn(`Hugging Face Vision API error [${res.status}]: ${err}`);
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Calculate Cosine Similarity between two visual feature vectors.
   */
  computeCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }
}

export const huggingFaceClient = new HuggingFaceClient();
