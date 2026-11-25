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
 * 语言切换下拉选择组件 (用于 Header / 登录页 / 分享页)
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label="Language"
      className={`px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-slate-200 text-[11px] sm:text-xs font-semibold cursor-pointer focus:outline-none focus:border-blue-500 transition ${className}`}
    >
      <option value="zh">🇨🇳 中文</option>
      <option value="fr">🇫🇷 FR</option>
      <option value="en">🇬🇧 EN</option>
    </select>
  );
}

