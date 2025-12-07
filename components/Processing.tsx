import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const Processing: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 relative">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
        <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-full text-white shadow-sm animate-bounce">
          <Sparkles size={16} fill="currentColor" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Document...</h2>
      <p className="text-slate-500 max-w-xs mx-auto mb-8">
        MedSnap is identifying medications, translating instructions, and checking for safety warnings.
      </p>

      <div className="space-y-3 w-full max-w-xs">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 w-2/3 animate-[shimmer_1.5s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)]"></div>
        </div>
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Scanning text</span>
          <span>Translating</span>
          <span>Checking safety</span>
        </div>
      </div>
    </div>
  );
};

export default Processing;