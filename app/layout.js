// app/layout.js
// Layout ini membungkus semua halaman. Cocok untuk menaruh Header, Footer, dan logic tema.
"use client"; // Kita jadikan layout sebagai Client Component untuk mengelola state

import React, { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import "./globals.css"; // Pastikan Anda memiliki file CSS global ini untuk Tailwind
import { usePathname } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';

import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext'; // <-- 1. IMPORT AuthProvider

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/login';
  const isSignup = pathname === '/signup';
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Efek untuk mengubah class 'dark' pada elemen <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-white dark:bg-gray-900 transition-colors duration-300`}>
        {/* 2. BUNGKUS SEMUANYA DENGAN AuthProvider */}
        <AuthProvider>
          {/* Hanya tampilkan Header/Footer jika bukan admin & bukan login */}
          {!isAdmin && !isLogin && !isSignup && <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />}
          <main>
            <NextTopLoader color="#29D" showSpinner={false} />
            {children}
          </main>
          {!isAdmin && !isLogin && !isSignup && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}
