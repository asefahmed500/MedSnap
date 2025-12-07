import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult } from '../types';
import { Volume2, PlayCircle, PauseCircle, AlertTriangle, BookOpen, RotateCcw } from 'lucide-react';
import ImageViewer from './ImageViewer';
import QuizModal from './QuizModal';

interface ResultsViewProps {
  result: AnalysisResult;
  imageSrc: string;
  onRetake: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, imageSrc, onRetake }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(result.summary);
      // Try to find a voice matching the target language slightly better if possible, 
      // but browser support varies wildly. Default is usually okay for major langs.
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Emergency Banner */}
      {result.isEmergency && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4 animate-in slide-in-from-top-4">
          <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-red-800 text-lg">Emergency Warning Detected</h3>
            <p className="text-red-700 font-medium mt-1">{result.emergencyMessage || "Critical instructions found in this document."}</p>
            <button className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">
              Call Emergency Services
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Image & Highlights */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Original Document</h2>
          <ImageViewer imageSrc={imageSrc} highlights={result.highlights} />
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-900">Audio Explanation</h3>
                <button 
                  onClick={toggleSpeech}
                  className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  {isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                  {isPlaying ? "Pause" : "Play Summary"}
                </button>
             </div>
             <p className="text-slate-600 text-sm leading-relaxed">{result.summary}</p>
          </div>
        </div>

        {/* Right Column: Translation */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Translation</h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 font-medium">
                {result.documentType.replace('_', ' ')}
              </span>
           </div>

           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-5 prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-700 prose-li:text-slate-700">
               <h1 className="text-2xl mb-4 text-blue-700">{result.title}</h1>
               <ReactMarkdown>{result.translatedContent}</ReactMarkdown>
             </div>
           </div>

           <button 
             onClick={() => setShowQuiz(true)}
             className="w-full bg-emerald-600 text-white p-4 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 font-bold text-lg"
           >
             <BookOpen size={24} />
             Verify Understanding
           </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-center z-40">
        <button 
          onClick={onRetake}
          className="flex items-center gap-2 text-slate-600 font-medium hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <RotateCcw size={18} />
          Scan Another Document
        </button>
      </div>

      {showQuiz && (
        <QuizModal 
          questions={result.quiz} 
          onClose={() => setShowQuiz(false)} 
        />
      )}
    </div>
  );
};

export default ResultsView;