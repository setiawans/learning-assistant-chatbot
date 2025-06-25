export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isLoading?: boolean;
}

export interface ChatState {
    messages: Message[];
    isTyping: boolean;
    input: string;
}