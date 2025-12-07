import React from 'react';
import { HeartPulse, History, Settings, ChevronLeft } from 'lucide-react';

interface HeaderProps {
  onHomeClick: () => void;
  onHistoryClick: () => void;
  onSettingsClick: () => void;
  currentView: 'home' | 'history';
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onHistoryClick, onSettingsClick, currentView }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-6 pt-12 flex justify-between items-center pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto cursor-pointer group" onClick={onHomeClick}>
        {currentView === 'history' ? (
           <div className="glass-panel p-3 rounded-full hover:bg-white/5 transition-colors">
              <ChevronLeft size={24} className="text-cream-100" />
           </div>
        ) : (
           <div className="flex items-center gap-3">
             <div className="glass-panel p-2.5 rounded-xl text-gold-400 group-hover:text-gold-300 transition-colors">
               <HeartPulse size={24} strokeWidth={1.5} />
             </div>
             <span className="text-lg font-serif text-cream-50 hidden sm:block">MedSnap</span>
           </div>
        )}
      </div>
      
      <div className="flex gap-4 pointer-events-auto">
         {currentView !== 'history' && (
           <button 
             onClick={onHistoryClick}
             className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-cream-200/70 hover:text-cream-50 hover:bg-white/5 transition-all"
           >
             <History size={20} strokeWidth={1.5} />
           </button>
         )}
         <button 
           onClick={onSettingsClick}
           className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-cream-200/70 hover:text-cream-50 hover:bg-white/5 transition-all"
         >
           <Settings size={20} strokeWidth={1.5} />
         </button>
      </div>
    </header>
  );
};

export default Header;