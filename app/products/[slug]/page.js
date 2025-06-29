'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Minus, Plus } from 'lucide-react'; // Pastikan sudah install lucide-react
import Link from 'next/link';

// --- Komponen Tambahan (Idealnya dipisah ke file sendiri) ---

// Komponen Tombol Reusable dengan Loading State
function Button({ onClick, isLoading, children, className, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`font-semibold px-6 py-2 rounded-lg transition-colors duration-200 ${className} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Memproses...
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// --- Komponen Utama Halaman Detail Produk ---

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  
  // State untuk data produk dan UI
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  
  // State untuk interaksi pengguna
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    // Fungsi untuk mengambil data produk dari Supabase
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError('');
        // Query dengan join untuk mengambil data kategori sekaligus
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*, categories(name, slug)') // Ambil juga nama dan slug dari tabel kategori
          .eq('slug', slug)
          .single();

        if (fetchError) {
          throw fetchError;
        }
        
        if (data) {
          setProduct(data);
        } else {
          setError('Produk yang Anda cari tidak dapat ditemukan.');
        }

      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Gagal memuat detail produk. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('Silakan login terlebih dahulu untuk menambahkan item.', 'error');
        router.push('/login');
        return;
      }

      // 1. Dapatkan atau buat keranjang untuk user
      let { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
      if (!cart) {
        const { data: newCart, error: newCartError } = await supabase.from('carts').insert({ user_id: user.id }).select('id').single();
        if (newCartError) throw newCartError;
        cart = newCart;
      }
      if (!cart) throw new Error("Tidak dapat membuat atau menemukan keranjang.");


      // 2. Cek apakah item sudah ada di keranjang
      const { data: existingItem, error: existingItemError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', product.id)
        .maybeSingle();
      if (existingItemError) throw existingItemError;

      // 3. Update atau insert item baru
      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity }) // Tambahkan kuantitas yang dipilih
          .eq('id', existingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ cart_id: cart.id, product_id: product.id, quantity: quantity });
        if (error) throw error;
      }

      showToast('Produk berhasil ditambahkan ke keranjang!', 'success');

    } catch (err) {
      console.error('Error adding to cart:', err);
      showToast('Gagal menambahkan produk ke keranjang.', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleOrderNow = async () => {
    setIsOrdering(true);
    await handleAddToCart(); // Reuse aAaddToCart logic
    router.push('/cart');
    // setIsOrdering akan di-set false jika pengguna kembali ke halaman ini
  };
  
  // Tampilan state Loading
  if (loading) return <div className="text-center py-20">Memuat detail produk...</div>;
  
  // Tampilan state Error
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  // Tampilan jika produk tidak ada setelah loading selesai
  if (!product) return <div className="text-center py-20 text-red-500">Produk tidak ditemukan.</div>;

  return (
    <div className="container mx-auto max-w-4xl py-10 px-6">
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in
          ${toast.type === 'success' ? 'bg-blue-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Kolom Gambar Produk */}
        <div>
          <img 
            src={product.thumbnail_url || 'https://placehold.co/600x400/e2e8f0/adb5bd?text=Gambar+Produk'} 
            alt={product.name} 
            className="w-full h-auto object-cover rounded-lg shadow-md aspect-square" 
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/e2e8f0/adb5bd?text=Gambar+Error'}}
          />
          {/* Tambahan: Galeri gambar kecil bisa diletakkan di sini */}
        </div>

        {/* Kolom Detail & Aksi */}
        <div className="flex flex-col">
          {/* Breadcrumbs / Kategori */}
          {product.categories && (
            <p className="text-sm text-gray-500 mb-2">
              <Link href="/" className="hover:underline">Home</Link> / 
              <Link href={`/category/${product.categories.slug}`} className="hover:underline"> {product.categories.name}</Link>
            </p>
          )}

          <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-gray-900 dark:text-white">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-5">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-500">
              Rp {Number(product.price).toLocaleString('id-ID')}
            </span>
          </div>

          <p className="mb-6 text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
          
          {/* Input Kuantitas */}
          <div className="flex items-center gap-3 mb-6">
            <label htmlFor="quantity" className="font-semibold text-gray-600 dark:text-gray-300">Kuantitas:</label>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
              <button
                type="button"
                className="p-1.5 text-gray-500 hover:text-blue-600 transition cursor-pointer"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                aria-label="Kurangi"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-10 text-center bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-gray-900 dark:text-white no-spinner"
                style={{
                  MozAppearance: 'textfield',
                }}
              />
              <button
                type="button"
                className="p-1.5 text-gray-500 hover:text-blue-600 transition cursor-pointer"
                onClick={() => setQuantity(q => q + 1)}
                aria-label="Tambah"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-4">
            <Button
              onClick={handleAddToCart}
              isLoading={isAddingToCart}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-pointer"
            >
              Masukkan ke Keranjang
            </Button>
            <Button
              onClick={handleOrderNow}
              isLoading={isOrdering}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              Pesan Sekarang
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
