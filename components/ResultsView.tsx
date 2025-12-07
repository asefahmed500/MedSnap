
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult } from '../types';
import { Play, Pause, AlertTriangle, CheckCircle, FileDown, X, FastForward, Rewind, Share2, Loader2 } from 'lucide-react';
import ImageViewer from './ImageViewer';
import QuizModal from './QuizModal';
import { generatePDF, generatePDFBlob } from '../services/pdfService';
import { generateAudioFromScript } from '../services/geminiService';

interface ResultsViewProps {
  result: AnalysisResult;
  imageSrc: string;
  onRetake: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, imageSrc, onRetake }) => {
  const [showAudioSheet, setShowAudioSheet] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        window.speechSynthesis.cancel();
    };
  }, []);
  
  const fallbackToSynthesis = () => {
      console.log("Falling back to SpeechSynthesis");
      const u = new SpeechSynthesisUtterance(result.summary);
      u.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(u);
      setIsPlaying(true);
      setIsLoadingAudio(false);
  };

  const toggleAudio = async () => {
    if (!showAudioSheet) setShowAudioSheet(true);
    
    // Pause if playing
    if (isPlaying) {
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
        }
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
        return;
    }
    
    // Resume existing HTML Audio
    if (audioRef.current) {
        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(() => fallbackToSynthesis()); // Fallback if playback fails
        return;
    }

    // New Playback Request
    setIsLoadingAudio(true);
    try {
        const audioData = await generateAudioFromScript(result.summary);
        
        if (audioData) {
             // Try to play with HTML5 Audio
             const src = `data:audio/wav;base64,${audioData}`;
             const audio = new Audio(src);
             
             audio.oncanplaythrough = () => {
                 audio.play();
                 setIsPlaying(true);
                 setIsLoadingAudio(false);
                 audioRef.current = audio;
             };
             
             audio.onended = () => setIsPlaying(false);
             
             audio.onerror = (e) => {
                 console.warn("HTML5 Audio playback failed (format likely unsupported), using fallback.", e);
                 fallbackToSynthesis();
             };

             // Load the src to trigger events
             audio.load();
        } else {
             fallbackToSynthesis();
        }
    } catch (e) {
        console.error("Audio generation error", e);
        fallbackToSynthesis();
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert("Sharing is not supported on this device/browser.");
      return;
    }

    try {
      // Strategy 1: Try sharing PDF (The "Translated Document")
      const pdfBlob = generatePDFBlob(result, imageSrc);
      const pdfFile = new File([pdfBlob], `MedSnap_${result.title.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });

      const pdfShareData = {
        title: `MedSnap: ${result.title}`,
        text: `Translation for: ${result.title}\n\n${result.summary}\n\n-- Translated via MedSnap`,
        files: [pdfFile],
      };

      if (navigator.canShare && navigator.canShare(pdfShareData)) {
        await navigator.share(pdfShareData);
        return;
      }
      
      // Strategy 2: Fallback to Image + Text
      console.log("PDF sharing not supported, trying image...");
      const imgRes = await fetch(imageSrc);
      const imgBlob = await imgRes.blob();
      const imgFile = new File([imgBlob], "original_doc.jpg", { type: imgBlob.type });
      
      const imgShareData = {
          title: `MedSnap: ${result.title}`,
          text: `Translation for: ${result.title}\n\n${result.summary}\n\n-- Translated via MedSnap`,
          files: [imgFile]
      };
      
      if (navigator.canShare && navigator.canShare(imgShareData)) {
          await navigator.share(imgShareData);
          return;
      }

      // Strategy 3: Text Only Fallback
      console.log("File sharing not supported, sharing text only...");
      await navigator.share({
         title: `MedSnap: ${result.title}`,
         text: `Translation for: ${result.title}\n\n${result.summary}\n\n-- Translated via MedSnap`,
         url: window.location.href 
      });

    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      
      {/* Emergency Floating Banner */}
      {result.isEmergency && (
        <div className="absolute top-6 left-4 right-4 bg-[#D32F2F] text-white p-4 rounded-2xl shadow-xl shadow-red-200 z-50 flex items-center justify-between animate-in slide-in-from-top duration-500">
           <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-full">
               <AlertTriangle fill="currentColor" size={20} />
             </div>
             <div>
               <p className="font-bold text-lg leading-tight">Emergency Detected</p>
               <p className="text-white/90 text-sm">Seek care immediately</p>
             </div>
           </div>
           <button className="bg-white text-[#D32F2F] px-4 py-2 rounded-xl font-bold text-sm">
             Call 911
           </button>
        </div>
      )}

      {/* Split View Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Half: Original Image (45%) */}
        <div className="h-[45%] bg-slate-900 relative">
           <ImageViewer imageSrc={imageSrc} highlights={result.highlights} showHighlights={true} />
           
           {/* Overlay Legend Badge */}
           <div className="absolute bottom-4 left-4 right-4 flex justify-center">
             <div className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D32F2F]"></span>Warning</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F57C00]"></span>Meds</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FBC02D]"></span>Date</span>
             </div>
           </div>
        </div>

        {/* Bottom Half: Translation (55%) */}
        <div className="h-[55%] bg-white rounded-t-3xl -mt-6 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex flex-col relative overflow-hidden">
           
           {/* Drag Handle */}
           <div className="w-full flex justify-center pt-3 pb-1">
             <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
           </div>

           {/* Content */}
           <div className="flex-1 overflow-y-auto px-6 pb-32 pt-2 custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                 <span className="px-3 py-1 bg-blue-50 text-[#0066F5] text-xs font-bold uppercase tracking-wider rounded-lg">
                    {(result.documentType || 'DOCUMENT').replace('_', ' ')}
                 </span>
                 <span className="text-slate-400 text-sm">Today, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">{result.title}</h1>
              
              <div className="prose prose-lg prose-slate max-w-none prose-p:text-slate-600 prose-headings:text-slate-900 prose-li:text-slate-600">
                <ReactMarkdown>{result.translatedContent}</ReactMarkdown>
              </div>
           </div>

           {/* Bottom Fixed Action Bar (Frosted) */}
           <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center gap-3 z-20">
              
              <button 
                onClick={toggleAudio}
                disabled={isLoadingAudio}
                className="flex-[2] bg-[#0066F5] text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-70"
              >
                {isLoadingAudio ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" size={20} />}
                {isLoadingAudio ? "Loading..." : "Listen"}
              </button>

              <button 
                 onClick={() => setShowQuiz(true)}
                 className="h-14 w-14 bg-green-50 text-[#388E3C] rounded-2xl border border-green-100 flex items-center justify-center hover:bg-green-100 transition-colors shrink-0"
                 title="Verify Understanding"
              >
                 <CheckCircle size={28} />
              </button>

              <button 
                 onClick={handleShare}
                 className="h-14 w-14 bg-slate-50 text-slate-600 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0"
                 title="Share PDF or Image"
              >
                 <Share2 size={24} />
              </button>

              <button 
                 onClick={() => generatePDF(result, imageSrc)}
                 className="h-14 w-14 bg-slate-50 text-slate-600 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0"
                 title="Download PDF"
              >
                 <FileDown size={24} />
              </button>
           </div>
        </div>
      </div>

      {/* Screen 7: Audio Playing Overlay (Bottom Sheet) */}
      {showAudioSheet && (
        <>
          <div className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setShowAudioSheet(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 h-[85%] bg-white rounded-t-[2.5rem] z-50 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-500">
             
             {/* Header */}
             <div className="p-6 flex items-center justify-between border-b border-slate-50">
               <div className="flex flex-col">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Playing Summary</span>
                 <span className="text-lg font-bold text-slate-900 truncate max-w-[200px]">{result.title}</span>
               </div>
               <button onClick={() => setShowAudioSheet(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                 <X size={20} />
               </button>
             </div>

             {/* Karaoke Text Area (Simulation) */}
             <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 text-center">
                <p className="text-xl leading-relaxed text-slate-300 transition-colors duration-500">
                   {result.summary}
                </p>
             </div>

             {/* Controls Area */}
             <div className="p-8 pb-12 bg-slate-50 rounded-t-[2.5rem]">
                {/* Waveform Viz */}
                <div className="flex items-center justify-center gap-1 h-12 mb-8">
                   {[...Array(20)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-[#0066F5] rounded-full animate-wave-bar"
                        style={{ 
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.05}s`,
                          opacity: isPlaying ? 1 : 0.3
                        }}
                      ></div>
                   ))}
                </div>

                <div className="flex items-center justify-between px-4">
                   <button className="text-slate-400 hover:text-slate-600"><Rewind size={28} /></button>
                   
                   <button 
                     onClick={() => setIsPlaying(!isPlaying)}
                     className="w-20 h-20 bg-[#0066F5] text-white rounded-full shadow-xl shadow-blue-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                   >
                     {isPlaying ? <Pause fill="currentColor" size={32} /> : <Play fill="currentColor" size={32} className="ml-1" />}
                   </button>
                   
                   <button className="text-slate-400 hover:text-slate-600"><FastForward size={28} /></button>
                </div>

                <div className="flex justify-center mt-8 gap-8">
                   <button className="text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm">1.0x Speed</button>
                </div>
             </div>
          </div>
        </>
      )}

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
