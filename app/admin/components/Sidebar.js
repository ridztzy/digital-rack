"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, X } from 'lucide-react';
import { menuItems } from '../data';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function Sidebar({ isOpen, setIsOpen }) {
    const pathname = usePathname();
    const { user } = useAuth();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden" 
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 shadow-2xl`}>
                
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-blue-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">DR</span>
                        </div>
                        <h1 className="text-xl font-bold">DigiRack Admin</h1>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-blue-200 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-6 border-b border-blue-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-700">
                            <img
                                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&size=40&background=3b82f6&color=ffffff`}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="font-medium text-white">{user?.name || 'Administrator'}</div>
                            <div className="text-xs text-blue-200">Super Admin</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map(item => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                                if (window.innerWidth < 768) setIsOpen(false);
                            }}
                            className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
                                pathname === item.href 
                                    ? 'bg-blue-700 text-white shadow-lg' 
                                    : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                            }`}
                        >
                            <span className={`mr-3 transition-transform duration-200 ${
                                pathname === item.href ? 'scale-110' : 'group-hover:scale-110'
                            }`}>
                                {item.icon}
                            </span>
                            <span className="font-medium">{item.name}</span>
                            {pathname === item.href && (
                                <div className="ml-auto w-2 h-2 bg-blue-300 rounded-full"></div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-blue-700/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 rounded-xl text-blue-100 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200 group"
                    >
                        <LogOut className="mr-3 group-hover:scale-110 transition-transform duration-200" size={20} />
                        <span className="font-medium">Keluar</span>
                    </button>
                </div>
            </aside>
        </>
    );
}