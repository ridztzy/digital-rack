// app/admin/login/page.js
"use client"; // Diperlukan untuk interaksi form dan routing

import React from 'react';
import { useRouter } from 'next/navigation';

// Komponen View untuk Login bisa diletakkan di sini atau di file terpisah
const LoginView = ({ onLogin }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Admin Login</h2>
            <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <input id="email-address" name="email" type="email" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Alamat email" defaultValue="admin@digirack.com" />
                    </div>
                    <div>
                        <input id="password" name="password" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Password" defaultValue="password" />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            Remember me
                        </label>
                    </div>
                </div>
                <div>
                    <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Login
                    </button>
                </div>
            </form>
        </div>
    </div>
);


export default function LoginPage() {
    const router = useRouter();

    // Fungsi ini akan menangani logika login sesungguhnya nanti
    // Untuk sekarang, kita hanya akan redirect ke dashboard
    const handleLogin = () => {
        // Di aplikasi nyata, Anda akan memvalidasi input, call API, lalu redirect
        console.log("Login berhasil, mengalihkan ke dashboard...");
        router.push('/admin/dashboard');
    };

    return <LoginView onLogin={handleLogin} />;
}
