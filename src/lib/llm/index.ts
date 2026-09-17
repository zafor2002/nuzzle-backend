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

export function getLLMProvider(): ILLMProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const preferred = (process.env.LLM_PROVIDER || 'openai').toLowerCase();

  if (preferred === 'maira' && process.env.MAIRA_API_KEY) {
    logger.info('LLM Factory: Initialized Gigalogy MAIRA Managed RAG provider');
    cachedProvider = new MairaProvider();
    return cachedProvider;
  }

  if (preferred === 'openai' && process.env.OPENAI_API_KEY) {
    logger.info('LLM Factory: Initialized OpenAI provider');
    cachedProvider = new OpenAIProvider();
    return cachedProvider;
  }

  if (preferred === 'gemini' && process.env.GEMINI_API_KEY) {
    logger.info('LLM Factory: Initialized Google Gemini provider');
    cachedProvider = new GeminiProvider();
    return cachedProvider;
  }

  // Auto-detect any configured key
  if (process.env.MAIRA_API_KEY) {
    logger.info('LLM Factory: Auto-detected MAIRA_API_KEY, using Gigalogy MAIRA RAG');
    cachedProvider = new MairaProvider();
    return cachedProvider;
  }

  if (process.env.OPENAI_API_KEY) {
    logger.info('LLM Factory: Auto-detected OPENAI_API_KEY, using OpenAI');
    cachedProvider = new OpenAIProvider();
    return cachedProvider;
  }

  if (process.env.GEMINI_API_KEY) {
    logger.info('LLM Factory: Auto-detected GEMINI_API_KEY, using Google Gemini');
    cachedProvider = new GeminiProvider();
    return cachedProvider;
  }

  logger.warn('LLM Factory: No live LLM API key detected. Using Nuzzle Clinical Heuristic Engine (zero-downtime offline fallback).');
  cachedProvider = fallbackProvider;
  return cachedProvider;
}


/**
 * Resilient triage execution with automatic failover to the clinical heuristic engine.
 */
export async function executeTriageWithFailover(req: TriageRequest): Promise<TriageResult> {
  const provider = getLLMProvider();

  try {
    return await provider.triage(req);
  } catch (error: any) {
    logger.warn(`LLM provider [${provider.name}] failed during triage. Executing zero-downtime fallback. Error: ${error?.message || error}`);
    return await fallbackProvider.triage(req);
  }
}

/**
 * Resilient chat execution with automatic failover.
 */
export async function executeChatWithFailover(req: ChatRequest): Promise<ChatResponse> {
  const provider = getLLMProvider();

  try {
    return await provider.chat(req);
  } catch (error: any) {
    logger.warn(`LLM provider [${provider.name}] failed during chat. Executing zero-downtime fallback. Error: ${error?.message || error}`);
    return await fallbackProvider.chat(req);
  }
}
