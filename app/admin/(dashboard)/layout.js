// app/admin/(dashboard)/layout.js
"use client"; // Menjadi Client Component untuk mengelola state (sidebar & dark mode)

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '@/app/context/AuthContext'; // pastikan path sesuai

export default function AdminDashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { session, user } = useAuth();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (session && user) {
            if (user.role !== "admin") {
                window.location.href = "/"; // redirect jika bukan admin
            } else {
                setChecking(false);
            }
        } else if (session === null || user === null) {
            window.location.href = "/login"; // redirect jika belum login
        }
    }, [session, user]);

    // Efek untuk mengelola class 'dark' pada HTML
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <span className="text-gray-500 dark:text-gray-300">Memeriksa akses admin...</span>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 dark:bg-gray-900 font-sans">
            <Sidebar 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen}
            />
            <div className="md:ml-64 flex flex-col min-h-screen transition-all duration-300">
                <Header 
                    setIsOpen={setIsSidebarOpen}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                />
                <main className="flex-grow p-6">
                    {children} 
                </main>
            </div>
        </div>
    );
}
