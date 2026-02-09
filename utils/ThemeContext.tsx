import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  inputBackground: string;
  icon: string;
  shadow: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightColors: ThemeColors = {
  background: '#F8FAFC', // Slate 50
  card: '#FFFFFF',
  text: '#0F172A',      // Slate 900
  textSecondary: '#64748B', // Slate 500
  border: '#E2E8F0',    // Slate 200
  primary: '#004e92',   // Royal Blue (Brand)
  secondary: '#475569', // Slate 600
  accent: '#3B82F6',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  inputBackground: '#F8FAFC',
  icon: '#64748B',
  shadow: '#64748B',
};

const darkColors: ThemeColors = {
  background: '#0F172A', // Slate 900
  card: '#1E293B',      // Slate 800
  text: '#F8FAFC',      // Slate 50
  textSecondary: '#94A3B8', // Slate 400
  border: '#334155',    // Slate 700
  primary: '#3B82F6',   // Brighter Blue for Dark Mode readability
  secondary: '#94A3B8', // Slate 400
  accent: '#60A5FA',
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',
  inputBackground: '#020617', // Slate 950
  icon: '#94A3B8',
  shadow: '#000000',
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    const updateSystemBackground = async () => {
      const bgColor = theme === 'light' ? lightColors.background : darkColors.background;
      await SystemUI.setBackgroundColorAsync(bgColor);
    };
    updateSystemBackground();
  }, [theme]);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('app_theme');
      if (storedTheme) {
        setThemeState(storedTheme as Theme);
      } else if (systemScheme) {
        setThemeState(systemScheme as Theme);
      }
    } catch (e) {
      console.error('Failed to load theme', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('app_theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('app_theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const colors = theme === 'light' ? lightColors : darkColors;
  const isDark = theme === 'dark';

  if (!isLoaded) {
    return null; // Or a splash screen loader
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};