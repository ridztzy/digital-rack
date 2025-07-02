'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, Star, Download, ShoppingCart, Eye } from 'lucide-react';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

// Create a client component that uses useSearchParams
function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [currentPage, selectedCategory, sortBy, searchTerm]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*, categories(name, slug)', { count: 'exact' })
        .eq('status', 'active');

      // Apply filters
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setProducts(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!session) {
      router.push('/login');
      return;
    }

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
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
      } else {
        // Insert new item
        await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: product.id,
            quantity: 1
          });
      }

      // Show success message (you can implement toast here)
      alert('Produk berhasil ditambahkan ke keranjang!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Gagal menambahkan produk ke keranjang');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const ProductCard = ({ product }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={product.thumbnail_url || 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {product.categories && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
              {product.categories.name}
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <button 
              onClick={() => router.push(`/products/${product.slug}`)}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
            >
              <Eye className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <Card.Content className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">4.8</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">(124)</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <Download className="w-4 h-4" />
            <span className="text-sm">2.1k</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(product.price)}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => handleAddToCart(product)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
            </Button>
            <Button
              onClick={() => router.push(`/products/${product.slug}`)}
              size="sm"
            >
              Detail
            </Button>
          </div>
        </div>
      </Card.Content>
    </Card>
  );

  const ProductListItem = ({ product }) => (
    <Card className="flex overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={product.thumbnail_url || 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
        alt={product.name}
        className="w-32 h-32 object-cover"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
        }}
      />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>4.8 (124)</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>2.1k downloads</span>
              </div>
              {product.categories && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {product.categories.name}
                </span>
              )}
            </div>
          </div>
          <div className="text-right ml-6">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              {formatCurrency(product.price)}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleAddToCart(product)}
                variant="outline"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Cart
              </Button>
              <Button
                onClick={() => router.push(`/products/${product.slug}`)}
                size="sm"
              >
                Detail
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Produk Digital
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Temukan produk digital berkualitas untuk mengembangkan bisnis Anda
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="price_low">Harga Terendah</option>
              <option value="price_high">Harga Tertinggi</option>
              <option value="name">Nama A-Z</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Tidak ada produk ditemukan
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Coba ubah filter pencarian Anda
            </p>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Menampilkan {products.length} dari {totalPages * ITEMS_PER_PAGE} produk
              </p>
            </div>

            {/* Products Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {products.map(product => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    variant={currentPage === i + 1 ? 'primary' : 'outline'}
                    size="sm"
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return(
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <ProductsContent />
    </Suspense>
  );
}
