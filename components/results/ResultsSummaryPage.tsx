import React from 'react';
import { AnalysisResult } from '../../types';
import { Headphones } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import ActionButtons from './ActionButtons';

interface ResultsSummaryPageProps {
  result: AnalysisResult;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  currentTime: number;
  duration: number;
  onToggleAudio: () => void;
  onSeek: (time: number) => void;
  onQuiz: () => void;
  onPDF: () => void;
  onShare: () => void;
}

const ResultsSummaryPage: React.FC<ResultsSummaryPageProps> = ({
  result, isPlaying, isLoadingAudio, currentTime, duration, onToggleAudio, onSeek, onQuiz, onPDF, onShare
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-navy-900 relative animate-in fade-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 text-center shrink-0 border-b border-white/5 bg-navy-900 z-10">
        <div className="w-12 h-12 bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/5 text-gold-400 shadow-lg">
            <Headphones size={24} />
        </div>
        <h2 className="text-2xl font-serif text-cream-50 font-bold mb-1">Audio Summary</h2>
        <p className="text-sm text-cream-200/60">Listen to the key takeaways.</p>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 flex flex-col items-center custom-scrollbar">
         <AudioPlayer 
            summary={result.summary}
            isPlaying={isPlaying}
            isLoading={isLoadingAudio}
            currentTime={currentTime}
            duration={duration}
            onToggle={onToggleAudio}
            onSeek={onSeek}
         />
         
         <ActionButtons 
            onQuiz={onQuiz}
            onPDF={onPDF}
            onShare={onShare}
         />
      </div>
    </div>
  );
};

export default ResultsSummaryPage;