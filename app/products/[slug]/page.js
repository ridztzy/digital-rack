'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Minus, Plus, Star, Download, Share2, Heart, ShoppingCart, Eye, Users, Award } from 'lucide-react';
import Link from 'next/link';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { session } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (fetchError) throw fetchError;
      
      if (data) {
        setProduct(data);
        fetchRelatedProducts(data.category_id, data.id);
      } else {
        setError('Produk tidak ditemukan');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Gagal memuat detail produk');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId, currentProductId) => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .neq('id', currentProductId)
        .limit(4);
      
      setRelatedProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setIsAddingToCart(true);
    try {
      // Get or create cart
      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!cart) {
        const { data: newCart, error: cartError } = await supabase
          .from('carts')
          .insert({ user_id: session.user.id })
          .select('id')
          .single();
        
        if (cartError) throw cartError;
        cart = newCart;
      }

      // Check if item already exists
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
      } else {
        // Insert new item
        await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: product.id,
            quantity: quantity
          });
      }

      alert('Produk berhasil ditambahkan ke keranjang!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Gagal menambahkan produk ke keranjang');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat detail produk...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Produk tidak ditemukan'}
          </h2>
          <Button onClick={() => router.push('/products')}>
            Kembali ke Produk
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm">
            <Link href="/" className="text-blue-600 hover:underline">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/products" className="text-blue-600 hover:underline">Produk</Link>
            {product.categories && (
              <>
                <span className="mx-2 text-gray-400">/</span>
                <Link href={`/products?category=${product.categories.slug}`} className="text-blue-600 hover:underline">
                  {product.categories.name}
                </Link>
              </>
            )}
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-300">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-lg">
              <img
                src={product.thumbnail_url || 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>
            
            {/* Product Gallery - Placeholder for multiple images */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img
                    src={product.thumbnail_url || 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}
                    alt={`${product.name} ${i}`}
                    className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            {product.categories && (
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {product.categories.name}
                </span>
              </div>
            )}

            {/* Product Title */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>
              
              {/* Rating and Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="font-medium">4.8</span>
                  <span>(124 ulasan)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>2.1k downloads</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>5.2k views</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {formatCurrency(product.price * 1.3)}
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                  23% OFF
                </span>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kuantitas:
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-0 focus:ring-0 bg-transparent"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="flex-1"
                >
                  Beli Sekarang
                </Button>
                <Button
                  onClick={handleAddToCart}
                  loading={isAddingToCart}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Tambah ke Keranjang
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="flex space-x-4">
                <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  <Heart className="w-5 h-5" />
                  <span>Simpan ke Wishlist</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  <Share2 className="w-5 h-5" />
                  <span>Bagikan</span>
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Yang Anda Dapatkan:</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Download instan setelah pembayaran</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Lisensi komersial penuh</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Support 24/7 dari tim kami</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-12">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Deskripsi' },
                { id: 'specifications', label: 'Spesifikasi' },
                { id: 'reviews', label: 'Ulasan (124)' },
                { id: 'faq', label: 'FAQ' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Fitur Utama:</h4>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>• Template responsif dan modern</li>
                      <li>• Mudah dikustomisasi</li>
                      <li>• Dokumentasi lengkap</li>
                      <li>• Support browser terbaru</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Cocok Untuk:</h4>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>• Freelancer dan agency</li>
                      <li>• Startup dan UKM</li>
                      <li>• Developer pemula hingga expert</li>
                      <li>• Proyek personal dan komersial</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Detail Teknis</h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-300">Format File:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">HTML, CSS, JS</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-300">Ukuran File:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">2.5 MB</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-300">Versi:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">1.2.0</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-300">Update Terakhir:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">15 Des 2024</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Kompatibilitas</h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-300">Browser:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">Chrome, Firefox, Safari, Edge</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-300">Framework:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">Bootstrap 5, Tailwind CSS</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-300">Responsive:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">Ya</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">4.8</div>
                    <div className="flex items-center justify-center mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">124 ulasan</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-300 w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 w-8">
                          {rating === 5 ? 87 : rating === 4 ? 25 : rating === 3 ? 6 : rating === 2 ? 4 : 2}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-6">
                  {[
                    {
                      name: "Ahmad Rizki",
                      rating: 5,
                      date: "2 hari yang lalu",
                      comment: "Template yang sangat bagus dan mudah dikustomisasi. Dokumentasinya juga lengkap. Sangat recommended!"
                    },
                    {
                      name: "Sari Dewi",
                      rating: 5,
                      date: "1 minggu yang lalu", 
                      comment: "Kualitas premium dengan harga yang sangat terjangkau. Customer support juga sangat responsif."
                    },
                    {
                      name: "Budi Santoso",
                      rating: 4,
                      date: "2 minggu yang lalu",
                      comment: "Overall bagus, tapi ada beberapa minor bug yang perlu diperbaiki. Tapi secara keseluruhan worth it."
                    }
                  ].map((review, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {review.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">{review.name}</span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{review.date}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                {[
                  {
                    question: "Apakah produk ini include source code?",
                    answer: "Ya, Anda akan mendapatkan source code lengkap beserta dokumentasinya."
                  },
                  {
                    question: "Bisakah digunakan untuk proyek komersial?",
                    answer: "Tentu saja! Produk ini dilengkapi dengan lisensi komersial penuh."
                  },
                  {
                    question: "Apakah ada support jika mengalami masalah?",
                    answer: "Ya, kami menyediakan support 24/7 melalui email dan live chat."
                  },
                  {
                    question: "Bagaimana cara download setelah pembelian?",
                    answer: "Setelah pembayaran berhasil, link download akan dikirim ke email Anda dan tersedia di dashboard."
                  }
                ].map((faq, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{faq.question}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Produk Terkait</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative overflow-hidden">
                    <img
                      src={relatedProduct.thumbnail_url || 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <Card.Content className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(relatedProduct.price)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/products/${relatedProduct.slug}`)}
                      >
                        Lihat
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}