export interface MairaContextPreference {
  preferred?: {
    dataset_id?: string;
    project_id?: number | string;
    [key: string]: any;
  };
  excludes?: {
    client_id?: string;
    [key: string]: any;
  };
}

export interface MairaAskRequest {
  user_id: string;
  member_id?: string;
  query: string;
  conversation_type?: 'question' | 'chat';
  gpt_profile_id?: string;
  context_preference?: MairaContextPreference;
  conversation_metadata?: Record<string, any>;
  session_id?: string;
  result_includes?: string[];
  top_k?: number;
  keyword_ngram?: number;
  is_keyword_enabled?: boolean;
  acknowledge_only?: boolean;
  language?: string;
}

export interface MairaReferenceDocument {
  dataset_id: string;
  document_id?: string;
  idx: string;
  score?: number;
  content?: string;
  [key: string]: any;
}

export interface MairaEvaluation {
  score?: number;
  similarity?: number;
  confidence?: string;
}

export interface MairaAskResponse {
  conversation_id?: string;
  answer: string;
  reference_documents?: MairaReferenceDocument[];
  evaluation?: MairaEvaluation;
  session_id?: string;
  status?: string;
}

export interface MairaVisionRequest {
  user_id: string;
  query: string;
  image_url?: string;
  image_base64?: string;
  image_mime_type?: string;
  gpt_profile_id?: string;
  session_id?: string;
  context_preference?: MairaContextPreference;
  language?: string;
}

export interface MairaCreateDocumentItem {
  idx?: string;
  [key: string]: any;
}

export interface MairaCreateDocumentsPayload {
  documents: MairaCreateDocumentItem[];
  is_background_task?: boolean;
}
