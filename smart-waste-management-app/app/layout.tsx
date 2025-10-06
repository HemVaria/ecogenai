import React, { ReactNode } from 'react';
import { ThemeProvider } from '../context/ThemeProvider';
import '../globals.css';
import '../theme.css';

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <ThemeProvider>
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-400 to-blue-500">
                <header className="py-4 text-center text-white">
                    <h1 className="text-3xl font-bold">EcoGenAI — Smart Waste Management</h1>
                </header>
                <main className="flex-grow flex items-center justify-center">
                    {children}
                </main>
                <footer className="py-4 text-center text-white">
                    <p>&copy; {new Date().getFullYear()} EcoGenAI. All rights reserved.</p>
                </footer>
            </div>
        </ThemeProvider>
    );
};

export default Layout;