import { useState, useCallback } from 'react';
import { Message, Material } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/lib/constants';

interface StreamingResponse {
  type: 'content' | 'done' | 'error';
  content?: string;
  fullContent?: string;
  timestamp?: string;
  materials?: Material[];
  error?: string;
}

interface UseStreamingChatReturn {
  sendMessage: (content: string, image?: string) => Promise<void>;
  retryMessage: (userContent: string, userImage?: string) => Promise<void>;
  isStreaming: boolean;
  error: string | null;
  clearError: () => void;
}

export function useStreamingChat(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
): UseStreamingChatReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<{ content: string; image?: string } | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const performRequest = useCallback(async (content: string, image?: string) => {
    setError(null);
    setIsStreaming(false);
    setIsTyping(true);

    let assistantMessageId: string | null = null;

    try {
      const response = await fetch(API_ENDPOINTS.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          image
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || ERROR_MESSAGES.SERVER_ERROR);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamingResponse = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                if (!assistantMessageId) {
                  assistantMessageId = generateId();
                  setIsStreaming(true);
                  
                  const assistantMessage: Message = {
                    id: assistantMessageId,
                    role: 'assistant',
                    content: data.fullContent || data.content || '',
                    timestamp: new Date()
                  };
                  
                  setMessages(prev => [...prev, assistantMessage]);
                } else {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: data.fullContent || data.content || '' }
                      : msg
                  ));
                }
              } else if (data.type === 'done') {
                if (assistantMessageId) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ?                         { 
                          ...msg, 
                          content: data.content || '',
                          timestamp: new Date(data.timestamp || new Date().toISOString()),
                          materials: data.materials
                        }
                      : msg
                  ));
                }
                setIsTyping(false);
                setIsStreaming(false);
              } else if (data.type === 'error') {
                throw new Error(data.error || ERROR_MESSAGES.SERVER_ERROR);
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.NETWORK_ERROR;
      setError(errorMessage);
      
      if (assistantMessageId) {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: errorMessage }
            : msg
        ));
      } else {
        const errorMessageObj: Message = {
          id: generateId(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessageObj]);
      }
      
      setIsTyping(false);
      setIsStreaming(false);
    }
  }, [setMessages, setIsTyping]);

  const sendMessage = useCallback(async (content: string, image?: string) => {
    if (!content.trim() && !image) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      image,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLastUserMessage({ content, image });
    
    await performRequest(content, image);
  }, [setMessages, performRequest]);

  const retryMessage = useCallback(async (userContent: string, userImage?: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: userContent,
      image: userImage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    await performRequest(userContent, userImage);
  }, [performRequest, setMessages]);

  return {
    sendMessage,
    retryMessage,
    isStreaming,
    error,
    clearError
  };
}