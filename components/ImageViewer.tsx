
import React, { useState } from 'react';
import { HighlightRegion } from '../types';
import { Info, HelpCircle } from 'lucide-react';

interface ImageViewerProps {
  imageSrc: string;
  highlights: HighlightRegion[];
  showHighlights?: boolean;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageSrc, highlights, showHighlights = true }) => {
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-md bg-slate-900 group">
      <img 
        src={imageSrc} 
        alt="Original Document" 
        className="w-full h-auto object-contain max-h-[500px]"
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
            {/* Tappable 'i' Icon in Corner */}
            <div className={`absolute -top-3 -right-3 bg-white rounded-full p-0.5 shadow-sm z-30 transform hover:scale-110 transition-transform ${activeHighlight === index ? 'scale-110' : ''}`}>
               <div className={`bg-white rounded-full border ${borderColor} p-0.5`}>
                  <Info size={12} className={iconColor} strokeWidth={2.5} />
               </div>
            </div>

            {/* Explanation Popup */}
            {activeHighlight === index && (
               <div className={`absolute -top-16 left-1/2 -translate-x-1/2 ${labelColor} text-white px-3 py-2 rounded-xl shadow-xl z-50 pointer-events-none min-w-[180px] max-w-[250px] animate-in zoom-in-95 duration-200`}>
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

      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 z-10">
        <HelpCircle size={12} />
        <span>Tap <Info size={10} className="inline mx-0.5" /> icons for info</span>
      </div>
    </div>
  );
};

export default ImageViewer;
