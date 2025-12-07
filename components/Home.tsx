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
    <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-green-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="text-center space-y-2 mb-12 z-10">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Hi {userName} <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-[280px] mx-auto leading-relaxed">
          Ready to scan a prescription or test result in <span className="font-semibold text-blue-600">{language.nativeName}</span>
        </p>
      </div>

      <button
        onClick={onStartCapture}
        className="group relative w-32 h-32 rounded-[2.5rem] bg-[#0066F5] shadow-2xl shadow-blue-300 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 z-20"
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-[2.5rem] transition-opacity"></div>
        <div className="relative">
          <Camera size={48} className="text-white mb-[-8px]" strokeWidth={2.5} />
          <div className="absolute -right-2 -bottom-2 bg-white text-[#0066F5] p-1.5 rounded-xl shadow-sm">
             <FileText size={16} fill="currentColor" />
          </div>
        </div>
        
        {/* Pulse Ring */}
        <div className="absolute inset-0 rounded-[2.5rem] border-4 border-blue-100 opacity-30 animate-ping"></div>
      </button>

      <p className="mt-8 text-slate-400 font-medium z-10">Tap to start</p>
    </div>
  );
};

export default Home;