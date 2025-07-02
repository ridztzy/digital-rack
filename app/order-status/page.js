'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle, Clock, XCircle, Download, ArrowLeft, Package } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />;
    case 'pending':
      return <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />;
    case 'failed':
      return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
    default:
      return <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />;
  }
};

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('Order ID tidak ditemukan di URL.');
      setLoading(false);
      return;
    }

    const fetchInitialTransaction = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('transactions')
          .select(`
            *,
            transaction_items (
              quantity,
              price_at_purchase,
              products (
                name,
                file_url,
                thumbnail_url
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

    // Setup Supabase Realtime Subscription
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
          setTransaction(prevTransaction => ({ ...prevTransaction, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const getStatusInfo = () => {
    const status = transaction?.status || 'pending';
    switch (status) {
      case 'success':
        return {
          title: 'Pembayaran Berhasil!',
          message: 'Terima kasih atas pembayaran Anda. Produk digital Anda sudah siap untuk diunduh.',
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case 'pending':
        return {
          title: 'Menunggu Pembayaran',
          message: 'Kami masih menunggu konfirmasi pembayaran Anda. Silakan selesaikan pembayaran. Halaman ini akan diperbarui secara otomatis.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        };
      default:
        return {
          title: 'Pembayaran Gagal',
          message: 'Maaf, pembayaran Anda tidak berhasil atau dibatalkan. Silakan coba lagi atau hubungi customer service.',
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Memuat status pesanan...</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const currentStatus = transaction?.status || 'pending';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/products')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali Belanja</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Status Pesanan</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Status Card */}
          <Card className={`p-8 text-center mb-8 border-2 ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
            <StatusIcon status={currentStatus} />
            <h2 className={`text-2xl font-bold mb-2 ${statusInfo.color}`}>
              {statusInfo.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {statusInfo.message}
            </p>

            {/* Auto-refresh indicator for pending status */}
            {currentStatus === 'pending' && (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                <span>Memantau status pembayaran...</span>
              </div>
            )}
          </Card>

          {/* Error Message */}
          {error && !transaction && (
            <Card className="p-6 mb-8">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Terjadi Kesalahan
                </h3>
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <Button onClick={() => router.push('/products')}>
                  Kembali ke Produk
                </Button>
              </div>
            </Card>
          )}

          {/* Transaction Details */}
          {transaction && (
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detail Pesanan
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Order ID:</span>
                  <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.transaction_code}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Pembayaran:</span>
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(transaction.total_amount)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Metode Pembayaran:</span>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {transaction.payment_method?.replace(/_/g, ' ') || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tanggal Pesanan:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
                {transaction.paid_at && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Tanggal Pembayaran:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(transaction.paid_at)}
                    </p>
                  </div>
                )}
              </div>

              {/* Products List */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Produk yang Dibeli:
                </h4>
                <div className="space-y-4">
                  {transaction.transaction_items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <img
                        src={item.products?.thumbnail_url || 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                        alt={item.products?.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80';
                        }}
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {item.products?.name || 'Produk Dihapus'}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity} × {formatCurrency(item.price_at_purchase)}
                        </p>
                      </div>
                      {currentStatus === 'success' && item.products?.file_url && (
                        <Button
                          onClick={() => window.open(item.products.file_url, '_blank')}
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/products')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>Lihat Produk Lainnya</span>
            </Button>
            
            <Button
              onClick={() => router.push('/transactions')}
              className="flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>Riwayat Transaksi</span>
            </Button>
          </div>

          {/* Help Section */}
          <Card className="p-6 mt-8 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Butuh Bantuan?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Jika Anda mengalami masalah dengan pesanan ini, jangan ragu untuk menghubungi tim support kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => window.open('mailto:support@digiridz.com', '_blank')}
              >
                Email Support
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
              >
                WhatsApp
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat halaman...</p>
        </div>
      </div>
    }>
      <OrderStatusContent />
    </Suspense>
  );
}