import React from 'react';
import { Camera, FileText } from 'lucide-react';
import { Language } from '../types';

interface HomeProps {
  userName: string;
  language: Language;
  onStartCapture: () => void;
}

const Home: React.FC<HomeProps> = ({ userName, language, onStartCapture }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-navy-900">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="text-center space-y-4 mb-16 z-10 animate-fade-in-up">
        <h1 className="text-5xl font-serif text-cream-50 tracking-tight">
          Hello, {userName}
        </h1>
        <div className="h-px w-16 bg-gold-400/50 mx-auto my-6"></div>
        <p className="text-lg text-cream-200/60 font-light max-w-[300px] mx-auto leading-relaxed">
          Ready to translate to <span className="text-gold-400 font-medium">{language.nativeName}</span>
        </p>
      </div>

      <div className="relative z-20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <button
          onClick={onStartCapture}
          className="group relative w-28 h-28 rounded-[2rem] bg-gradient-to-br from-navy-700 to-navy-800 border border-white/10 shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-105 hover:border-gold-400/30"
        >
          <div className="absolute inset-0 bg-gold-400/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
          
          <div className="relative">
            <Camera size={40} className="text-cream-50 group-hover:text-gold-400 transition-colors duration-300" strokeWidth={1.5} />
          </div>
          
          {/* Subtle Ring Animation */}
          <div className="absolute inset-0 rounded-[2rem] border border-white/5 animate-ping opacity-20"></div>
        </button>
        
        <p className="mt-8 text-cream-200/40 text-sm uppercase tracking-widest text-center font-medium">Tap to Scan</p>
      </div>

      {/* Footer Minimal Info */}
      <div className="absolute bottom-8 text-center w-full z-10 opacity-40">
         <p className="text-xs text-cream-200 font-light">Secure • Private • Accurate</p>
      </div>
    </div>
  );
};

export default Home;