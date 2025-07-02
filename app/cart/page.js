'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchCart = async () => {
    try {
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!cart) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const { data: items } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          products (
            id,
            name,
            price,
            thumbnail_url,
            slug
          )
        `)
        .eq('cart_id', cart.id);

      setCartItems(items?.map(item => ({
        id: item.id,
        productId: item.products.id,
        name: item.products.name,
        price: item.products.price,
        quantity: item.quantity,
        thumbnail_url: item.products.thumbnail_url,
        slug: item.products.slug,
        selected: true,
      })) || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [id]: true }));
    
    try {
      await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', id);

      setCartItems(items =>
        items.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRemove = async (id) => {
    setUpdating(prev => ({ ...prev, [id]: true }));
    
    try {
      await supabase.from('cart_items').delete().eq('id', id);
      setCartItems(items => items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleSelectItem = (id) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectAllItems = () => {
    const allSelected = cartItems.every(item => item.selected);
    setCartItems(items =>
      items.map(item => ({ ...item, selected: !allSelected }))
    );
  };

  const handleCheckout = () => {
    const selectedItems = cartItems.filter(item => item.selected);
    if (selectedItems.length > 0) {
      const itemsJson = JSON.stringify(selectedItems);
      router.push(`/checkout?items=${encodeURIComponent(itemsJson)}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11; // PPN 11%
  const total = subtotal + tax;

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Login Diperlukan
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Silakan login untuk melihat keranjang belanja Anda
          </p>
          <Button onClick={() => router.push('/login')}>
            Login Sekarang
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/products')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Lanjut Belanja</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Keranjang Belanja
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {cartItems.length} item dalam keranjang
              </p>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Keranjang Anda Kosong
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Belum ada produk yang ditambahkan ke keranjang
            </p>
            <Button onClick={() => router.push('/products')}>
              Mulai Belanja
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All */}
              <Card className="p-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cartItems.length > 0 && cartItems.every(item => item.selected)}
                    onChange={selectAllItems}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Pilih Semua ({cartItems.length} item)
                  </span>
                </label>
              </Card>

              {/* Cart Items List */}
              {cartItems.map(item => (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelectItem(item.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-2"
                    />

                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.thumbnail_url || 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        <button
                          onClick={() => router.push(`/products/${item.slug}`)}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {item.name}
                        </button>
                      </h3>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                        {formatCurrency(item.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Kuantitas:</span>
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating[item.id]}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={updating[item.id]}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={updating[item.id]}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm">Hapus</span>
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Ringkasan Pesanan
                </h2>

                {/* Selected Items */}
                <div className="space-y-3 mb-6">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedItems.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">PPN (11%)</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(tax)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className="w-full mt-6"
                      size="lg"
                    >
                      Checkout ({selectedItems.length} item)
                    </Button>
                  </>
                )}

                {selectedItems.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Pilih item untuk melanjutkan checkout
                    </p>
                    <Button
                      disabled
                      className="w-full"
                      size="lg"
                    >
                      Checkout
                    </Button>
                  </div>
                )}

                {/* Security Info */}
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Pembayaran Aman</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Transaksi Anda dilindungi dengan enkripsi SSL
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}