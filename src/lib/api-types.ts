import { Material } from './types';

export interface TextPart {
  text: string;
}

export interface InlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export type GeminiPart = TextPart | InlineDataPart;

export interface ChatApiResponse {
  message: string;
  timestamp: string;
  materials?: Material[];
}

export interface MaterialsApiResponse {
  materials: Material[];
  count: number;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}

export interface ParsedImageData {
  mimeType: string;
  data: string;
}