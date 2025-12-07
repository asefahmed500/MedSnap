import React, { useState, useRef } from 'react';
import { ArrowRight, Check, Mic, Loader2, StopCircle } from 'lucide-react';
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
      <div className="h-full flex flex-col bg-white">
        {/* Full bleed photo simulation */}
        <div className="flex-1 relative overflow-hidden bg-slate-200">
          <img 
            src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Smiling grandmother with doctor" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
        </div>

        <div className="px-8 pb-12 pt-6 bg-white rounded-t-3xl -mt-6 relative z-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
            Never be confused by medical papers again
          </h1>
          <p className="text-xl text-slate-500 mb-8 leading-relaxed">
            Take a photo <span className="text-blue-600 font-bold">→</span> understand instantly in your language
          </p>
          
          <button 
            onClick={() => setStep(2)}
            className="w-full bg-[#0066F5] text-white text-xl font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Screen 2: Language Selection
  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-8 pt-12 pb-6">
        <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">
            What language do you speak at home?
            </h1>
        </div>
        <p className="text-lg text-slate-500 mb-4">
          We'll translate everything into this language.
        </p>

        {/* Voice Select Button */}
        <button 
            onClick={toggleRecording}
            disabled={isProcessing}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm w-full justify-center ${
                isRecording 
                ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' 
                : isProcessing 
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
            }`}
        >
            {isProcessing ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    Detecting language...
                </>
            ) : isRecording ? (
                <>
                    <StopCircle size={20} />
                    Listening... Tap to stop
                </>
            ) : (
                <>
                    <Mic size={20} />
                    Tap to speak your language
                </>
            )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-3 custom-scrollbar">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelectedLang(lang)}
            className={`
              w-full p-5 rounded-2xl flex items-center justify-between transition-all duration-200
              ${selectedLang?.code === lang.code 
                ? 'bg-[#0066F5] text-white shadow-xl shadow-blue-200 scale-[1.02]' 
                : 'bg-white text-slate-700 shadow-sm border border-slate-100 hover:bg-slate-50'}
            `}
          >
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold">{lang.nativeName}</span>
              <span className={`text-sm ${selectedLang?.code === lang.code ? 'text-blue-100' : 'text-slate-400'}`}>
                {lang.name}
              </span>
            </div>
            {selectedLang?.code === lang.code && (
              <div className="bg-white/20 p-1 rounded-full">
                <Check size={24} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-lg border-t border-slate-200">
        <button 
          onClick={() => selectedLang && onComplete(selectedLang)}
          disabled={!selectedLang}
          className={`
            w-full flex items-center justify-center gap-2 text-xl font-bold py-4 rounded-2xl shadow-lg transition-all
            ${selectedLang 
              ? 'bg-[#0066F5] text-white hover:bg-blue-700 shadow-blue-200' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
          `}
        >
          Continue
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;