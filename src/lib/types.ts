export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isLoading?: boolean;
    image?: string;
    materials?: Material[];
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'book' | 'course' | 'exercise';
  subject: string;
  url: string;
  thumbnail_url: string | null;
  duration: string | null;
  author: string | null;
  created_at: string;
}

export interface ChatState {
    messages: Message[];
    isTyping: boolean;
    input: string;
}

export interface ChatRequest {
    message: string;
    image?: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface MaterialAnalysis {
  isRequest: boolean;
  subject: string | null;
  type: string | null;
}