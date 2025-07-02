// app/admin/(dashboard)/layout.js
"use client"; // Menjadi Client Component untuk mengelola state (sidebar & dark mode)

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '@/app/context/AuthContext'; // pastikan path sesuai
import { useRouter } from 'next/navigation';

export default function AdminDashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { session, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return; // Tunggu hingga loading selesai
        if (!session || !user) {
            router.push('/login'); // redirect jika belum login
        } else if (user.role !== "admin") {
            router.push('/'); // redirect jika bukan admin
        }
    }, [session, user, loading, router]);

    // Efek untuk mengelola class 'dark' pada HTML
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

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
