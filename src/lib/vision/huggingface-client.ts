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
