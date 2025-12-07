import React, { useState } from 'react';
import { AnalysisResult, HighlightRegion } from '../types';
import { Info } from 'lucide-react';

interface ImageViewerProps {
  imageSrc: string;
  highlights: HighlightRegion[];
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageSrc, highlights }) => {
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-md bg-slate-900 group">
      <img 
        src={imageSrc} 
        alt="Original Document" 
        className="w-full h-auto object-contain max-h-[500px]"
      />
      
      {/* Overlays */}
      {highlights.map((h, index) => {
        // box_2d is [ymin, xmin, ymax, xmax] in 0-1000 scale
        const top = h.box_2d[0] / 10;
        const left = h.box_2d[1] / 10;
        const height = (h.box_2d[2] - h.box_2d[0]) / 10;
        const width = (h.box_2d[3] - h.box_2d[1]) / 10;

        let borderColor = 'border-blue-400';
        let bgColor = 'bg-blue-400/20';

        if (h.type === 'critical') {
            borderColor = 'border-red-500';
            bgColor = 'bg-red-500/20';
        } else if (h.type === 'date') {
            borderColor = 'border-yellow-400';
            bgColor = 'bg-yellow-400/20';
        }

        return (
          <div
            key={index}
            className={`absolute border-2 ${borderColor} ${bgColor} transition-all duration-200 cursor-pointer hover:bg-opacity-40`}
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
            {activeHighlight === index && (
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                 {h.label}
               </div>
            )}
          </div>
        );
      })}

      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
        <Info size={12} />
        <span>Tap highlights for info</span>
      </div>
    </div>
  );
};

export default ImageViewer;