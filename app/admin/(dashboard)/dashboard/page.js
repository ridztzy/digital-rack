// app/admin/(dashboard)/dashboard/page.js
// Ini adalah Server Component secara default, bagus untuk performa.

import React from 'react';
import { stats, recentTransactions } from '../../data';

export default function DashboardPage() {
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <div key={stat.title} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                        <div className="text-blue-500">{stat.icon}</div>
                    </div>
                ))}
            </div>
            <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Grafik Penjualan</h3>
                    <div className="h-80 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                        <p className="text-gray-500">Placeholder untuk Grafik</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">Transaksi Terbaru</h3>
                    <div className="space-y-4">
                        {recentTransactions.slice(0, 4).map(tx => (
                            <div key={tx.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">{tx.user}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{tx.product}</p>
                                </div>
                                <p className="font-bold text-gray-900 dark:text-white">{tx.amount}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
