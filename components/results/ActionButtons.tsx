import React from 'react';
import { CheckCircle, FileDown, Share2 } from 'lucide-react';

interface ActionButtonsProps {
  onQuiz: () => void;
  onPDF: () => void;
  onShare: () => void;
}

/**
 * ActionButtons Component
 * Responsibility: Renders the grid of primary and secondary action buttons.
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({ onQuiz, onPDF, onShare }) => {
  return (
    <div className="grid grid-cols-1 w-full gap-4 max-w-md">
        {/* Primary Action: Verification */}
        <button onClick={onQuiz} className="w-full flex items-center justify-between p-5 bg-navy-800 rounded-2xl border border-white/5 hover:bg-navy-700 hover:border-gold-400/30 transition-all group shadow-lg">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                    <CheckCircle size={24} />
                </div>
                <div className="text-left">
                    <p className="font-bold text-cream-50 text-lg">Verify Understanding</p>
                    <p className="text-sm text-cream-200/50 group-hover:text-cream-200/80 transition-colors">Take a quick safety quiz</p>
                </div>
            </div>
        </button>

        {/* Secondary Actions: PDF & Share */}
        <div className="grid grid-cols-2 gap-4">
            <button onClick={onPDF} className="flex flex-col items-center justify-center p-6 bg-navy-800 rounded-2xl border border-white/5 hover:bg-navy-700 hover:border-cream-200/30 transition-all group shadow-lg">
                <FileDown size={28} className="mb-3 text-cream-200 group-hover:text-gold-400 transition-colors" strokeWidth={1.5} />
                <span className="font-bold text-sm text-cream-50">Save PDF</span>
            </button>
            
            <button onClick={onShare} className="flex flex-col items-center justify-center p-6 bg-navy-800 rounded-2xl border border-white/5 hover:bg-navy-700 hover:border-cream-200/30 transition-all group shadow-lg">
                <Share2 size={28} className="mb-3 text-cream-200 group-hover:text-gold-400 transition-colors" strokeWidth={1.5} />
                <span className="font-bold text-sm text-cream-50">Share</span>
            </button>
        </div>
    </div>
  );
};

export default ActionButtons;