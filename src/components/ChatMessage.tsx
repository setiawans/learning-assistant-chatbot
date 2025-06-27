'use client';

import { Bot, User, Copy, RotateCcw, Check } from 'lucide-react';
import { useState } from 'react';
import { Message } from '@/lib/types';
import MaterialCard from './MaterialCard';
import Image from 'next/image';
import MathRenderer from './MathRenderer';

interface ChatMessageProps {
  message: Message;
  messages: Message[];
  onRetry?: (userContent: string, userImage?: string) => void;
}

export default function ChatMessage({ message, messages, onRetry }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const findPrecedingUserMessage = () => {
    const currentIndex = messages.findIndex(msg => msg.id === message.id);
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i];
      }
    }
    return null;
  };

  const handleRetry = () => {
    if (onRetry) {
      const userMessage = findPrecedingUserMessage();
      if (userMessage) {
        onRetry(userMessage.content, userMessage.image);
      }
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6 group`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
        : 'bg-gradient-to-r from-cyan-400 to-purple-500'
        }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl ${isUser
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
          : 'bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 text-slate-100'
          } ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}>
          {message.image && (
            <div className="mb-3 relative">
              <Image
                src={message.image}
                alt="User uploaded image"
                width={300}
                height={200}
                className="max-w-full h-auto rounded-lg border border-slate-600/50"
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
          
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MathRenderer 
              content={message.content} 
              className="text-sm leading-relaxed"
            />
          )}
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-700/50 rounded-md transition-colors"
              aria-label="Copy message"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {onRetry && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-700/50 rounded-md transition-colors"
                aria-label="Retry message"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}

        {!isUser && message.materials && message.materials.length > 0 && (
          <div className="mt-3 w-full max-w-[calc(100vw-6rem)]">
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto scrollbar-custom pb-2 snap-x snap-mandatory">
                {message.materials.map((material) => (
                  <div key={material.id} className="flex-shrink-0 w-80 snap-start">
                    <MaterialCard material={material} />
                  </div>
                ))}
              </div>

              {message.materials.length > 1 && (
                <>
                  <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}