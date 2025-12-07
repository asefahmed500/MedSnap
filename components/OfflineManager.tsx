
import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, Wifi, WifiOff, CheckCircle2, Loader2, HardDrive, Smartphone } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { LanguageCode } from '../types';
import { getDownloadedModels, downloadModel, deleteModel, getTotalStorageUsed, getModelSize } from '../services/offlineService';

interface OfflineManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const OfflineManager: React.FC<OfflineManagerProps> = ({ isOpen, onClose }) => {
  const [downloaded, setDownloaded] = useState<LanguageCode[]>([]);
  const [downloading, setDownloading] = useState<LanguageCode | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalStorage, setTotalStorage] = useState(0);

  const refreshData = () => {
    setDownloaded(getDownloadedModels());
    setTotalStorage(getTotalStorageUsed());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  const handleDownload = async (code: LanguageCode) => {
    if (downloading) return;
    setDownloading(code);
    setProgress(0);
    try {
      await downloadModel(code, (p) => setProgress(p));
      refreshData();
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = (code: LanguageCode) => {
    deleteModel(code);
    refreshData();
  };

  if (!isOpen) return null;

  // Format MB/GB
  const formatSize = (mb: number) => {
    if (mb > 1000) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <WifiOff className="text-[#0066F5]" size={24} />
              Offline Models
            </h2>
            <p className="text-sm text-slate-500 mt-1">Manage language packs for offline use.</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Storage Dashboard */}
        <div className="px-6 py-6 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <HardDrive size={14} /> Storage Used
                </span>
                <span className="text-lg font-bold text-slate-900">{formatSize(totalStorage)}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                    className="h-full bg-[#0066F5] transition-all duration-500" 
                    style={{ width: `${Math.min((totalStorage / 2000) * 100, 100)}%` }} // Assume 2GB soft limit for visual
                />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">
                {formatSize(2000 - totalStorage)} available (simulated)
            </p>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1 custom-scrollbar bg-white">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isDownloaded = downloaded.includes(lang.code);
            const isDownloading = downloading === lang.code;
            const size = getModelSize(lang.code);

            return (
              <div 
                key={lang.code} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${isDownloaded ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm ${isDownloaded ? 'bg-white text-[#0066F5]' : 'bg-slate-100 text-slate-400'}`}>
                    {lang.code.toUpperCase()}
                  </div>
                  <div>
                    <h4 className={`font-bold ${isDownloaded ? 'text-slate-900' : 'text-slate-600'}`}>{lang.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                        {lang.nativeName} • {formatSize(size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDownloading ? (
                    <div className="flex flex-col items-end gap-1 min-w-[80px]">
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
                        <Loader2 size={12} className="animate-spin" />
                        {progress}%
                      </div>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0066F5] transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  ) : isDownloaded ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 size={12} /> Ready
                      </span>
                      <button 
                        onClick={() => handleDelete(lang.code)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Model"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleDownload(lang.code)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#0066F5] font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <Download size={16} />
                      Get
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-start gap-3">
          <Smartphone size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <p className="leading-relaxed">
            Offline models allow basic translation without internet. For full medical accuracy and safety checks, an internet connection is recommended.
          </p>
        </div>

      </div>
    </div>
  );
};

export default OfflineManager;
