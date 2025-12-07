
import { LanguageCode } from '../types';

const STORAGE_KEY = 'medsnap_offline_models';
const MOCK_MODEL_SIZE_MB = 245; // Simulated size per language pack

export const getDownloadedModels = (): LanguageCode[] => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Failed to load offline models:", error);
    return [];
  }
};

export const isModelDownloaded = (code: LanguageCode): boolean => {
  const downloaded = getDownloadedModels();
  return downloaded.includes(code);
};

export const getModelSize = (code: LanguageCode): number => {
  // In a real app, different languages might have different sizes
  // Here we simulate slightly different sizes based on code length for variety
  return MOCK_MODEL_SIZE_MB + (code.length * 2); 
};

export const getTotalStorageUsed = (): number => {
  const downloaded = getDownloadedModels();
  return downloaded.reduce((acc, code) => acc + getModelSize(code), 0);
};

export const downloadModel = async (
  code: LanguageCode, 
  onProgress: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Save to storage
        const current = getDownloadedModels();
        if (!current.includes(code)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, code]));
        }
        
        onProgress(100);
        setTimeout(resolve, 500); // Small delay to show 100%
      } else {
        onProgress(progress);
      }
    }, 300); // Simulate network latency
  });
};

export const deleteModel = (code: LanguageCode): void => {
  const current = getDownloadedModels();
  const updated = current.filter(c => c !== code);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
