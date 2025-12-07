import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Check, X, RotateCcw } from 'lucide-react';

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
      setTimeout(() => setShake(false), 500); // Reset shake
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

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-in fade-in duration-300">
      
      {/* Progress Header */}
      <div className="px-8 pt-12 pb-4 flex justify-between items-center">
        <div className="flex gap-1">
           {questions.map((_, i) => (
             <div key={i} className={`h-1.5 w-8 rounded-full ${i <= currentIdx ? 'bg-[#0066F5]' : 'bg-slate-200'}`}></div>
           ))}
        </div>
        <button onClick={onClose} className="text-slate-400 font-bold text-sm">EXIT</button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 max-w-md mx-auto w-full">
        
        <div className="mb-12 text-center">
           <span className="text-[#0066F5] font-bold tracking-widest text-xs uppercase mb-4 block">Question {currentIdx + 1}</span>
           <h2 className="text-3xl font-bold text-slate-900 leading-tight">
             {currentQ.question}
           </h2>
        </div>

        {!feedback ? (
          <div className="space-y-4 w-full">
            <button 
              onClick={() => handleAnswer(true)}
              className="w-full bg-[#E8F5E9] border-2 border-[#E8F5E9] hover:border-[#388E3C] text-[#388E3C] text-2xl font-bold py-6 rounded-3xl transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-3"
            >
              <Check size={32} strokeWidth={3} />
              Yes / Sí
            </button>
            
            <button 
              onClick={() => handleAnswer(false)}
              className="w-full bg-slate-50 border-2 border-slate-50 hover:border-slate-300 text-slate-600 text-2xl font-bold py-6 rounded-3xl transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-3"
            >
              <X size={32} strokeWidth={3} />
              No
            </button>
          </div>
        ) : (
          <div className={`text-center animate-in fade-in slide-in-from-bottom-4 ${shake ? 'animate-shake' : ''}`}>
             <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${feedback === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {feedback === 'correct' ? <Check size={48} /> : <X size={48} />}
             </div>
             
             <h3 className={`text-2xl font-bold mb-2 ${feedback === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
               {feedback === 'correct' ? 'Correct!' : 'Not quite right'}
             </h3>
             <p className="text-xl text-slate-500 mb-8 leading-relaxed">
               {currentQ.explanation}
             </p>

             <button 
               onClick={nextQuestion}
               className="w-full bg-[#0066F5] text-white text-xl font-bold py-5 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
             >
               {isLast ? 'Finish Check' : 'Next Question'}
             </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuizModal;