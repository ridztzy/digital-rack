// app/components/Header.js
// Komponen ini sekarang menggunakan AuthContext untuk mendapatkan status login
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, User, LogOut, Settings, Sun, Moon } from "lucide-react";

// --- Perubahan Kunci (Langkah 1) ---
// Hapus import dari 'next-auth/react'
// Impor hook useAuth dari context kita dan client supabase
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const Header = ({ isDarkMode, toggleDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // --- Perubahan Kunci (Langkah 2) ---
  // Ganti useSession dengan useAuth untuk mendapatkan data dari Supabase
  const { session, user } = useAuth();

  // --- Perubahan Kunci (Langkah 3) ---
  // Buat fungsi logout yang memanggil supabase
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Redirect atau refresh bisa ditambahkan di sini jika perlu
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">
            DigiRack
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
          >
            Produk
          </Link>
          <Link
            href="/#testimonials"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
          >
            Testimoni
          </Link>
          <Link
            href="/#faq"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
          >
            FAQ
          </Link>

          {/* --- Perubahan Kunci (Langkah 4) --- */}
          {/* Gunakan variabel `session` dan `user` dari `useAuth` */}
          {session ? (
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
                <User className="h-5 w-5" />
                {/* Ambil nama dari tabel 'users', jika tidak ada, fallback ke email */}
                <span>{user?.name || session.user.email}</span>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  {/* Cek peran dari tabel 'users' kita */}
                  {user?.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout} // Panggil fungsi logout yang benar
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Daftar
              </Link>
            </div>
          )}
          {/* Dark mode toggle */}
          {/* <button
            onClick={toggleDarkMode}
            className="ml-4 p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button> */}
        </nav>

        {/* Mobile menu button (logikanya tetap sama) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500 focus:outline-none"
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation (logikanya sudah disesuaikan juga) */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 px-6 pb-4">
          <Link
            href="/"
            className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500"
          >
            Produk
          </Link>
          <Link
            href="/#testimonials"
            className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500"
          >
            Testimoni
          </Link>
          <Link
            href="/#faq"
            className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500"
          >
            FAQ
          </Link>
          {/* ... link lainnya ... */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
            {session ? (
              <>
                {user?.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="block py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-500"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
          {/* <button
            onClick={toggleDarkMode}
            className="mt-4 p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button> */}
        </div>
      )}
    </header>
  );
};

export default Header;
