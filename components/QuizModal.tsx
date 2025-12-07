import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface QuizModalProps {
  questions: QuizQuestion[];
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ questions, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  const handleAnswer = (userAnswer: boolean) => {
    if (userAnswer === currentQ.answer) {
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-blue-200" />
            <h3 className="font-bold text-lg">Quick Check</h3>
          </div>
          <span className="text-xs bg-blue-700 px-2 py-1 rounded-full">
            {currentIdx + 1} / {questions.length}
          </span>
        </div>

        <div className="p-6">
          <p className="text-xl font-medium text-slate-800 mb-8 text-center">
            {currentQ.question}
          </p>

          {!feedback ? (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleAnswer(true)}
                className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold py-4 rounded-xl transition-colors"
              >
                YES / SÍ
              </button>
              <button 
                onClick={() => handleAnswer(false)}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-4 rounded-xl transition-colors"
              >
                NO
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className={`inline-flex p-3 rounded-full ${feedback === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {feedback === 'correct' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
              </div>
              
              <div>
                <h4 className={`text-lg font-bold mb-1 ${feedback === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                  {feedback === 'correct' ? 'Correct!' : 'Not quite right'}
                </h4>
                <p className="text-slate-600 text-sm">{currentQ.explanation}</p>
              </div>

              <button 
                onClick={nextQuestion}
                className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                {isLast ? 'Finish' : 'Next Question'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;