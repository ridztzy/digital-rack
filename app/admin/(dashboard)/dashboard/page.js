"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
    TrendingUp, 
    Users, 
    ShoppingBag, 
    DollarSign, 
    Eye,
    Download,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalTransactions: 0,
        totalRevenue: 0,
        monthlyGrowth: {
            products: 0,
            users: 0,
            transactions: 0,
            revenue: 0
        }
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch products count
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // Fetch users count
            const { count: usersCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            // Fetch transactions
            const { data: transactions, count: transactionsCount } = await supabase
                .from('transactions')
                .select('*, users(name)', { count: 'exact' })
                .eq('status', 'success')
                .order('created_at', { ascending: false })
                .limit(5);

            // Calculate total revenue
            const { data: revenueData } = await supabase
                .from('transactions')
                .select('total_amount')
                .eq('status', 'success');

            const totalRevenue = revenueData?.reduce((sum, trx) => sum + trx.total_amount, 0) || 0;

            setStats({
                totalProducts: productsCount || 0,
                totalUsers: usersCount || 0,
                totalTransactions: transactionsCount || 0,
                totalRevenue,
                monthlyGrowth: {
                    products: 12,
                    users: 8,
                    transactions: 15,
                    revenue: 23
                }
            });

            setRecentTransactions(transactions || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statCards = [
        {
            title: "Total Produk",
            value: stats.totalProducts,
            icon: ShoppingBag,
            color: "bg-blue-500",
            growth: stats.monthlyGrowth.products,
            trend: "up"
        },
        {
            title: "Total Pengguna",
            value: stats.totalUsers,
            icon: Users,
            color: "bg-green-500",
            growth: stats.monthlyGrowth.users,
            trend: "up"
        },
        {
            title: "Total Transaksi",
            value: stats.totalTransactions,
            icon: TrendingUp,
            color: "bg-purple-500",
            growth: stats.monthlyGrowth.transactions,
            trend: "up"
        },
        {
            title: "Total Pendapatan",
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
            color: "bg-orange-500",
            growth: stats.monthlyGrowth.revenue,
            trend: "up"
        }
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Selamat datang kembali! Berikut ringkasan aktivitas hari ini.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Hari ini</span>
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Export</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        {stat.trend === 'up' ? (
                                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                                        )}
                                        <span className={`text-sm font-medium ml-1 ${
                                            stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {stat.growth}%
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                            vs bulan lalu
                                        </span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Chart Placeholder */}
                <div className="xl:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grafik Penjualan</h3>
                        <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg">7 Hari</button>
                            <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">30 Hari</button>
                            <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">90 Hari</button>
                        </div>
                    </div>
                    <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="text-center">
                            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Grafik akan ditampilkan di sini</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">Integrasi dengan Chart.js atau library lainnya</p>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaksi Terbaru</h3>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Lihat Semua
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                {transaction.users?.name || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(transaction.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {formatCurrency(transaction.total_amount)}
                                        </p>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Berhasil
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada transaksi</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aksi Cepat</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { title: 'Tambah Produk', icon: ShoppingBag, href: '/admin/products' },
                        { title: 'Kelola User', icon: Users, href: '/admin/users' },
                        { title: 'Lihat Transaksi', icon: TrendingUp, href: '/admin/transactions' },
                        { title: 'Pengaturan', icon: Eye, href: '/admin/settings' }
                    ].map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={index}
                                className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                            >
                                <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{action.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}