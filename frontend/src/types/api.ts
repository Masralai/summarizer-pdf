export type Algorithm = "frequency" | "tfidf" | "textrank" | "llm";

export interface SummaryStats {
  original_length: number;
  summary_length: number;
  original_word_count: number;
  summary_word_count: number;
  original_sentences: number;
  summary_sentences: number;
  compression_ratio: number;
}

export interface SummaryRequest {
  algorithm: Algorithm;
  num_sentences: number;
}

export interface SummaryResponse {
  success: boolean;
  filename: string;
  summary: string;
  algorithm_used: string;
  statistics: SummaryStats;
  parameters: {
    algorithm: string;
    num_sentences: number;
  };
}

export interface AlgorithmInfo {
  name: string;
  description: string;
  best_for: string;
}

export interface AlgorithmsResponse {
  algorithms: Record<Algorithm, AlgorithmInfo>;
  defaults: {
    algorithm: Algorithm;
    sentence_range: { min: number; max: number; default: number };
  };
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

export interface ErrorResponse {
  error: string;
}

export const SUPPORTED_ALGORITHMS: Algorithm[] = ["frequency", "tfidf", "textrank", "llm"];
export const SENTENCE_RANGE = { min: 2, max: 10 } as const;
export const MAX_UPLOAD_SIZE_MB = 10;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;