// app/admin/components/Header.js
// Komponen ini bisa tetap sederhana karena state dikelola oleh layout

import React from 'react';
import { Menu, Sun, Moon, Search } from 'lucide-react';

export default function Header({ setIsOpen, isDarkMode, toggleDarkMode }) {
    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between h-16 px-6">
                <button onClick={() => setIsOpen(true)} className="md:hidden text-gray-600 dark:text-gray-300">
                    <Menu />
                </button>
                <div className="hidden md:block relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Cari..." className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={toggleDarkMode} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div className="relative">
                        <img src="https://i.pravatar.cc/150?u=admin-user" alt="Admin" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                </div>
            </div>
        </header>
    );
};