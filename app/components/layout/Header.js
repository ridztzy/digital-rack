'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, User, LogOut, Settings, Sun, Moon, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const Header = ({ isDarkMode, toggleDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { session, user } = useAuth();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const cartIdRef = useRef(null);

  // Fetch cart count
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

  // Realtime subscription for cart changes
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
        () => {
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

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/products", label: "Produk" },
    { href: "/transactions", label: "Transaksi" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DR</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            DigiRack
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium
                ${isActive(link.href) 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-700 dark:text-gray-300"
                }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Cart */}
          <Link
            href="/cart"
            className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center relative
              ${isActive("/cart") 
                ? "text-blue-600 dark:text-blue-400" 
                : "text-gray-700 dark:text-gray-300"
              }`}
            aria-label="Keranjang"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {session ? (
            <div className="relative group">
              <button className="text-gray-700 dark:text-gray-300 flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <User className="h-5 w-5" />
                <span className="font-medium">{user?.name || session.user.email}</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  {user?.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Masuk
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors
                  ${isActive(link.href) 
                    ? "text-blue-600 dark:text-blue-400 font-semibold" 
                    : "text-gray-700 dark:text-gray-300"
                  }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            <Link
              href="/cart"
              className={`flex items-center py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors
                ${isActive("/cart") 
                  ? "text-blue-600 dark:text-blue-400 font-semibold" 
                  : "text-gray-700 dark:text-gray-300"
                }`}
              onClick={() => setMenuOpen(false)}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Keranjang {cartCount > 0 && `(${cartCount})`}
            </Link>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              {session ? (
                <>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {user?.name || session.user.email}
                  </div>
                  {user?.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="block py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => setMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/signup"
                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => setMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;