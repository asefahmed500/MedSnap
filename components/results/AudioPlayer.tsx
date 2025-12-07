import React from 'react';
import { Play, Pause, Loader2, RotateCcw, RotateCw } from 'lucide-react';

interface AudioPlayerProps {
  summary: string;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  onToggle: () => void;
  onSeek: (time: number) => void;
}

/**
 * AudioPlayer Component
 * Responsibility: Displays audio summary, real-time progress bar, and precise playback controls.
 */
const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  summary, 
  isPlaying, 
  isLoading, 
  currentTime, 
  duration, 
  onToggle, 
  onSeek 
}) => {
  
  // Format seconds into MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  const handleSkip = (seconds: number) => {
    onSeek(Math.min(Math.max(currentTime + seconds, 0), duration));
  };

  // Calculate percentage for progress bar styling
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-md bg-gradient-to-b from-navy-800 to-navy-900 rounded-[2rem] p-8 border border-white/5 shadow-2xl mb-8 relative overflow-hidden group">
        {/* Background Glow Effect - Pulsates when playing */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-500/5 rounded-full blur-[60px] transition-all duration-1000 ${isPlaying ? 'opacity-100 scale-110' : 'opacity-30 scale-100'}`}></div>

        {/* Summary Text Display */}
        <div className="relative z-10 min-h-[100px] flex items-center justify-center mb-8">
            <p className="text-center text-cream-50 font-serif text-lg leading-relaxed italic opacity-90 line-clamp-4">
                "{summary}"
            </p>
        </div>
        
        {/* Progress Bar Area */}
        <div className="relative z-10 w-full mb-8 group/progress">
            <div className="flex justify-between text-[10px] font-bold text-gold-400 uppercase tracking-widest mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>
            
            <div className="relative h-2 bg-navy-950 rounded-full w-full">
                {/* Visual Progress Track */}
                <div 
                    className="absolute top-0 left-0 h-full bg-gold-400 rounded-full transition-all duration-100"
                    style={{ width: `${progressPercent}%` }}
                >
                    {/* Handle Glow */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                </div>

                {/* Interactive Input Range */}
                <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={currentTime} 
                    onChange={handleSeekChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading || duration === 0}
                />
            </div>
        </div>

        {/* Player Controls */}
        <div className="relative z-10 flex items-center justify-center gap-8">
            <button 
                onClick={() => handleSkip(-10)}
                className="text-cream-200/40 hover:text-cream-50 transition-colors hover:scale-110 active:scale-95 p-3 rounded-full hover:bg-white/5"
                title="Rewind 10s"
                disabled={isLoading}
            >
                <RotateCcw size={22} strokeWidth={2} />
            </button>
            
            <button 
                onClick={onToggle}
                disabled={isLoading}
                className="w-20 h-20 bg-gold-400 text-navy-900 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold-500/20 disabled:opacity-50 disabled:cursor-wait ring-4 ring-navy-900 ring-offset-2 ring-offset-gold-400/20"
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isLoading ? <Loader2 className="animate-spin" size={32} /> : isPlaying ? <Pause fill="currentColor" size={32} /> : <Play fill="currentColor" size={32} className="ml-1.5" />}
            </button>
            
            <button 
                onClick={() => handleSkip(10)}
                className="text-cream-200/40 hover:text-cream-50 transition-colors hover:scale-110 active:scale-95 p-3 rounded-full hover:bg-white/5"
                title="Forward 10s"
                disabled={isLoading}
            >
                <RotateCw size={22} strokeWidth={2} />
            </button>
        </div>
    </div>
  );
};

export default AudioPlayer;