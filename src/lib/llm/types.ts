export type UrgencyLevel = 'low' | 'moderate' | 'emergency';

export interface RecommendedClinic {
  id: string;
  name: string;
  clinicName: string;
  phone: string;
  location: string;
  isProPriority: boolean;
}

export interface TriageRequest {
  petName?: string;
  species?: string;
  breed?: string;
  age?: string;
  symptoms: string;
  duration?: string;
  isProSubscriber?: boolean;
}

export interface TriageResult {
  triageId: string;
  petName: string;
  species: string;
  urgency: UrgencyLevel;
  urgencyLabel: string;
  urgencyColor: string;
  summary: string;
  recommendedActions: string[];
  redFlags: string[];
  recommendedClinic: RecommendedClinic;
  disclaimer: string;
  createdAt: string;
  provider: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface PetContext {
  petName?: string;
  species?: string;
  breed?: string;
  age?: string;
  weight?: string;
  isProSubscriber?: boolean;
}

export interface ChatRequest {
  messages: ChatMessage[];
  petContext?: PetContext;
}

export interface ChatResponse {
  reply: string;
  suggestedQuestions?: string[];
  urgency?: UrgencyLevel;
  provider: string;
  timestamp: string;
}

export interface ILLMProvider {
  readonly name: string;
  isAvailable(): boolean;
  triage(req: TriageRequest): Promise<TriageResult>;
  chat(req: ChatRequest): Promise<ChatResponse>;
}
