import React from 'react';
import { Brain, Heart } from 'lucide-react';

const Processing: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#E8F5E9] to-[#E3F2FD] p-8">
      
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        {/* Orbiting Circles */}
        <div className="absolute inset-0 rounded-full border border-blue-200/50 animate-[spin_4s_linear_infinite]"></div>
        <div className="absolute inset-4 rounded-full border border-green-200/50 animate-[spin_3s_linear_infinite_reverse]"></div>
        
        {/* Central Morphing Container */}
        <div className="relative w-32 h-32 bg-white rounded-3xl shadow-xl shadow-blue-100 flex items-center justify-center animate-bounce-slow">
           <div className="absolute inset-0 bg-white rounded-3xl animate-ping opacity-20"></div>
           
           {/* Icon Transition */}
           <div className="relative z-10">
              <Brain size={48} className="text-[#0066F5] animate-[pulse_2s_ease-in-out_infinite]" />
           </div>
        </div>

        {/* Flying Particles */}
        <div className="absolute top-0 right-10 w-3 h-3 bg-orange-400 rounded-full animate-ping delay-75"></div>
        <div className="absolute bottom-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-150"></div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">
        Reading your document...
      </h2>
      <p className="text-lg text-slate-500 text-center max-w-[250px]">
        Almost done translating into your language
      </p>

    </div>
  );
};

export default Processing;