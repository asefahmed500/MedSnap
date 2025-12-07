
import React, { useEffect, useState } from 'react';
import { Brain, ShieldCheck, Languages, FileSearch, Loader2 } from 'lucide-react';

const Processing: React.FC = () => {
  const [stage, setStage] = useState(0);

  // Simulate stages for better UX perception of time
  useEffect(() => {
    const intervals = [
        setTimeout(() => setStage(1), 1500), // Scanning
        setTimeout(() => setStage(2), 3500), // Medical Analysis
        setTimeout(() => setStage(3), 6000), // Translating
    ];
    return () => intervals.forEach(clearTimeout);
  }, []);

  const stages = [
    { icon: FileSearch, text: "Scanning document...", sub: "Extracting text & identifying structure" },
    { icon: ShieldCheck, text: "Checking safety...", sub: "Detecting critical warnings & dosages" },
    { icon: Brain, text: "Interpreting context...", sub: "Consulting medical knowledge base" },
    { icon: Languages, text: "Translating...", sub: "Generating culturally accurate explanation" }
  ];

  const currentStageInfo = stages[Math.min(stage, stages.length - 1)];
  const CurrentIcon = currentStageInfo.icon;

  return (
    <div className="h-full flex flex-col items-center justify-center bg-navy-900 relative overflow-hidden p-8">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        
        {/* Central Animation */}
        <div className="relative w-32 h-32 mx-auto mb-12">
            {/* Outer Rings */}
            <div className="absolute inset-0 border-2 border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute inset-2 border border-gold-400/20 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
            
            {/* Active Spinner */}
            <div className="absolute inset-0 rounded-full border-t-2 border-gold-400 animate-spin"></div>
            
            {/* Icon Container */}
            <div className="absolute inset-2 bg-navy-800 rounded-full flex items-center justify-center shadow-2xl border border-white/10">
                <CurrentIcon size={48} className="text-cream-50 animate-fade-in-up transition-all duration-500" key={stage} />
            </div>
        </div>

        {/* Text Status */}
        <div className="text-center space-y-3 mb-12 h-20 w-full">
            <h2 className="text-2xl font-serif text-cream-50 font-bold animate-fade-in-up" key={stage}>
                {currentStageInfo.text}
            </h2>
            <p className="text-cream-200/60 text-sm font-medium animate-fade-in-up" style={{ animationDelay: '100ms' }} key={stage + 'sub'}>
                {currentStageInfo.sub}
            </p>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-3 mb-12">
            {stages.map((_, i) => (
                <div 
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                        i === stage 
                            ? 'w-10 bg-gold-400' 
                            : i < stage 
                                ? 'w-2 bg-gold-400/40' 
                                : 'w-2 bg-white/10'
                    }`}
                />
            ))}
        </div>
        
        <div className="flex items-center justify-center gap-2 text-xs text-cream-200/30 uppercase tracking-widest font-bold">
            <Loader2 className="animate-spin" size={12} />
            <span>AI Processing Securely</span>
        </div>

      </div>
    </div>
  );
};

export default Processing;
