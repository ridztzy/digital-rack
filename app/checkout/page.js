'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; 

// Komponen untuk memuat script Midtrans Snap (TIDAK ADA PERUBAHAN)
const useMidtransSnap = () => {
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    const snapScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    if (document.querySelector(`script[src="${snapScriptUrl}"]`)) {
      setSnapLoaded(true);
      return;
    }
    if (!clientKey) {
      console.error('NEXT_PUBLIC_MIDTRANS_CLIENT_KEY tidak ditemukan');
      return;
    }
    const script = document.createElement('script');
    script.src = snapScriptUrl;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    script.onload = () => setSnapLoaded(true);
    script.onerror = () => console.error('Gagal memuat Midtrans Snap script');
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src="${snapScriptUrl}"]`);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return snapLoaded;
};


export default function CheckoutPage() {
  const snapLoaded = useMidtransSnap();
  const router = useRouter();

  const [orderItems, setOrderItems] = useState([]);
  const [userProfile, setUserProfile] = useState({ id: null, name: '', email: '' });
  const [selectedPayment, setSelectedPayment] = useState('gopay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(''); // State baru untuk notifikasi
  const [initialLoading, setInitialLoading] = useState(true);

  // useEffect untuk memuat dan MEMVALIDASI item
  useEffect(() => {
    const validateAndLoadItems = async () => {
      let itemsFromUrl = [];
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const itemsJson = searchParams.get('items');
        
        if (itemsJson) {
          itemsFromUrl = JSON.parse(decodeURIComponent(itemsJson));
        } else {
          setError("Tidak ada item untuk di-checkout.");
          setInitialLoading(false);
          return;
        }

        if (!Array.isArray(itemsFromUrl) || itemsFromUrl.length === 0) {
          setError("Data item tidak valid atau kosong.");
          setInitialLoading(false);
          return;
        }

        // --- LANGKAH VALIDASI BARU ---
        const productIds = itemsFromUrl.map(item => item.productId);
        const { data: validProducts, error: validationError } = await supabase
          .from('products')
          .select('id, price, name')
          .in('id', productIds);
        
        if (validationError) throw new Error("Gagal memvalidasi produk.");

        const validProductIds = validProducts.map(p => p.id);
        const validatedItems = itemsFromUrl
          .filter(item => validProductIds.includes(item.productId))
          .map(item => {
              const validProduct = validProducts.find(p => p.id === item.productId);
              // Update harga dan nama dengan data terbaru dari database
              return {
                  ...item,
                  price: validProduct.price,
                  name: validProduct.name,
              };
          });

        if (validatedItems.length < itemsFromUrl.length) {
          setNotification("Beberapa produk di keranjang Anda sudah tidak tersedia dan telah dihapus secara otomatis.");
        }
        
        if (validatedItems.length === 0) {
            setError("Semua item di keranjang Anda sudah tidak tersedia.");
        }

        setOrderItems(validatedItems);
        // --- AKHIR LANGKAH VALIDASI ---

      } catch (e) {
        console.error("Gagal memuat atau memvalidasi data checkout:", e);
        setError("Data checkout tidak valid. Silakan kembali ke keranjang.");
      }
    };

    validateAndLoadItems();
  }, []);

  // useEffect untuk memuat profil user (tidak ada perubahan signifikan)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setError("Anda harus login untuk melakukan checkout.");
          return;
        }
        const { data: userData } = await supabase.from('users').select('id, name').eq('id', user.id).single();
        setUserProfile({
          id: user.id,
          name: userData?.name || user.user_metadata?.name || '',
          email: user.email || '',
        });
      } catch (err) {
        setError("Gagal memuat data user.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // Cek dan redirect jika ada order_id dan status_code di URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('order_id') && searchParams.get('status_code')) {
      // Redirect ke halaman status order
      router.replace(`/order-status?order_id=${searchParams.get('order_id')}&status=${searchParams.get('transaction_status')}`);
    }
  }, []);

  // Sisa kode (handlePayment, JSX, dll.) sebagian besar sama
  const totalAmount = orderItems.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);

  const validateForm = () => {
    if (!userProfile.name?.trim()) {
      setError('Nama lengkap harus diisi.');
      return false;
    }
    if (orderItems.length === 0) {
      setError('Tidak ada item untuk dibayar.');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    if (!snapLoaded) {
      setError('Midtrans belum siap. Silakan tunggu sebentar.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const paymentData = {
        orderItems: orderItems.map(item => ({
          productId: item.productId, // Kirim productId yang sudah divalidasi
          name: item.name,
          price: parseFloat(item.price), 
          quantity: parseInt(item.quantity),
        })),
        customerDetails: {
          name: userProfile.name.trim(),
          email: userProfile.email,
        },
        userId: userProfile.id,
      };

      const response = await fetch('/api/midtrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Terjadi kesalahan');
      if (!result.data?.token) throw new Error('Token pembayaran tidak diterima');

      if (window.snap) {
        window.snap.pay(result.data.token, {
          onSuccess: (res) => {
            router.push(`/order-status?order_id=${res.order_id}&status=success`);
          },
          onPending: (res) => {
            router.push(`/order-status?order_id=${res.order_id}&status=pending`);
          },
          onError: (res) => {
            router.push(`/order-status?order_id=${res.order_id}&status=failed`);
          },
          onClose: () => setLoading(false)
        });
      } else {
        throw new Error("Midtrans Snap tidak tersedia.");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  const handleProfileChange = (field, value) => setUserProfile(prev => ({ ...prev, [field]: value }));
  const paymentMethods = [
    { id: 'gopay', name: 'GoPay / E-Wallets', description: 'Bayar dengan GoPay, OVO, DANA, dll' },
    { id: 'bank_transfer', name: 'Transfer Bank (Virtual Account)', description: 'BCA, BNI, BRI, Mandiri, Permata' },
    { id: 'credit_card', name: 'Kartu Kredit / Debit', description: 'Visa, Mastercard, JCB' },
    { id: 'alfamart', name: 'Alfamart / Indomaret', description: 'Bayar di toko retail terdekat' },
  ];

  if (initialLoading) {
    return (
      <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memvalidasi keranjang...</p>
        </div>
      </section>
    );
  }

  // Tampilan JSX...
  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Checkout</h1>
        
        {notification && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">{notification}</p>
            </div>
        )}

        {orderItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-400 mb-4">{error || "Keranjang Anda kosong."}</p>
              <button 
                onClick={() => router.push('/products')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Kembali Belanja
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sisi Kiri: Form & Pembayaran */}
            <div className="w-full lg:w-3/5">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Detail Pembeli</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap *</label>
                    <input type="text" id="name" value={userProfile.name} onChange={(e) => handleProfileChange('name', e.target.value)} className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 text-gray-900 dark:text-white" placeholder="Masukkan nama lengkap" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" id="email" value={userProfile.email || ''} disabled className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 shadow-sm sm:text-sm p-3 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pilih Metode Pembayaran</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label key={method.id} className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${ selectedPayment === method.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700' }`}>
                      <input type="radio" name="payment" value={method.id} checked={selectedPayment === method.id} onChange={(e) => { setSelectedPayment(e.target.value); if (error) setError(''); }} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 mt-1" />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200 block">{method.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{method.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* Sisi Kanan: Ringkasan Pesanan */}
            <div className="w-full lg:w-2/5">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">Ringkasan Pesanan</h2>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{parseInt(item.quantity)} × Rp{parseFloat(item.price).toLocaleString('id-ID')}</p>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">Rp{(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white"><span>Total</span><span>Rp{totalAmount.toLocaleString('id-ID')}</span></div>
                </div>
                {error && (<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4"><p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p></div>)}
                <button onClick={handlePayment} disabled={loading || orderItems.length === 0 || !snapLoaded} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
                  {loading ? (<>...</>) : !snapLoaded ? ('Memuat Midtrans...') : (`Bayar Rp${totalAmount.toLocaleString('id-ID')}`)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
