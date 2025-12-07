import React from 'react';
import { HeartPulse, History, Settings } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <HeartPulse size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-teal-500">
            MedSnap
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:text-blue-600 transition-colors">
            <History size={20} />
          </button>
          <button className="p-2 text-slate-500 hover:text-blue-600 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;