import { create } from 'zustand';
import type { Language } from '../lib/i18n';
import { getLanguage, setLanguage as saveLanguage } from '../lib/i18n';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: getLanguage(),
  setLanguage: (lang) => {
    saveLanguage(lang);
    set({ language: lang });
  },
}));
