
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult } from '../types';
import { Play, Pause, AlertTriangle, CheckCircle, Save, X, FastForward, Rewind, MoreHorizontal } from 'lucide-react';
import ImageViewer from './ImageViewer';
import QuizModal from './QuizModal';
import { generatePDF } from '../services/pdfService';
import { generateAudioFromScript } from '../services/geminiService';

interface ResultsViewProps {
  result: AnalysisResult;
  imageSrc: string;
  onRetake: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, imageSrc, onRetake }) => {
  const [showAudioSheet, setShowAudioSheet] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Colors based on requirement: #0066F5 (Blue), #D32F2F (Red), etc.
  
  const toggleAudio = async () => {
    if (!showAudioSheet) setShowAudioSheet(true);
    
    if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
    }
    
    // Simulate playing for UI or fetch real audio
    setIsPlaying(true);
    
    if (!audioRef.current) {
        try {
            // Attempt to fetch audio if we don't have it
            // Note: generateAudioFromScript in geminiService might return null if failed
            const audioData = await generateAudioFromScript(result.summary);
            if (audioData) {
                 // The service returns base64 bytes for audio, we need to prefix it for source
                 // check if service adds prefix or not. service adds prefix? 
                 // Let's check service. Service code: return base64Audio.
                 // So we need to add 'data:audio/wav;base64,' if not present.
                 // Actually the service currently returns just raw base64 data from inlineData.
                 const src = `data:audio/mp3;base64,${audioData}`;
                 const audio = new Audio(src);
                 audio.onended = () => setIsPlaying(false);
                 audioRef.current = audio;
                 audio.play();
            } else {
                 // Fallback to synthesis
                 const u = new SpeechSynthesisUtterance(result.summary);
                 u.onend = () => setIsPlaying(false);
                 window.speechSynthesis.speak(u);
            }
        } catch (e) {
            console.error("Audio error", e);
             const u = new SpeechSynthesisUtterance(result.summary);
             u.onend = () => setIsPlaying(false);
             window.speechSynthesis.speak(u);
        }
    } else {
        audioRef.current.play();
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
           <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center gap-4 z-20">
              
              <button 
                onClick={toggleAudio}
                className="flex-1 bg-[#0066F5] text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
              >
                <Play fill="currentColor" size={20} />
                Listen
              </button>

              <button 
                 onClick={() => setShowQuiz(true)}
                 className="h-14 w-14 bg-green-50 text-[#388E3C] rounded-2xl border border-green-100 flex items-center justify-center hover:bg-green-100 transition-colors"
                 title="Verify Understanding"
              >
                 <CheckCircle size={28} />
              </button>

              <button 
                 onClick={() => generatePDF(result, imageSrc)}
                 className="h-14 w-14 bg-slate-50 text-slate-600 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors"
                 title="Save as PDF"
              >
                 <Save size={24} />
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
