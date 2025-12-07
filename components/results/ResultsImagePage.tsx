import React, { useState } from 'react';
import { AnalysisResult } from '../../types';
import ImageViewer from '../ImageViewer';
import { Eye, Maximize2, X, ZoomIn } from 'lucide-react';

interface ResultsImagePageProps {
  imageSrc: string;
  result: AnalysisResult;
}

const ResultsImagePage: React.FC<ResultsImagePageProps> = ({ imageSrc, result }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-navy-900 animate-in fade-in slide-in-from-right duration-300">
        {/* Header Info */}
        <div className="p-6 text-center shrink-0 z-10 bg-navy-900/95 backdrop-blur-sm">
          <div className="w-12 h-12 bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/5 text-gold-400">
              <Eye size={24} />
          </div>
          <h2 className="text-2xl font-serif text-cream-50 font-bold mb-1">Visual Scan</h2>
          <p className="text-sm text-cream-200/60 max-w-xs mx-auto">
              We identified these key areas. Tap image to view full document.
          </p>
        </div>

        {/* Main Image Area - Preview */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-navy-950/50">
          <div className="w-full max-w-md max-h-full shadow-2xl rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center bg-navy-900 relative group">
            <ImageViewer imageSrc={imageSrc} highlights={result.highlights} showHighlights={true} />
            
            {/* Overlay for Full Screen Trigger */}
            <button 
                onClick={() => setIsFullScreen(true)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200 cursor-zoom-in backdrop-blur-[2px]"
            >
                <div className="bg-navy-900/90 p-4 rounded-full text-gold-400 mb-3 shadow-xl border border-white/10 scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Maximize2 size={32} strokeWidth={1.5} />
                </div>
                <span className="text-white font-bold text-sm bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    View Full Document
                </span>
            </button>
          </div>
        </div>

        {/* Legend Footer */}
        <div className="p-6 bg-navy-900 shrink-0 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-bold uppercase tracking-widest">
             <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
               <span className="text-cream-200">Critical</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></span>
               <span className="text-cream-200">Medicine</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
               <span className="text-cream-200">Date</span>
             </div>
          </div>
        </div>
      </div>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-navy-950/98 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-navy-900 shrink-0 shadow-lg z-50">
                <div className="flex items-center gap-3">
                    <ZoomIn className="text-gold-400" size={20} />
                    <h3 className="text-cream-50 font-bold text-lg font-serif">Document View</h3>
                </div>
                <button 
                    onClick={() => setIsFullScreen(false)}
                    className="p-2 bg-white/5 rounded-full hover:bg-white/20 text-cream-100 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex justify-center bg-navy-950">
                <div className="w-full max-w-4xl pb-20">
                    <ImageViewer 
                        imageSrc={imageSrc} 
                        highlights={result.highlights} 
                        showHighlights={true} 
                        imageClassName="w-full h-auto object-contain shadow-2xl rounded-lg" // Override default max-height
                    />
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default ResultsImagePage;