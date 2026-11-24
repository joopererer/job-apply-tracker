'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Locale, Dictionary, dictionaries } from './dictionaries';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dict: Dictionary;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function detectSystemLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('app_locale');
  if (saved === 'zh' || saved === 'fr' || saved === 'en') {
    return saved;
  }
  const navLang = (navigator.language || '').toLowerCase();
  if (navLang.startsWith('zh')) return 'zh';
  if (navLang.startsWith('fr')) return 'fr';
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = detectSystemLocale();
    setLocaleState(initial);
    document.documentElement.lang = initial;
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('app_locale', newLocale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  }, []);

  const dict = useMemo(() => {
    return dictionaries[locale] || dictionaries.en;
  }, [locale]);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split('.');
      let current: any = dict;

      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          // Fallback to English
          let fallback: any = dictionaries.en;
          for (const fk of keys) {
            if (fallback && typeof fallback === 'object' && fk in fallback) {
              fallback = fallback[fk];
            } else {
              fallback = path;
              break;
            }
          }
          current = fallback;
          break;
        }
      }

      if (typeof current !== 'string') {
        return path;
      }

      if (params) {
        return current.replace(/\{(\w+)\}/g, (_, key) => {
          return key in params ? String(params[key]) : `{${key}}`;
        });
      }

      return current;
    },
    [dict]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, dict, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Graceful fallback for non-provider renders
    const defaultDict = dictionaries.zh;
    return {
      locale: 'zh' as Locale,
      setLocale: () => {},
      dict: defaultDict,
      t: (path: string) => path,
    };
  }
  return context;
}

/**
 * 语言切换按钮组件 (用于 Header 顶部)
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="inline-flex items-center rounded-xl bg-slate-800/80 border border-slate-700/80 p-0.5 text-xs text-slate-300">
      <button
        type="button"
        onClick={() => setLocale('zh')}
        className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
          locale === 'zh'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'hover:text-white text-slate-400'
        }`}
        title="切换为中文"
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => setLocale('fr')}
        className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
          locale === 'fr'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'hover:text-white text-slate-400'
        }`}
        title="Passer en Français"
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
          locale === 'en'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'hover:text-white text-slate-400'
        }`}
        title="Switch to English"
      >
        EN
      </button>
    </div>
  );
}

