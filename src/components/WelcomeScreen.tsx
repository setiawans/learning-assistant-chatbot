import { Bot, Upload } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
  onImageSelect: () => void;
}

const suggestions = [
  "Gimana caranya nyari solusi dari persamaan x² + 5x + 6 = 0?",
  "Mengapa percepatan dianggap vektor?", 
  "Bikinin rangkuman buku purcell bab turunan!"
];

export default function WelcomeScreen({ onSuggestionClick, onImageSelect }: WelcomeScreenProps) {
  return (
    <div className="text-center space-y-8">
      <div className="inline-flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900"></div>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Copilot AI
          </h1>
          <p className="text-slate-400 text-sm">Learning Assistant</p>
        </div>
      </div>

      <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
        Lagi butuh bantuan apa sobat?
      </h2>
      
      <div className="flex justify-center mb-8">
        <button 
          onClick={onImageSelect}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Foto Soal
        </button>
      </div>

      <div className="mb-8">
        <p className="text-slate-400 mb-4">Psst... kamu bisa nanya kayak gini:</p>
        <div className="space-y-3 max-w-2xl mx-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full p-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl text-left hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 group"
            >
              <span className="text-slate-300 group-hover:text-white transition-colors">
                {suggestion}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}