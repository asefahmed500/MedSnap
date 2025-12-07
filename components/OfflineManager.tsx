
import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, WifiOff, CheckCircle2, Loader2, HardDrive, Smartphone, Search, Database } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { LanguageCode } from '../types';
import { getDownloadedModels, downloadModel, deleteModel, getTotalStorageUsed, getModelSize, clearAllModels } from '../services/offlineService';

interface OfflineManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const OfflineManager: React.FC<OfflineManagerProps> = ({ isOpen, onClose }) => {
  const [downloaded, setDownloaded] = useState<LanguageCode[]>([]);
  const [downloading, setDownloading] = useState<LanguageCode | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalStorage, setTotalStorage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to remove all downloaded models?")) {
      clearAllModels();
      refreshData();
    }
  };

  if (!isOpen) return null;

  // Format MB/GB
  const formatSize = (mb: number) => {
    if (mb > 1000) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  // Filter languages
  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalCapacity = 2000; // Simulated 2GB limit
  const usagePercentage = Math.min((totalStorage / totalCapacity) * 100, 100);

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-navy-900 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
        
        {/* Header */}
        <div className="p-6 pb-6 bg-navy-800 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-serif font-bold text-cream-50 flex items-center gap-2">
              <WifiOff className="text-gold-400" size={24} />
              Offline Library
            </h2>
            <p className="text-sm text-cream-200/60 mt-1">Manage language packs for offline use.</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-cream-200 hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Storage Dashboard Card */}
        <div className="px-6 py-4 bg-navy-900 shrink-0">
            <div className="bg-navy-800 rounded-2xl p-5 border border-white/5 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-cream-100 font-bold text-sm tracking-wide">
                        <Database size={16} className="text-gold-400" />
                        <span>STORAGE USAGE</span>
                    </div>
                    {totalStorage > 0 && (
                        <button 
                            onClick={handleClearAll}
                            className="text-xs text-red-400 font-medium hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20"
                        >
                            Clear All
                        </button>
                    )}
                </div>
                
                <div className="flex items-end justify-between mb-3">
                    <span className="text-3xl font-serif text-cream-50">{formatSize(totalStorage)}</span>
                    <span className="text-xs text-cream-200/50 font-medium mb-1.5 uppercase tracking-wider">of {formatSize(totalCapacity)} available</span>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="h-3 w-full bg-navy-950 rounded-full overflow-hidden flex relative border border-white/5">
                    <div 
                        className={`h-full transition-all duration-700 ease-out rounded-full relative overflow-hidden ${usagePercentage > 90 ? 'bg-red-500' : 'bg-gold-400'}`}
                        style={{ width: `${usagePercentage}%` }} 
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Search */}
        <div className="px-6 pb-2 shrink-0">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-200/40" size={18} />
                <input 
                    type="text" 
                    placeholder="Search languages..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-navy-800 border border-white/5 rounded-xl text-cream-50 placeholder:text-cream-200/30 focus:outline-none focus:ring-1 focus:ring-gold-400/50 focus:border-gold-400/30 transition-all text-sm font-medium"
                />
            </div>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1 custom-scrollbar bg-navy-900">
          {filteredLanguages.length === 0 ? (
             <div className="text-center py-12 flex flex-col items-center">
                <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center mb-4 border border-white/5">
                    <Search className="text-cream-200/20" size={32} />
                </div>
                <p className="text-cream-200/40 font-medium text-sm">No languages found</p>
             </div>
          ) : (
             filteredLanguages.map((lang) => {
                const isDownloaded = downloaded.includes(lang.code);
                const isDownloading = downloading === lang.code;
                const size = getModelSize(lang.code);

                return (
                  <div 
                    key={lang.code} 
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group ${isDownloaded ? 'bg-navy-800/50 border-gold-400/20' : 'bg-navy-800/30 border-white/5 hover:bg-navy-800 hover:border-white/10'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg border ${isDownloaded ? 'bg-gold-400/10 text-gold-400 border-gold-400/20' : 'bg-white/5 text-cream-200/30 border-white/5'}`}>
                        {lang.code.toUpperCase()}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm ${isDownloaded ? 'text-cream-50' : 'text-cream-200/80'}`}>{lang.name}</h4>
                        <p className="text-xs text-cream-200/40 flex items-center gap-1.5 font-medium mt-0.5">
                            {lang.nativeName} <span className="w-1 h-1 rounded-full bg-cream-200/20"></span> {formatSize(size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {isDownloading ? (
                        <div className="flex flex-col items-end gap-1.5 min-w-[90px]">
                          <div className="flex items-center gap-2 text-[10px] text-gold-400 font-bold uppercase tracking-wider">
                            <Loader2 size={10} className="animate-spin" />
                            {progress}%
                          </div>
                          <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gold-400 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      ) : isDownloaded ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-green-400 font-bold bg-green-900/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-green-500/20">
                            <CheckCircle2 size={12} /> Ready
                          </span>
                          <button 
                            onClick={() => handleDelete(lang.code)}
                            className="p-2 text-cream-200/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Delete Model"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleDownload(lang.code)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 text-cream-100 font-bold text-xs rounded-xl hover:bg-gold-400 hover:text-navy-900 transition-all border border-white/10 hover:border-gold-400"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                );
             })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-navy-800 border-t border-white/5 text-[11px] text-cream-200/40 flex items-start gap-3 shrink-0">
          <Smartphone size={14} className="mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            Models stored locally for offline use. Internet connection recommended for full medical safety checks.
          </p>
        </div>

      </div>
    </div>
  );
};

export default OfflineManager;
