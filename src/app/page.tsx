'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/lib/types';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import WelcomeScreen from '@/components/WelcomeScreen';
import ChatMessage from '@/components/ChatMessage';
import TypingIndicator from '@/components/TypingIndicator';
import ChatInput from '@/components/ChatInput';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { sendMessage, isStreaming, error } = useStreamingChat(
    messages,
    setMessages,
    setIsTyping
  );

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string, image?: string) => {
    await sendMessage(content, image);
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
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 m-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <WelcomeScreen 
            onSuggestionClick={handleSuggestionClick}
            onImageSelect={handleImageSelect}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-custom">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="space-y-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator isStreaming={isStreaming} />}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isStreaming}
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