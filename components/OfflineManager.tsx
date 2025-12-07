import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, Wifi, WifiOff, CheckCircle2, Loader2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { LanguageCode } from '../types';
import { getDownloadedModels, downloadModel, deleteModel } from '../services/offlineService';

interface OfflineManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const OfflineManager: React.FC<OfflineManagerProps> = ({ isOpen, onClose }) => {
  const [downloaded, setDownloaded] = useState<LanguageCode[]>([]);
  const [downloading, setDownloading] = useState<LanguageCode | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setDownloaded(getDownloadedModels());
    }
  }, [isOpen]);

  const handleDownload = async (code: LanguageCode) => {
    if (downloading) return;
    setDownloading(code);
    setProgress(0);
    try {
      await downloadModel(code, (p) => setProgress(p));
      setDownloaded(getDownloadedModels());
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = (code: LanguageCode) => {
    deleteModel(code);
    setDownloaded(getDownloadedModels());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <WifiOff className="text-blue-600" />
              Offline Mode
            </h2>
            <p className="text-sm text-slate-500 mt-1">Download language packs to use MedSnap without internet.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-2 flex-1 custom-scrollbar">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isDownloaded = downloaded.includes(lang.code);
            const isDownloading = downloading === lang.code;

            return (
              <div key={lang.code} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDownloaded ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                    <span className="font-bold text-sm">{lang.code.toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{lang.name}</h4>
                    <p className="text-xs text-slate-500">{lang.nativeName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDownloading ? (
                    <div className="flex flex-col items-end gap-1 min-w-[80px]">
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                        <Loader2 size={12} className="animate-spin" />
                        {progress}%
                      </div>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  ) : isDownloaded ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Ready
                      </span>
                      <button 
                        onClick={() => handleDelete(lang.code)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove download"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleDownload(lang.code)}
                      className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl text-xs text-slate-500 flex items-start gap-2">
          <Wifi size={14} className="mt-0.5 shrink-0" />
          <p>
            Note: Offline translations use on-device models and may be less accurate than online analysis. Always verify critical information.
          </p>
        </div>

      </div>
    </div>
  );
};

export default OfflineManager;