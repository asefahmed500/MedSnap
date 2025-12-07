import React, { useState, useRef } from 'react';
import { Globe, Mic, Loader2, StopCircle } from 'lucide-react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';
import { identifyLanguageFromAudio } from '../services/geminiService';

interface LanguageSelectorProps {
  selected: Language;
  onSelect: (lang: Language) => void;
  disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selected, onSelect, disabled }) => {
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
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
        setIsProcessing(true);
        await processAudio(audioBlob);
        setIsProcessing(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const processAudio = async (blob: Blob) => {
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const detected = await identifyLanguageFromAudio(base64);
        if (detected) {
          onSelect(detected);
        } else {
          alert("Could not identify language. Please try again or select manually.");
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Processing error:", err);
      alert("Error processing audio.");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Globe size={16} />
          Translate to / Traducir a
        </label>
        
        <button
          onClick={toggleRecording}
          disabled={disabled || isProcessing}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all
            ${isRecording 
              ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' 
              : isProcessing 
                ? 'bg-slate-100 text-slate-500 cursor-wait'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Detecting...</span>
            </>
          ) : isRecording ? (
            <>
              <StopCircle size={14} />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Mic size={14} />
              <span>Voice Select</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang)}
            disabled={disabled}
            className={`
              flex flex-col items-center justify-center p-3 rounded-xl border transition-all
              ${selected.code === lang.code 
                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-800' 
                : 'bg-white border-slate-200 hover:border-blue-300 text-slate-600 hover:bg-slate-50'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className="font-semibold">{lang.nativeName}</span>
            <span className="text-xs text-slate-400">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;