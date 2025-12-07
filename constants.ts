import { Language } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Chinese (Mandarin)', nativeName: '中文' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'fa', name: 'Farsi', nativeName: 'فارسی' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာစာ' },
];

export const INITIAL_LANGUAGE = SUPPORTED_LANGUAGES[0];

export const MOCK_IMAGE_URL = "https://picsum.photos/800/600";