import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { AlertTriangle, ChevronRight, ChevronLeft, Home } from 'lucide-react';
import ResultsImagePage from './results/ResultsImagePage';
import ResultsTranslationPage from './results/ResultsTranslationPage';
import ResultsSummaryPage from './results/ResultsSummaryPage';
import QuizModal from './QuizModal';
import { generatePDF, generatePDFBlob } from '../services/pdfService';
import { generateAudioFromScript } from '../services/geminiService';

interface ResultsViewProps {
  result: AnalysisResult;
  imageSrc: string;
  onRetake: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, imageSrc, onRetake }) => {
  // Wizard Step State: 0=Image, 1=Text, 2=Action
  const [page, setPage] = useState(0); 
  
  // Audio State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  // --- AUDIO LIFECYCLE MANAGEMENT ---
  useEffect(() => {
    // Cleanup audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const setupAudioListeners = (audio: HTMLAudioElement) => {
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
            setDuration(audio.duration);
        }
    };
    audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
  };

  // Fallback to browser's built-in speech synthesis
  const fallbackToSynthesis = () => {
    console.log("Falling back to Browser TTS");
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }
    const u = new SpeechSynthesisUtterance(result.summary);
    u.onend = () => setIsPlaying(false);
    u.onstart = () => setIsPlaying(true);
    window.speechSynthesis.speak(u);
    setIsLoadingAudio(false);
  };

  const toggleAudio = async () => {
    // 1. Pause Logic
    if (isPlaying) {
      if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // 2. Resume Logic (if audio already loaded)
    if (audioRef.current) {
      audioRef.current.play()
        .catch(() => fallbackToSynthesis());
      return;
    }

    // 3. New Audio Generation Logic
    setIsLoadingAudio(true);
    try {
      const audioData = await generateAudioFromScript(result.summary);
      if (audioData) {
        // Assume format compatible with browser (wav/mp3)
        const src = `data:audio/mp3;base64,${audioData}`;
        const audio = new Audio(src);
        setupAudioListeners(audio);
        
        audio.oncanplaythrough = () => {
          audio.play();
          setIsLoadingAudio(false);
          audioRef.current = audio;
        };
        
        audio.onerror = (e) => {
            console.warn("HTML5 Audio Error, trying fallback", e);
            fallbackToSynthesis();
        };
        audio.load();
      } else {
        fallbackToSynthesis();
      }
    } catch (e) {
      console.error("Audio Fetch Error", e);
      fallbackToSynthesis();
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }
  };

  // --- SHARE FUNCTIONALITY ---
  const handleShare = async () => {
    // Generate safe filename
    const safeTitle = (result.title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `MedSnap_${safeTitle}.pdf`;

    if (navigator.share && navigator.canShare) {
        try {
            const pdfBlob = generatePDFBlob(result, imageSrc);
            const file = new File([pdfBlob], fileName, { type: "application/pdf" });
            const data = { 
                title: result.title, 
                text: `${result.title}\n\n${result.summary}`, 
                files: [file] 
            };
            
            if (navigator.canShare(data)) {
                await navigator.share(data);
                return;
            }
        } catch (e) {
            console.warn("Native file share failed", e);
        }
    }

    // Fallback to text sharing
    if (navigator.share) {
        await navigator.share({ 
            title: result.title, 
            text: `${result.title}\n\n${result.summary}`, 
            url: window.location.href 
        });
    } else {
        // Last resort: Download PDF
        if (confirm("Sharing not supported. Download PDF instead?")) {
            generatePDF(result, imageSrc);
        }
    }
  };

  // --- RENDER ---
  return (
    <div className="h-full flex flex-col bg-navy-900 text-cream-50 relative font-sans overflow-hidden">
      
      {/* 1. Global Emergency Banner */}
      {result.isEmergency && (
        <div className="shrink-0 bg-red-600 text-white p-4 z-[60] flex items-center justify-between shadow-2xl animate-fade-in-up">
           <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-full animate-pulse">
               <AlertTriangle size={24} fill="white" />
             </div>
             <div>
               <p className="font-bold text-lg leading-tight">Emergency Detected</p>
               <p className="text-white/80 text-xs">Based on document analysis</p>
             </div>
           </div>
           <a href="tel:911" className="bg-white text-red-600 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors shadow-sm">
             Call 911
           </a>
        </div>
      )}

      {/* 2. Wizard Stepper Navigation */}
      <div className="bg-navy-950 pt-6 pb-4 px-6 shrink-0 border-b border-white/5 z-20 relative">
         <div className="flex items-center justify-between max-w-md mx-auto">
            {[0, 1, 2].map((step) => {
                const isActive = step === page;
                const isCompleted = step < page;
                return (
                    <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                            ${isActive ? 'bg-gold-400 text-navy-900 scale-110 shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 
                              isCompleted ? 'bg-navy-700 text-gold-400 border border-gold-400/50' : 'bg-navy-800 text-cream-200/30 border border-white/5'}
                        `}>
                            {step + 1}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-gold-400' : 'text-cream-200/20'}`}>
                            {step === 0 ? 'Scan' : step === 1 ? 'Read' : 'Act'}
                        </span>
                    </div>
                );
            })}
            {/* Connecting Line */}
            <div className="absolute top-[40px] left-10 right-10 h-0.5 bg-navy-800 -z-0">
               <div className="h-full bg-gold-400/50 transition-all duration-500" style={{ width: `${page * 50}%` }}></div>
            </div>
         </div>
      </div>

      {/* 3. Page Content Area */}
      <div className="flex-1 overflow-hidden relative w-full">
         <div className="absolute inset-0 w-full h-full">
            {page === 0 && <ResultsImagePage imageSrc={imageSrc} result={result} />}
            {page === 1 && <ResultsTranslationPage result={result} />}
            {page === 2 && (
              <ResultsSummaryPage 
                result={result} 
                isPlaying={isPlaying} 
                isLoadingAudio={isLoadingAudio} 
                currentTime={currentTime}
                duration={duration}
                onToggleAudio={toggleAudio}
                onSeek={handleSeek}
                onQuiz={() => setShowQuiz(true)}
                onPDF={() => generatePDF(result, imageSrc)}
                onShare={handleShare}
              />
            )}
         </div>
      </div>

      {/* 4. Bottom Navigation Footer */}
      <div className="p-5 bg-navy-950 border-t border-white/5 flex items-center justify-between shrink-0 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
         <button 
           onClick={page === 0 ? onRetake : () => setPage(p => p - 1)}
           className="flex items-center gap-2 px-5 py-3 rounded-xl hover:bg-white/5 text-cream-200/60 font-medium transition-colors"
         >
           {page === 0 ? <Home size={20} /> : <ChevronLeft size={20} />}
           {page === 0 ? "Home" : "Back"}
         </button>

         <button 
            onClick={() => {
              if (page < 2) setPage(p => p + 1);
            }}
            disabled={page === 2}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-navy-900 transition-all shadow-lg 
                ${page === 2 
                    ? 'bg-navy-800 text-cream-200/10 cursor-default opacity-0 pointer-events-none' 
                    : 'bg-gold-400 hover:bg-gold-500 hover:scale-105 active:scale-95 shadow-gold-500/20'}`}
         >
            Next Step <ChevronRight size={20} />
         </button>
      </div>

      {showQuiz && <QuizModal questions={result.quiz} onClose={() => setShowQuiz(false)} />}
    </div>
  );
};

export default ResultsView;