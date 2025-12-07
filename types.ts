export type LanguageCode = 'es' | 'zh' | 'tl' | 'vi' | 'ar' | 'fr' | 'ko' | 'ru' | 'ht' | 'pt';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export interface HighlightRegion {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000 scale
  label: string;
  type: 'critical' | 'medication' | 'date' | 'normal';
  description?: string;
}

export interface QuizQuestion {
  question: string;
  answer: boolean; // true for Yes, false for No
  explanation: string;
}

export interface AnalysisResult {
  title: string;
  documentType: 'prescription' | 'lab_result' | 'discharge' | 'instruction' | 'unknown';
  translatedContent: string; // Markdown supported
  summary: string; // For audio
  isEmergency: boolean;
  emergencyMessage?: string;
  highlights: HighlightRegion[];
  quiz: QuizQuestion[];
}

export interface AppState {
  step: 'capture' | 'processing' | 'results';
  image: string | null; // Base64
  selectedLanguage: Language;
  result: AnalysisResult | null;
  error: string | null;
}
