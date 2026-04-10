import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark-theme');
        document.body.classList.remove('dark-theme');
    }, []);

    const toggleTheme = () => {};
    const setDarkMode = () => {};

    const value = {
        isDarkMode,
        toggleTheme,
        setDarkMode,
        theme: isDarkMode ? 'dark' : 'light',
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
