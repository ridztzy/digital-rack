"use client";

import React from 'react';
import { Menu, Sun, Moon, Search, Bell, Settings } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function Header({ setIsOpen, isDarkMode, toggleDarkMode }) {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between h-16 px-6">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => setIsOpen(true)} 
                        className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                    
                    {/* Search Bar */}
                    <div className="hidden md:block relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari di admin panel..." 
                            className="pl-10 pr-4 py-2 w-80 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-3">
                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Settings */}
                    <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Settings size={20} />
                    </button>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                        <div className="hidden sm:block text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user?.name || 'Administrator'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Super Admin
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600">
                            <img
                                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&size=32&background=3b82f6&color=ffffff`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}