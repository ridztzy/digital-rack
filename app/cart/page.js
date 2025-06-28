'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil cart_items + data produk
  useEffect(() => {
    const fetchCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Ambil cart user
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cart) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Ambil cart_items + join products
      const { data: items } = await supabase
        .from('cart_items')
        .select('id, quantity, product:products(id, name, price, thumbnail_url)')
        .eq('cart_id', cart.id);

      setCartItems(
        (items || []).map(item => ({
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          thumbnail_url: item.product.thumbnail_url,
          selected: true,
        }))
      );
      setLoading(false);
    };

    fetchCart();
  }, []);

  // Handler update quantity
  const handleQuantityChange = async (id, qty) => {
    if (qty < 1) return;
    await supabase.from('cart_items').update({ quantity: qty }).eq('id', id);
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: qty } : item
      )
    );
  };

  // Handler hapus item
  const handleRemove = async id => {
    await supabase.from('cart_items').delete().eq('id', id);
    setCartItems(items => items.filter(item => item.id !== id));
  };

  // Handler select
  const toggleSelectItem = id => {
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

  const selectedItems = cartItems.filter(item => item.selected);
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

const router = useRouter();

const handleCheckout = () => {
  if (selectedItems.length > 0) {
    // Mengubah array objek menjadi string JSON untuk dikirim via URL
    const itemsJson = JSON.stringify(selectedItems);
    router.push(`/checkout?items=${encodeURIComponent(itemsJson)}`);
  }
};
  

  return (
    <section className="min-h-screen bg-slate-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Sidebar kiri */}
        <aside className="md:w-1/3 w-full md:sticky md:top-24 h-fit bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ringkasan Belanja</h2>
          <div className="flex flex-col gap-2">
            {selectedItems.map(item => (
              <div key={item.id} className="flex justify-between text-gray-700 dark:text-gray-200">
                <span>{item.name} x{item.quantity}</span>
                <span>Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
          <div className="flex justify-between text-lg font-bold text-blue-600 dark:text-blue-400">
            <span>Total</span>
            <span>Rp {Number(total).toLocaleString('id-ID')}</span>
          </div>
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors sticky bottom-0"
            disabled={selectedItems.length === 0}
            onClick={handleCheckout}
          >
            Checkout ({selectedItems.length})
          </button>
        </aside>

        {/* Konten kanan */}
        <main className="md:w-2/3 w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Keranjang Anda</h2>
            {cartItems.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cartItems.every(item => item.selected)}
                  onChange={selectAllItems}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">Pilih Semua</span>
              </label>
            )}
          </div>

          {loading ? (
            <div className="text-gray-500 dark:text-gray-300 text-center py-12">
              Memuat keranjang...
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-300 text-center py-12">
              Keranjang masih kosong.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow p-4 gap-4"
                >
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelectItem(item.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </label>
                  <img
                    src={item.thumbnail_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}
                    </div>
                    <button
                      className="text-red-500 hover:underline mt-2 text-sm"
                      onClick={() => handleRemove(item.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}