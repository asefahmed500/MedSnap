
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult } from '../../types';
import { Info, FileText, Globe } from 'lucide-react';

interface ResultsTranslationPageProps {
  result: AnalysisResult;
}

const ResultsTranslationPage: React.FC<ResultsTranslationPageProps> = ({ result }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-navy-900 animate-in fade-in slide-in-from-right duration-300">
       <div className="p-6 text-center shrink-0 border-b border-white/5">
        <div className="w-12 h-12 bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/5 text-gold-400">
            <Globe size={24} />
        </div>
        <h2 className="text-2xl font-serif text-cream-50 font-bold mb-1">Translation</h2>
        <p className="text-sm text-cream-200/60">Full medical details in your language.</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8">
         {/* Metadata */}
         <div className="flex items-center gap-3 mb-8 bg-navy-800/50 p-4 rounded-xl border border-white/5">
            <div className="p-2.5 bg-navy-700 rounded-lg text-gold-400">
               <FileText size={20} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest mb-0.5">
                  {(result.documentType || 'Document').replace('_', ' ')}
               </p>
               <h1 className="text-xl font-serif font-bold text-cream-50 leading-tight">
                  {result.title}
               </h1>
            </div>
         </div>

         {/* Ambiguities / Notes */}
         {result.ambiguities && result.ambiguities.length > 0 && (
            <div className="mb-10 bg-gold-900/10 border border-gold-500/20 rounded-2xl p-5 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-gold-500/50"></div>
               <div className="flex items-center gap-2 mb-4">
                  <Info size={16} className="text-gold-400" />
                  <h3 className="font-bold text-gold-400 text-xs uppercase tracking-widest">Translator Notes</h3>
               </div>
               <div className="space-y-5">
                  {result.ambiguities.map((item, idx) => (
                     <div key={idx} className="text-sm">
                        <p className="font-serif text-cream-50 text-lg mb-1">
                           <span className="opacity-50 italic">"{item.original}"</span> <span className="text-gold-400 mx-2">→</span> {item.translated}
                        </p>
                        <p className="text-cream-200/70 font-light text-sm leading-relaxed">{item.explanation}</p>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Main Content */}
         <div className="prose prose-lg prose-invert max-w-none 
              prose-p:text-cream-100/90 prose-p:font-light prose-p:leading-loose prose-p:text-[17px]
              prose-headings:font-serif prose-headings:text-cream-50 prose-headings:font-medium
              prose-strong:text-gold-400 prose-strong:font-bold prose-strong:font-sans
              prose-ul:my-6 prose-li:my-2">
            <ReactMarkdown>{result.translatedContent}</ReactMarkdown>
         </div>
         
         <div className="h-20"></div> {/* Spacer */}
      </div>
    </div>
  );
};

export default ResultsTranslationPage;
