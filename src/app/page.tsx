'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { API_ENDPOINTS, CHAT_CONFIG, ERROR_MESSAGES } from '@/lib/constants';
import WelcomeScreen from '@/components/WelcomeScreen';
import ChatMessage from '@/components/ChatMessage';
import TypingIndicator from '@/components/TypingIndicator';
import ChatInput from '@/components/ChatInput';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, CHAT_CONFIG.AUTO_SCROLL_DELAY);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string, image?: string) => {
    if (content.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      image,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || ERROR_MESSAGES.SERVER_ERROR);
      }

      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(data.timestamp),
        materials: data.materials || undefined
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, CHAT_CONFIG.TYPING_DELAY);
    } catch {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: ERROR_MESSAGES.NETWORK_ERROR,
        timestamp: new Date()
      };
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, CHAT_CONFIG.TYPING_DELAY);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      handleSendMessage('', imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <WelcomeScreen 
            onSuggestionClick={handleSuggestionClick}
            onImageSelect={handleImageSelect}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-custom">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6 pb-8">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isTyping}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}