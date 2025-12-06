import React, { createContext, useState, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    cardBackground: string;
    border: string;
    primary: string;
    secondary: string;
    icon: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'light' ? {
    background: '#f8f9fa',
    text: '#2d3436',
    cardBackground: '#fff',
    border: '#e0e0e0',
    primary: '#FF8C00',
    secondary: '#636e72',
    icon: '#666',
  } : {
    background: '#1a1a1a',
    text: '#e0e0e0',
    cardBackground: '#2d2d2d',
    border: '#404040',
    primary: '#FF8C00',
    secondary: '#b0b0b0',
    icon: '#999',
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
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