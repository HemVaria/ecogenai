import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeProvider';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <div className="flex items-center justify-center">
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" checked={theme === 'dark'} onChange={toggleTheme} />
                <div className="w-11 h-6 bg-gray-300 rounded-full shadow-inner"></div>
                <div className={`absolute w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out ${theme === 'dark' ? 'transform translate-x-5' : ''}`}></div>
            </label>
            <span className="ml-3 text-gray-700 dark:text-gray-300">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </div>
    );
};

export default ThemeToggle;