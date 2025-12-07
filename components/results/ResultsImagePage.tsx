
import React from 'react';
import { AnalysisResult } from '../../types';
import ImageViewer from '../ImageViewer';
import { Eye } from 'lucide-react';

interface ResultsImagePageProps {
  imageSrc: string;
  result: AnalysisResult;
}

const ResultsImagePage: React.FC<ResultsImagePageProps> = ({ imageSrc, result }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-navy-900 animate-in fade-in slide-in-from-right duration-300">
      {/* Header Info */}
      <div className="p-6 text-center shrink-0">
        <div className="w-12 h-12 bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/5 text-gold-400">
            <Eye size={24} />
        </div>
        <h2 className="text-2xl font-serif text-cream-50 font-bold mb-1">Visual Scan</h2>
        <p className="text-sm text-cream-200/60 max-w-xs mx-auto">
            We identified these key areas. Tap boxes for details.
        </p>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-navy-950/50">
        <div className="w-full max-w-md shadow-2xl rounded-2xl overflow-hidden border border-white/10">
          <ImageViewer imageSrc={imageSrc} highlights={result.highlights} showHighlights={true} />
        </div>
      </div>

      {/* Legend Footer */}
      <div className="p-6 bg-navy-900 shrink-0">
        <div className="flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-widest">
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
  );
};

export default ResultsImagePage;
