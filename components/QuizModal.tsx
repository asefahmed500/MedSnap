
import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Check, X, RotateCcw, ThumbsUp, HelpCircle, ArrowRight } from 'lucide-react';

interface QuizModalProps {
  questions: QuizQuestion[];
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ questions, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [shake, setShake] = useState(false);

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  const handleAnswer = (userAnswer: boolean) => {
    if (userAnswer === currentQ.answer) {
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
      setShake(true);
      setTimeout(() => setShake(false), 500); // Reset shake animation
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    if (isLast) {
      onClose();
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  // Safe fallback if no questions exist
  if (!questions || questions.length === 0) {
      return null;
  }

  return (
    <div className="fixed inset-0 bg-navy-900/95 backdrop-blur-md z-[70] flex flex-col animate-in fade-in duration-300 overflow-hidden">
      
      {/* Header / Exit */}
      <div className="px-6 pt-12 pb-4 flex justify-between items-center shrink-0">
        <div className="flex gap-2">
           {questions.map((_, i) => (
             <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < currentIdx ? 'w-4 bg-green-500' : 
                    i === currentIdx ? 'w-8 bg-gold-400' : 'w-4 bg-white/10'
                }`}
             ></div>
           ))}
        </div>
        <button onClick={onClose} className="text-cream-200/50 hover:text-white font-bold text-xs uppercase tracking-widest px-4 py-2">
            Exit
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full relative">
        
        {/* Question Card */}
        <div className={`transition-all duration-500 absolute inset-0 flex flex-col justify-center px-6 ${feedback ? 'opacity-0 translate-x-[-20px] pointer-events-none' : 'opacity-100 translate-x-0 relative'}`}>
            <div className="mb-10 text-center">
               <span className="text-gold-400 font-bold tracking-widest text-xs uppercase mb-4 block">
                   Verify Understanding
               </span>
               <h2 className="text-2xl md:text-3xl font-serif font-bold text-cream-50 leading-tight">
                 {currentQ.question}
               </h2>
            </div>

            <div className="space-y-4 w-full">
                <button 
                  onClick={() => handleAnswer(true)}
                  className="w-full bg-navy-800 border border-white/10 hover:bg-green-500/20 hover:border-green-500/50 text-cream-50 text-xl font-bold py-6 rounded-2xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-green-500 group-hover:border-green-500 group-hover:text-white transition-all">
                      <Check size={18} strokeWidth={3} />
                  </div>
                  Yes / Sí
                </button>
                
                <button 
                  onClick={() => handleAnswer(false)}
                  className="w-full bg-navy-800 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 text-cream-50 text-xl font-bold py-6 rounded-2xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-red-500 group-hover:border-red-500 group-hover:text-white transition-all">
                      <X size={18} strokeWidth={3} />
                  </div>
                  No
                </button>
            </div>
        </div>

        {/* Feedback Card */}
        {feedback && (
          <div className={`absolute inset-0 flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-right duration-300 px-6 ${shake ? 'animate-shake' : ''}`}>
             
             {/* Icon */}
             <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ring-4 ring-navy-900 ${
                 feedback === 'correct' 
                    ? 'bg-green-500 text-navy-900 shadow-green-500/20' 
                    : 'bg-amber-400 text-navy-900 shadow-amber-500/20'
             }`}>
                {feedback === 'correct' ? <ThumbsUp size={48} /> : <HelpCircle size={48} />}
             </div>
             
             {/* Title */}
             <h3 className={`text-3xl font-serif font-bold mb-3 ${feedback === 'correct' ? 'text-green-400' : 'text-amber-400'}`}>
               {feedback === 'correct' ? 'That\'s Right!' : 'Let\'s double check'}
             </h3>
             
             {/* Explanation */}
             <div className={`p-6 rounded-2xl border mb-8 text-left w-full ${
                 feedback === 'correct' 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-amber-500/10 border-amber-500/20'
             }`}>
                <p className="text-lg text-cream-50 font-light leading-relaxed">
                  {currentQ.explanation}
                </p>
             </div>

             {/* Next Button */}
             <button 
               onClick={nextQuestion}
               className={`w-full text-navy-900 text-lg font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                   feedback === 'correct' 
                    ? 'bg-green-500 hover:bg-green-400 shadow-green-500/20' 
                    : 'bg-amber-400 hover:bg-amber-300 shadow-amber-500/20'
               }`}
             >
               {isLast ? 'Finish Check' : 'Next Question'}
               <ArrowRight size={20} />
             </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuizModal;
