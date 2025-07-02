"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { session, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!session || !user) {
            router.push('/login');
        } else if (user.role !== "admin") {
            router.push('/');
        }
    }, [session, user, loading, router]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Memuat admin panel...</p>
                </div>
            </div>
        );
    }

    if (!session || !user || user.role !== "admin") {
        return null;
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 font-sans min-h-screen">
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
                <main className="flex-grow p-6 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}