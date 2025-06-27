interface TypingIndicatorProps {
  isStreaming?: boolean;
}

export default function TypingIndicator({ isStreaming = false }: TypingIndicatorProps) {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <span className="text-sm text-slate-400">
          Copilot sedang berpikir...
        </span>
      </div>
    </div>
  );
}