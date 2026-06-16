import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  theme: 'dark';
  setTheme: (theme: 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark'>('dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="dark min-h-screen bg-[#0B1120] text-gray-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
