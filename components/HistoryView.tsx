import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { Search, Mic, ArrowLeft, Filter } from 'lucide-react';

interface HistoryViewProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ items, onSelect, onBack }) => {
  const [activeTab, setActiveTab] = useState<'me' | 'family'>('me');

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm z-10">
        <div className="flex items-center gap-4 mb-6">
           <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-900">
              <ArrowLeft size={24} />
           </button>
           <h1 className="text-2xl font-bold text-slate-900">History</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
             type="text" 
             placeholder="Search prescriptions..." 
             className="w-full bg-slate-100 text-slate-900 pl-12 pr-12 py-3 rounded-2xl font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
           />
           <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white p-1.5 rounded-xl shadow-sm">
             <Mic size={18} className="text-[#0066F5]" />
           </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
           <button 
             onClick={() => setActiveTab('me')}
             className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'me' ? 'bg-[#0066F5] text-white shadow-md shadow-blue-200' : 'bg-white text-slate-500 border border-slate-100'}`}
           >
             Me
           </button>
           <button 
             onClick={() => setActiveTab('family')}
             className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'family' ? 'bg-[#0066F5] text-white shadow-md shadow-blue-200' : 'bg-white text-slate-500 border border-slate-100'}`}
           >
             My Family
           </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
         {items.length === 0 ? (
            <div className="text-center py-12">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="text-slate-300" />
               </div>
               <p className="text-slate-400 font-medium">No documents yet</p>
            </div>
         ) : (
            items.map((item) => (
               <button 
                 key={item.id}
                 onClick={() => onSelect(item)}
                 className="w-full bg-white p-4 rounded-3xl shadow-sm border border-slate-50 hover:shadow-md transition-all flex gap-4 text-left group active:scale-[0.99]"
               >
                 {/* Thumbnail */}
                 <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden relative shrink-0">
                    <img src={item.image} alt="" className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500" />
                    {item.result.isEmergency && (
                       <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                          <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">URGENT</div>
                       </div>
                    )}
                 </div>

                 {/* Content */}
                 <div className="flex-1 py-1">
                    <div className="flex justify-between items-start mb-1">
                       <span className="bg-blue-50 text-[#0066F5] text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wide">
                          {item.result.documentType}
                       </span>
                       <span className="text-slate-300 text-xs font-medium">
                          {new Date(item.timestamp).toLocaleDateString()}
                       </span>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 line-clamp-2">
                       {item.result.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm font-medium">
                       Dr. Smith • Cardiology
                    </p>
                 </div>
               </button>
            ))
         )}
      </div>
    </div>
  );
};

export default HistoryView;