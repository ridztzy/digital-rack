// app/admin/components/Sidebar.js
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { menuItems } from '../data'; // Import menuItems

export default function Sidebar({ isOpen, setIsOpen }) {
    const pathname = usePathname();

    return (
        <>
            <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-blue-900 text-white transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="flex items-center justify-center h-16 border-b border-blue-800">
                    <h1 className="text-2xl font-bold">DigiRack</h1>
                </div>
                <nav className="flex-grow p-4">
                    <ul>
                        {menuItems.map(item => (
                            <li key={item.name} className="mb-2">
                                <Link
                                    href={item.href}
                                    onClick={() => {
                                        if (window.innerWidth < 768) setIsOpen(false);
                                    }}
                                    className={`flex items-center p-3 rounded-lg transition-colors ${pathname === item.href ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-blue-800">
                    {/* Menggunakan Link untuk kembali ke halaman login */}
                    <Link href="/admin/login" className="flex items-center p-3 rounded-lg hover:bg-blue-800 transition-colors">
                        <LogOut className="mr-3" />
                        <span>Keluar</span>
                    </Link>
                </div>
            </aside>
            {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)}></div>}
        </>
    );
};