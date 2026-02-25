import React from 'react';
import { useThemeStore } from '../store/useThemeStore';

// Compatibility hook
export const useTheme = () => {
  const { theme, toggleTheme, setTheme, colors, isDark } = useThemeStore();
  return { theme, toggleTheme, setTheme, colors, isDark };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};