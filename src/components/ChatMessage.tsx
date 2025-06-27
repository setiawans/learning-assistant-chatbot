import { Bot, User } from 'lucide-react';
import { Message } from '@/lib/types';
import MaterialCard from './MaterialCard';
import Image from 'next/image';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`}>
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
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

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

        <span className="text-xs text-slate-500 mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}