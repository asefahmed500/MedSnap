import React from 'react';
import { HeartPulse, History, Settings } from 'lucide-react';

interface HeaderProps {
  onHomeClick: () => void;
  onHistoryClick: () => void;
  onSettingsClick: () => void;
  currentView: 'home' | 'history';
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onHistoryClick, onSettingsClick, currentView }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-4 pt-12 flex justify-between items-center pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto" onClick={onHomeClick}>
        <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm text-[#0066F5]">
          <HeartPulse size={24} fill="currentColor" className="text-blue-100" strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="flex gap-3 pointer-events-auto">
         {currentView !== 'history' && (
           <button 
             onClick={onHistoryClick}
             className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-600 shadow-sm hover:bg-white transition-colors"
           >
             <History size={24} />
           </button>
         )}
         <button 
           onClick={onSettingsClick}
           className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-600 shadow-sm hover:bg-white transition-colors"
         >
           <Settings size={24} />
         </button>
      </div>
    </header>
  );
};

export default Header;