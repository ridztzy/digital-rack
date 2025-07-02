'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { CreditCard, Smartphone, Building, Store, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

// Hook untuk memuat Midtrans Snap
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
  const searchParams = useSearchParams();
  const { session, user } = useAuth();

  const [orderItems, setOrderItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [selectedPayment, setSelectedPayment] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    const validateAndLoadItems = async () => {
      try {
        const itemsJson = searchParams.get('items');
        if (!itemsJson) {
          setError("Tidak ada item untuk di-checkout.");
          setInitialLoading(false);
          return;
        }

        const itemsFromUrl = JSON.parse(decodeURIComponent(itemsJson));
        if (!Array.isArray(itemsFromUrl) || itemsFromUrl.length === 0) {
          setError("Data item tidak valid atau kosong.");
          setInitialLoading(false);
          return;
        }

        // Validasi produk dengan database
        const productIds = itemsFromUrl.map(item => item.productId);
        const { data: validProducts, error: validationError } = await supabase
          .from('products')
          .select('id, price, name')
          .in('id', productIds)
          .eq('status', 'active');
        
        if (validationError) throw new Error("Gagal memvalidasi produk.");

        const validProductIds = validProducts.map(p => p.id);
        const validatedItems = itemsFromUrl
          .filter(item => validProductIds.includes(item.productId))
          .map(item => {
            const validProduct = validProducts.find(p => p.id === item.productId);
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
      } catch (e) {
        console.error("Gagal memuat atau memvalidasi data checkout:", e);
        setError("Data checkout tidak valid. Silakan kembali ke keranjang.");
      } finally {
        setInitialLoading(false);
      }
    };

    validateAndLoadItems();
  }, [session, searchParams, router]);

  useEffect(() => {
    if (user) {
      setCustomerInfo({
        name: user.name || '',
        email: session?.user?.email || '',
        phone: user.phone || ''
      });
    }
  }, [user, session]);

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Kartu Kredit / Debit',
      description: 'Visa, Mastercard, JCB',
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      id: 'gopay',
      name: 'GoPay / E-Wallets',
      description: 'GoPay, OVO, DANA, ShopeePay',
      icon: Smartphone,
      color: 'text-green-600'
    },
    {
      id: 'bank_transfer',
      name: 'Transfer Bank (Virtual Account)',
      description: 'BCA, BNI, BRI, Mandiri, Permata',
      icon: Building,
      color: 'text-purple-600'
    },
    {
      id: 'alfamart',
      name: 'Alfamart / Indomaret',
      description: 'Bayar di toko retail terdekat',
      icon: Store,
      color: 'text-orange-600'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
  const tax = subtotal * 0.11; // PPN 11%
  const totalAmount = subtotal + tax;

  const validateForm = () => {
    if (!customerInfo.name?.trim()) {
      setError('Nama lengkap harus diisi.');
      return false;
    }
    if (!customerInfo.phone?.trim()) {
      setError('Nomor telepon harus diisi.');
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
          productId: item.productId,
          name: item.name,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
        })),
        customerDetails: {
          name: customerInfo.name.trim(),
          email: customerInfo.email,
          phone: customerInfo.phone.trim(),
        },
        userId: session.user.id,
      };

      const response = await fetch('/api/midtrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Terjadi kesalahan');
      }
      
      if (!result.data?.token) {
        throw new Error('Token pembayaran tidak diterima');
      }

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

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Login Diperlukan
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Silakan login untuk melanjutkan checkout
          </p>
          <Button onClick={() => router.push('/login')}>
            Login Sekarang
          </Button>
        </Card>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memvalidasi keranjang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/cart')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Keranjang</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
        </div>

        {/* Notification */}
        {notification && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">{notification}</p>
          </div>
        )}

        {orderItems.length === 0 ? (
          <div className="text-center py-12">
            <Card className="p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Keranjang Kosong
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {error || "Tidak ada item untuk di-checkout."}
              </p>
              <Button onClick={() => router.push('/products')}>
                Kembali Belanja
              </Button>
            </Card>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Informasi Pembeli
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nomor Telepon *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Contoh: 08123456789"
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Metode Pembayaran
                </h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPayment === method.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`p-2 rounded-lg mr-4 ${method.color} bg-gray-100 dark:bg-gray-800`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {method.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {method.description}
                          </div>
                        </div>
                        {selectedPayment === method.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Ringkasan Pesanan
                </h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1 mr-4">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {parseInt(item.quantity)} × {formatCurrency(parseFloat(item.price))}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat(item.price) * parseInt(item.quantity))}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
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
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* Checkout Button */}
                <Button
                  onClick={handlePayment}
                  loading={loading}
                  disabled={orderItems.length === 0 || !snapLoaded}
                  className="w-full mt-6"
                  size="lg"
                >
                  {loading ? 'Memproses...' : !snapLoaded ? 'Memuat Midtrans...' : `Bayar ${formatCurrency(totalAmount)}`}
                </Button>

                {/* Security Info */}
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-medium">Pembayaran Aman</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Transaksi Anda dilindungi dengan enkripsi SSL dan gateway pembayaran terpercaya
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