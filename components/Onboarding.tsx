import React, { useState, useRef } from 'react';
import { ArrowRight, Check, Mic, Loader2, StopCircle, Languages, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { Language } from '../types';
import { identifyLanguageFromAudio } from '../services/geminiService';

interface OnboardingProps {
  onComplete: (selectedLanguage: Language) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  
  // Voice Input State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
        setIsProcessing(true);
        
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const detected = await identifyLanguageFromAudio(base64);
                if (detected) {
                    setSelectedLang(detected);
                } else {
                    alert("Could not identify language. Please try again.");
                }
                setIsProcessing(false);
            };
            reader.readAsDataURL(audioBlob);
        } catch (error) {
            console.error("Audio processing failed", error);
            setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Screen 1: Trust & Welcome
  if (step === 1) {
    return (
      <div className="h-full flex flex-col bg-navy-900 text-cream-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 z-10 text-center">
          
          <div className="mb-12 animate-fade-in-up">
            <div className="w-24 h-24 bg-navy-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5 rotate-3">
               <Languages className="text-gold-400" size={48} strokeWidth={1.5} />
            </div>
          </div>

          <div className="max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-5xl md:text-6xl font-serif text-cream-50 mb-6 leading-tight tracking-tight">
              MedSnap
            </h1>
            <p className="text-xl text-cream-200/70 font-light leading-relaxed mb-10">
              Transforming complex medical documents into clear, understandable insights. Instantly.
            </p>
          </div>
          
          <button 
            onClick={() => setStep(2)}
            className="group relative px-10 py-4 bg-cream-50 text-navy-900 text-lg font-medium rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Begin Journey <ArrowRight size={18} />
            </span>
          </button>

          <p className="mt-8 text-sm text-cream-200/40 uppercase tracking-widest font-medium animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
             AI-Powered Healthcare Translation
          </p>
        </div>
      </div>
    );
  }

  // Screen 2: Language Selection
  return (
    <div className="h-full flex flex-col bg-navy-900 text-cream-50 relative">
      <div className="absolute top-0 right-0 p-20 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="px-8 pt-16 pb-6 z-10">
        <h1 className="text-4xl font-serif text-cream-50 mb-3 leading-tight">
          Select Language
        </h1>
        <p className="text-lg text-cream-200/60 font-light">
          Choose your preferred language for translation.
        </p>

        {/* Voice Select Button */}
        <div className="mt-8">
            <button 
                onClick={toggleRecording}
                disabled={isProcessing}
                className={`w-full glass-panel rounded-2xl p-4 flex items-center justify-center gap-3 transition-all duration-300 group
                    ${isRecording ? 'border-red-500/50 bg-red-500/10' : 'hover:bg-navy-700/50'}
                `}
            >
                {isProcessing ? (
                    <Loader2 size={20} className="animate-spin text-gold-400" />
                ) : isRecording ? (
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-red-400 font-medium">Listening... Tap to stop</span>
                    </div>
                ) : (
                    <>
                        <Mic size={20} className="text-gold-400 group-hover:scale-110 transition-transform" />
                        <span className="text-cream-100 font-medium">Tap to Speak Language</span>
                    </>
                )}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-3 custom-scrollbar z-10">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelectedLang(lang)}
            className={`
              w-full p-5 rounded-xl flex items-center justify-between transition-all duration-200 border
              ${selectedLang?.code === lang.code 
                ? 'bg-navy-700 border-gold-400/50 shadow-lg shadow-gold-900/10' 
                : 'bg-transparent border-white/5 hover:bg-navy-800 hover:border-white/10'}
            `}
          >
            <div className="flex flex-col items-start text-left">
              <span className={`text-lg font-medium ${selectedLang?.code === lang.code ? 'text-gold-400' : 'text-cream-50'}`}>
                  {lang.nativeName}
              </span>
              <span className="text-sm text-cream-200/40">
                {lang.name}
              </span>
            </div>
            {selectedLang?.code === lang.code && (
              <Check size={20} className="text-gold-400" />
            )}
          </button>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-navy-900 to-navy-900/0 z-20">
        <button 
          onClick={() => selectedLang && onComplete(selectedLang)}
          disabled={!selectedLang}
          className={`
            w-full flex items-center justify-center gap-2 text-lg font-medium py-4 rounded-full shadow-lg transition-all duration-300
            ${selectedLang 
              ? 'bg-cream-50 text-navy-900 hover:scale-[1.02]' 
              : 'bg-navy-800 text-cream-200/20 cursor-not-allowed border border-white/5'}
          `}
        >
          Continue
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;