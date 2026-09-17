import { ILLMProvider, TriageRequest, TriageResult, ChatRequest, ChatResponse } from './types';
import { GeminiProvider } from './gemini-provider';
import { OpenAIProvider } from './openai-provider';
import { MairaProvider } from './maira-provider';
import { FallbackProvider } from './fallback-provider';
import { logger } from '@/lib/logger';

export * from './types';
export * from './prompts';
export * from './emergency-guard';
export * from './gemini-provider';
export * from './openai-provider';
export * from './maira-provider';
export * from './fallback-provider';

let cachedProvider: ILLMProvider | null = null;
const fallbackProvider = new FallbackProvider();

/**
 * Build the ordered list of ALL available live LLM providers.
 * The preferred provider goes first, followed by any others that have valid API keys.
 */
function buildProviderCascade(): ILLMProvider[] {
  const providers: ILLMProvider[] = [];
  const preferred = (process.env.LLM_PROVIDER || 'openai').toLowerCase();

  // Create all candidate providers
  const maira = process.env.MAIRA_API_KEY ? new MairaProvider() : null;
  const openai = process.env.OPENAI_API_KEY ? new OpenAIProvider() : null;
  const gemini = process.env.GEMINI_API_KEY ? new GeminiProvider() : null;

  // Add the preferred provider first
  if (preferred === 'maira' && maira) providers.push(maira);
  else if (preferred === 'openai' && openai) providers.push(openai);
  else if (preferred === 'gemini' && gemini) providers.push(gemini);

  // Add all remaining providers that aren't already in the list
  if (openai && !providers.some(p => p instanceof OpenAIProvider)) providers.push(openai);
  if (gemini && !providers.some(p => p instanceof GeminiProvider)) providers.push(gemini);
  if (maira && !providers.some(p => p instanceof MairaProvider)) providers.push(maira);

  return providers;
}

let providerCascade: ILLMProvider[] | null = null;

function getProviderCascade(): ILLMProvider[] {
  if (!providerCascade) {
    providerCascade = buildProviderCascade();
    if (providerCascade.length > 0) {
      logger.info(`LLM Factory: Cascade initialized → [${providerCascade.map(p => p.name).join(' → ')} → Dynamic Heuristic Fallback]`);
    } else {
      logger.warn('LLM Factory: No live LLM API keys detected. Using Nuzzle Clinical Heuristic Engine (Dynamic).');
    }
  }
  return providerCascade;
}

export function getLLMStatus() {
  const cascade = getProviderCascade();
  return {
    preferred: process.env.LLM_PROVIDER || 'auto',
    hasMairaKey: Boolean(process.env.MAIRA_API_KEY && process.env.MAIRA_API_KEY.length > 5),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5),
    activeCascade: cascade.map(p => p.name),
    fallbackEngine: fallbackProvider.name,
  };
}

export function getLLMProvider(): ILLMProvider {
  if (cachedProvider) {
    return cachedProvider;
  }
  const cascade = getProviderCascade();
  cachedProvider = cascade[0] || fallbackProvider;
  return cachedProvider;
}


/**
 * Resilient triage execution with multi-tier cascade failover.
 * Tries: Primary LLM → Secondary LLM → … → Static Heuristic Engine
 */
export async function executeTriageWithFailover(req: TriageRequest): Promise<TriageResult> {
  const cascade = getProviderCascade();

  for (const provider of cascade) {
    try {
      const result = await provider.triage(req);
      return result;
    } catch (error: any) {
      logger.warn(`LLM provider [${provider.name}] failed during triage. Trying next provider… Error: ${error?.message || error}`);
    }
  }

  // All live providers exhausted — use static heuristic engine
  logger.warn('All LLM providers failed during triage. Using static Clinical Heuristic Engine.');
  return await fallbackProvider.triage(req);
}

/**
 * Resilient chat execution with multi-tier cascade failover.
 * Tries: Primary LLM → Secondary LLM → … → Static Heuristic Engine
 */
export async function executeChatWithFailover(req: ChatRequest): Promise<ChatResponse> {
  const cascade = getProviderCascade();

  for (const provider of cascade) {
    try {
      const result = await provider.chat(req);
      return result;
    } catch (error: any) {
      logger.warn(`LLM provider [${provider.name}] failed during chat. Trying next provider… Error: ${error?.message || error}`);
    }
  }

  // All live providers exhausted — use static heuristic engine
  logger.warn('All LLM providers failed during chat. Using static Clinical Heuristic Engine.');
  return await fallbackProvider.chat(req);
}
