import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  selected: Language;
  onSelect: (lang: Language) => void;
  disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
        <Globe size={16} />
        Translate to / Traducir a
      </label>
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