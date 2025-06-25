export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isLoading?: boolean;
    image?: string;
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