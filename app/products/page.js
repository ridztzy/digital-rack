// app/components/ProductsSection.js
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleBuyNow = async (product) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Silakan login terlebih dahulu!');
      return;
    }

    // Ambil atau buat cart user
    let { data: cart } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!cart) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select()
        .single();
      cart = newCart;
    }

    // Cek apakah produk sudah ada di cart_items
    const { data: existingItem, error: itemError } = await supabase
      .from('cart_items')
      .select('id, quantity, cart_id, product_id')
      .eq('cart_id', cart.id)
      .eq('product_id', product.id)
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);
    } else {
      // Insert baru
      await supabase
        .from('cart_items')
        .insert({ cart_id: cart.id, product_id: product.id, quantity: 1 });
    }

    alert('Produk ditambahkan ke keranjang!');
  };

  return (
    <section id="products" className="py-20 bg-slate-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Produk Digital Populer</h3>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Temukan produk yang paling sesuai dengan kebutuhan Anda.</p>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Memuat produk...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-all duration-300 group">
                <img
                  src={product.thumbnail_url || 'https://placehold.co/600x400/cccccc/ffffff?text=No+Image'}
                  alt={product.name}
                  className="w-full h-56 object-cover"
                  onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found'; }}
                />
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{product.name}</h4>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{product.description}</p>
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                      Rp {Number(product.price).toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                    >
                      Beli Sekarang
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;