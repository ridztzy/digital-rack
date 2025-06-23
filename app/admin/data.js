// app/admin/data.js
// Memusatkan semua mock data untuk panel admin di satu tempat.

import { LayoutDashboard, Box, Tags, ShoppingCart, Users, Star, Image as ImageIcon, Settings } from 'lucide-react';

export const stats = [
    { title: "Total Produk Digital", value: "78", icon: <Box className="w-8 h-8" /> },
    { title: "Total Transaksi", value: "1,250", icon: <ShoppingCart className="w-8 h-8" /> },
    { title: "Total Pendapatan", value: "Rp 120.5M", icon: <LayoutDashboard className="w-8 h-8" /> },
    { title: "Total Pengguna", value: "340", icon: <Users className="w-8 h-8" /> },
];

export const recentTransactions = [
    { id: "TRX001", user: "Budi Santoso", product: "Template Desain Pro", amount: "Rp 150.000", status: "Sukses" },
    { id: "TRX002", user: "Citra Lestari", product: "E-book AI", amount: "Rp 99.000", status: "Sukses" },
    { id: "TRX003", user: "Ahmad Dahlan", product: "Lisensi Analytic Pro", amount: "Rp 450.000", status: "Pending" },
    { id: "TRX004", user: "Dewi Anjani", product: "Template Desain Pro", amount: "Rp 150.000", status: "Gagal" },
];

export const products = [
    { id: 1, name: "Template Desain Grafis Pro", price: "Rp 150.000", type: "Template", file: "template.zip", status: "Aktif" },
    { id: 2, name: 'E-book "AI untuk Bisnis"', price: "Rp 99.000", type: "E-book", file: "ebook-ai.pdf", status: "Aktif" },
    { id: 3, name: 'Lisensi Software "Analytic Pro"', price: "Rp 450.000", type: "Lisensi", file: "license.txt", status: "Nonaktif" },
    { id: 4, name: 'Plugin "SEO Master"', price: "Rp 250.000", type: "Plugin", file: "plugin-seo.zip", status: "Aktif" },
];

export const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard />, href: '/admin/dashboard' },
    { name: 'Produk Digital', icon: <Box />, href: '/admin/products' },
    { name: 'Kategori Produk', icon: <Tags />, href: '/admin/categories' },
    { name: 'Transaksi', icon: <ShoppingCart />, href: '/admin/transactions' },
    { name: 'Pengguna', icon: <Users />, href: '/admin/users' },
    { name: 'Testimoni', icon: <Star />, href: '/admin/testimonials' },
    { name: 'Banner / Hero', icon: <ImageIcon />, href: '/admin/banners' },
    { name: 'Setting Website', icon: <Settings />, href: '/admin/settings' },
];
