// app/components/Header.js
// Komponen ini sekarang menggunakan AuthContext untuk mendapatkan status login
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, User, LogOut, Settings, Sun, Moon, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";

// --- Perubahan Kunci (Langkah 1) ---
// Hapus import dari 'next-auth/react'
// Impor hook useAuth dari context kita dan client supabase
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const Header = ({ isDarkMode, toggleDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { session, user } = useAuth();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const cartIdRef = useRef(null);

  // Fetch cartId & count awal
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!session) {
        setCartCount(0);
        cartIdRef.current = null;
        return;
      }
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      if (!cart) {
        setCartCount(0);
        cartIdRef.current = null;
        return;
      }
      cartIdRef.current = cart.id;
      const { count } = await supabase
        .from('cart_items')
        .select('id', { count: 'exact', head: true })
        .eq('cart_id', cart.id);
      setCartCount(count || 0);
    };
    fetchCartCount();
  }, [session]);

  // Realtime subscription
  useEffect(() => {
    if (!cartIdRef.current) return;

    const channel = supabase
      .channel('cart_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `cart_id=eq.${cartIdRef.current}`,
        },
        payload => {
          // Fetch ulang count jika ada perubahan
          supabase
            .from('cart_items')
            .select('id', { count: 'exact', head: true })
            .eq('cart_id', cartIdRef.current)
            .then(({ count }) => setCartCount(count || 0));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cartIdRef.current]);

  // Helper untuk cek link aktif
  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

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
            className={`hover:text-blue-600 dark:hover:text-blue-500 transition-colors
              ${isActive("/") ? "font-bold text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={`hover:text-blue-600 dark:hover:text-blue-500 transition-colors
              ${isActive("/products") ? "font-bold text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
          >
            Produk
          </Link>
          <Link
            href="/transactions"
            className={`hover:text-blue-600 dark:hover:text-blue-500 transition-colors
              ${pathname === "/transactions" ? "font-bold text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
          >
            Transaksi
          </Link>
          <Link
            href="/cart"
            className={`hover:text-blue-600 dark:hover:text-blue-500 transition-colors flex items-center relative
              ${isActive("/cart") ? "font-bold text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
            aria-label="Keranjang"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </Link>

          {/* --- Perubahan Kunci (Langkah 4) --- */}
          {/* Gunakan variabel `session` dan `user` dari `useAuth` */}
          {session ? (
            <div className="relative group">
              <button className="text-gray-700 dark:text-gray-300 flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
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
            className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button> */}
        </nav>

        {/* Mobile menu button (logikanya tetap sama) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hover:text-blue-600 dark:hover:text-blue-500 focus:outline-none"
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
            className={`block py-2 hover:text-blue-600 dark:hover:text-blue-500
              ${isActive("/") ? "font-bold text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={`block py-2 hover:text-blue-600 dark:hover:text-blue-500
              ${isActive("/products") ? "font-bold text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
          >
            Produk
          </Link>
          <Link
            href="/transactions"
            className={`block py-2 hover:text-blue-600 dark:hover:text-blue-500
              ${pathname === "/transactions" ? "font-bold text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
          >
            Transaksi
          </Link>
          <Link
            href="/cart"
            className={`hover:text-blue-600 dark:hover:text-blue-500 transition-colors flex items-center
              ${isActive("/cart") ? "font-bold text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
            aria-label="Keranjang"
          >
            <ShoppingCart className="h-5 w-5" />
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
                  className="text-gray-700 dark:text-gray-300 block py-2 hover:text-blue-600 dark:hover:text-blue-500"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-gray-700 dark:text-gray-300 block py-2 hover:text-blue-600 dark:hover:text-blue-500"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
          {/* <button
            onClick={toggleDarkMode}
            className="mt-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button> */}
        </div>
      )}
    </header>
  );
};

export default Header;
