import { Bot, User } from 'lucide-react';
import { Message } from '@/lib/types';

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
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
          : 'bg-gradient-to-r from-cyan-400 to-purple-500'
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      
      <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' 
            : 'bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 text-slate-100'
        } ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}>
          {message.image && (
            <div className="mb-3">
              <img 
                src={message.image} 
                alt="User uploaded image"
                className="max-w-full h-auto rounded-lg border border-slate-600/50"
              />
            </div>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        
        <span className="text-xs text-slate-500 mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}