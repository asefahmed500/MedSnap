import React, { useRef, useState } from 'react';
import { Camera, Upload, AlertCircle } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { Language } from '../types';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, selectedLanguage, onLanguageChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCapture(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onCapture(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Understand your Medical Documents
        </h1>
        <p className="text-slate-500 text-lg">
          Take a photo of a prescription, lab result, or instruction sheet.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <LanguageSelector 
          selected={selectedLanguage} 
          onSelect={onLanguageChange} 
        />

        <div 
          className={`
            relative group cursor-pointer
            border-2 border-dashed rounded-2xl p-8
            flex flex-col items-center justify-center text-center gap-4
            transition-all duration-200
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Camera size={32} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-slate-900">Tap to Take Photo</p>
            <p className="text-sm text-slate-500">or upload from gallery</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            <AlertCircle size={12} />
            <span>Private & Secure • Processed instantly</span>
          </div>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          '💊 Prescription Details',
          '🧪 Lab Results',
          '📋 Discharge Summary',
          '⚠️ Emergency Warnings'
        ].map((feature, i) => (
          <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 shadow-sm">
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CameraCapture;