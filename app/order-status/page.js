'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Komponen untuk ikon (tidak ada perubahan)
const StatusIcon = ({ status }) => {
  // ... (kode ikon tetap sama)
  if (status === 'success') {
    return (
      <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    );
  }
  if (status === 'pending') {
    return (
      <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    );
  }
  return (
    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  );
};

// Komponen utama
function OrderStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. useEffect untuk mengambil data transaksi awal dan berlangganan perubahan realtime
  useEffect(() => {
    if (!orderId) {
      setError('Order ID tidak ditemukan di URL.');
      setLoading(false);
      return;
    }

    // Fungsi untuk mengambil data transaksi awal
    const fetchInitialTransaction = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('transactions')
          .select(`
            *,
            transaction_items (
              quantity,
              price_at_purchase,
              product:products (
                name,
                file_url
              )
            )
          `)
          .eq('transaction_code', orderId)
          .single();

        if (dbError || !data) {
          throw new Error('Transaksi tidak ditemukan atau terjadi kesalahan database.');
        }
        
        setTransaction(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialTransaction();

    // 2. Setup Supabase Realtime Subscription
    const channel = supabase
      .channel(`transactions:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `transaction_code=eq.${orderId}`,
        },
        (payload) => {
          // Ketika ada update, perbarui state dengan data baru
          setTransaction(prevTransaction => ({ ...prevTransaction, ...payload.new }));
        }
      )
      .subscribe();

    // 3. Cleanup subscription saat komponen dilepas (unmount)
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]); // Hanya dijalankan ulang jika orderId berubah

  // Fungsi untuk mendapatkan informasi berdasarkan status dari state
  const getStatusInfo = () => {
    const status = transaction?.status || 'pending'; // Ambil status dari state, default ke 'pending'
    switch (status) {
      case 'success':
        return {
          title: 'Pembayaran Berhasil!',
          message: 'Terima kasih atas pembayaran Anda. Produk Anda sudah siap untuk diunduh.',
        };
      case 'pending':
        return {
          title: 'Menunggu Pembayaran',
          message: 'Kami masih menunggu konfirmasi pembayaran Anda. Silakan selesaikan pembayaran. Halaman ini akan diperbarui secara otomatis.',
        };
      default: // failed, cancelled, etc.
        return {
          title: 'Pembayaran Gagal',
          message: 'Maaf, pembayaran Anda tidak berhasil atau dibatalkan. Silakan coba lagi.',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const currentStatus = transaction?.status || 'pending';

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Memuat status pesanan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <StatusIcon status={currentStatus} />
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{statusInfo.title}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{statusInfo.message}</p>
      </div>

      {error && !transaction && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {transaction && (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detail Pesanan</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Order ID:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">{transaction.transaction_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total Pembayaran:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">Rp{Number(transaction.total_amount).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Produk yang Dibeli:</h3>
            <ul className="space-y-2">
              {transaction.transaction_items.map((item, index) => (
                <li key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{item.product.name} (x{item.quantity})</span>
                  {currentStatus === 'success' && (
                    <a href={item.product.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">
                      Download
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/products" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Kembali Belanja
        </Link>
      </div>
    </div>
  );
}

// Wrapper dengan Suspense (tidak ada perubahan)
export default function OrderStatusPage() {
  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <Suspense fallback={
        <div className="text-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Memuat halaman...</p>
        </div>
      }>
        <OrderStatusContent />
      </Suspense>
    </section>
  );
}
