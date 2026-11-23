import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  translate,
} from '@/i18n/dictionaries';

const readStoredLanguage = () => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(stored) ? stored : null;
  } catch {
    return null;
  }
};

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  setDefaultLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => readStoredLanguage() || 'en');

  /** Explicit user choice — persisted. */
  const setLang = useCallback((next) => {
    if (!SUPPORTED_LANGUAGES.includes(next)) return;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // ignore storage failures
    }
    setLangState(next);
  }, []);

  /** Default (e.g. vendor.preferred_language) — only applied if the user never chose one. */
  const setDefaultLang = useCallback((next) => {
    if (!SUPPORTED_LANGUAGES.includes(next)) return;
    if (readStoredLanguage()) return;
    setLangState(next);
  }, []);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  const value = useMemo(
    () => ({ lang, setLang, setDefaultLang, t }),
    [lang, setLang, setDefaultLang, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return useContext(LanguageContext);
}

export default LanguageContext;
