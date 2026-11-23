import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'e3-theme';

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

function applyThemeClass(theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.setAttribute('data-theme', theme);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    applyThemeClass(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next === 'dark' ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
