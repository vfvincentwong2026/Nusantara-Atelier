'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  dictionaries,
  detectLocale,
  STORAGE_KEY,
  type Dictionary,
  type Locale,
} from '@/lib/i18n';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'zh',
  setLocale: () => {},
  t: dictionaries.zh,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh');

  // 首次访问：localStorage 优先，其次浏览器语言探测
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === 'zh' || saved === 'en' || saved === 'id') {
      setLocaleState(saved);
    } else {
      setLocaleState(detectLocale(window.navigator.language));
    }
  }, []);

  // <html lang> 随语言更新
  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale;
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, t: dictionaries[locale] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
