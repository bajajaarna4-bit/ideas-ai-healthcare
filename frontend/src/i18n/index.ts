import { en } from './en';
import { hi } from './hi';
import { mr } from './mr';
import { SupportedLanguage } from '../types';

export const translations = {
  en,
  hi,
  mr
};

export const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' }
];

export function getTranslation(lang: SupportedLanguage) {
  return translations[lang] || translations.en;
}
