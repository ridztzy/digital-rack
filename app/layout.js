'use client';

import React, { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import "./globals.css";
import { usePathname } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { AuthProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isAuth = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password';
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <html lang="id">
      <body className={`${inter.className} bg-white dark:bg-gray-900 transition-colors duration-300`}>
        <AuthProvider>
          <NextTopLoader color="#3B82F6" showSpinner={false} />
          {!isAdmin && !isAuth && (
            <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          )}
          <main className={!isAdmin && !isAuth ? 'min-h-screen' : ''}>
            {children}
          </main>
          {!isAdmin && !isAuth && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}