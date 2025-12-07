import { HistoryItem } from '../types';

const STORAGE_KEY = 'medsnap_history';
const MAX_HISTORY_ITEMS = 20; // Limit storage to prevent quota issues

export const saveToHistory = (item: HistoryItem): void => {
  try {
    const existingHistory = getHistory();
    // Prepend new item
    const newHistory = [item, ...existingHistory];
    
    // Trim if too long
    if (newHistory.length > MAX_HISTORY_ITEMS) {
      newHistory.length = MAX_HISTORY_ITEMS;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to save history (likely storage quota exceeded):", error);
  }
};

export const getHistory = (): HistoryItem[] => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};