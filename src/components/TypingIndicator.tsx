import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-6">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      
      <div className="flex flex-col items-start">
        <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-slate-800/70 backdrop-blur-sm border border-slate-700/50">
          <div className="flex gap-1 items-center">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
            <span className="text-xs text-slate-400 ml-2">Copilot sedang berpikir...</span>
          </div>
        </div>
      </div>
    </div>
  );
}