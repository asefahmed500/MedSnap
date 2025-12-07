import React, { useState } from 'react';
import { HighlightRegion } from '../types';
import { Info, HelpCircle, Volume2, Loader2 } from 'lucide-react';
import { generateAudioFromScript } from '../services/geminiService';

interface ImageViewerProps {
  imageSrc: string;
  highlights: HighlightRegion[];
  showHighlights?: boolean;
  imageClassName?: string; // New prop to control image styling overrides
}

const ImageViewer: React.FC<ImageViewerProps> = ({ 
  imageSrc, 
  highlights, 
  showHighlights = true,
  imageClassName 
}) => {
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handlePlayAudio = async (text: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the info popup when clicking speaker
    
    if (playingIndex === index) return; // Already playing/loading
    
    setPlayingIndex(index);
    
    try {
      const audioData = await generateAudioFromScript(text);
      if (audioData) {
        const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
        audio.onended = () => setPlayingIndex(null);
        audio.onpause = () => setPlayingIndex(null);
        await audio.play();
      } else {
        // Fallback to browser TTS if Gemini fails
        const u = new SpeechSynthesisUtterance(text);
        u.onend = () => setPlayingIndex(null);
        window.speechSynthesis.speak(u);
      }
    } catch (error) {
      console.error("Failed to play highlight audio", error);
      setPlayingIndex(null);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden shadow-md bg-slate-900 group w-full">
      <img 
        src={imageSrc} 
        alt="Original Document" 
        className={imageClassName || "w-full h-auto object-contain max-h-[500px]"}
      />
      
      {/* Overlays */}
      {showHighlights && highlights.map((h, index) => {
        // box_2d is [ymin, xmin, ymax, xmax] in 0-1000 scale
        const top = h.box_2d[0] / 10;
        const left = h.box_2d[1] / 10;
        const height = (h.box_2d[2] - h.box_2d[0]) / 10;
        const width = (h.box_2d[3] - h.box_2d[1]) / 10;

        let borderColor = 'border-blue-400';
        let bgColor = 'bg-blue-400/20';
        let labelColor = 'bg-blue-600';
        let iconColor = 'text-blue-500';

        switch (h.type) {
            case 'critical':
                borderColor = 'border-red-500';
                bgColor = 'bg-red-500/20';
                labelColor = 'bg-red-600';
                iconColor = 'text-red-500';
                break;
            case 'medication':
                borderColor = 'border-orange-500';
                bgColor = 'bg-orange-500/20';
                labelColor = 'bg-orange-600';
                iconColor = 'text-orange-500';
                break;
            case 'date':
                borderColor = 'border-yellow-400';
                bgColor = 'bg-yellow-400/20';
                labelColor = 'bg-yellow-600';
                iconColor = 'text-yellow-500';
                break;
            case 'normal':
                borderColor = 'border-green-500';
                bgColor = 'bg-green-500/20';
                labelColor = 'bg-green-600';
                iconColor = 'text-green-500';
                break;
        }

        const isPlaying = playingIndex === index;

        return (
          <div
            key={index}
            className={`absolute border-2 ${borderColor} ${bgColor} transition-all duration-200 cursor-pointer hover:bg-opacity-40 z-10`}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              height: `${height}%`,
              width: `${width}%`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveHighlight(activeHighlight === index ? null : index);
            }}
          >
            {/* Icon Group (Speaker + Info) */}
            <div className={`absolute -top-3 -right-8 flex gap-1 z-30 transition-transform ${activeHighlight === index ? 'scale-110' : ''}`}>
               
               {/* Speaker Icon */}
               <button 
                 onClick={(e) => handlePlayAudio(h.label, index, e)}
                 className={`bg-white rounded-full border ${borderColor} p-0.5 shadow-sm hover:scale-110 active:scale-95 transition-transform flex items-center justify-center w-5 h-5`}
                 title="Pronounce"
               >
                  {isPlaying ? (
                    <Loader2 size={12} className={`${iconColor} animate-spin`} />
                  ) : (
                    <Volume2 size={12} className={iconColor} strokeWidth={2.5} />
                  )}
               </button>

               {/* Info Icon */}
               <div className={`bg-white rounded-full border ${borderColor} p-0.5 shadow-sm w-5 h-5 flex items-center justify-center`}>
                  <Info size={12} className={iconColor} strokeWidth={2.5} />
               </div>
            </div>

            {/* Explanation Popup */}
            {activeHighlight === index && (
               <div className={`absolute -top-20 left-1/2 -translate-x-1/2 ${labelColor} text-white px-3 py-2 rounded-xl shadow-xl z-50 pointer-events-none min-w-[180px] max-w-[250px] animate-in zoom-in-95 duration-200`}>
                 <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-90 border-b border-white/20 pb-1">{h.label}</p>
                 <p className="text-xs font-medium leading-tight">
                    {h.importanceExplanation || "Important information regarding your health."}
                 </p>
                 {/* Little triangle arrow pointing down */}
                 <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${labelColor}`}></div>
               </div>
            )}
          </div>
        );
      })}

      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 z-10 pointer-events-none">
        <HelpCircle size={12} />
        <span>Tap <Volume2 size={10} className="inline mx-0.5" /> to listen, <Info size={10} className="inline mx-0.5" /> for info</span>
      </div>
    </div>
  );
};

export default ImageViewer;