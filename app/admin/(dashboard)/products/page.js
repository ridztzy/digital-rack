'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, UploadCloud, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const initialForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  category_id: '',
  thumbnail_url: '',
  file_url: '',
  status: 'active', // Set default value
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef();
  const thumbInputRef = useRef();

  // Auto clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Fetch products with improved error handling
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Fetch products error:', error);
        throw error;
      }
      
      console.log('Fetched products:', data);
      setProducts(data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Gagal memuat produk: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories with improved error handling
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Fetch categories error:', error);
        throw error;
      }
      
      console.log('Fetched categories:', data);
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Gagal memuat kategori: ' + err.message);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Handle form input with validation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Validate numeric inputs
    if (name === 'price' && value && isNaN(parseFloat(value))) {
      return;
    }
    
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'name' && { slug: slugify(value) }),
    }));
  }, []);

  // Open modal for add/edit with better state management
  const openModal = useCallback((product = null) => {
    setError('');
    setSuccess('');
    
    if (product) {
      setForm({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category_id: product.category_id || '',
        thumbnail_url: product.thumbnail_url || '',
        file_url: product.file_url || '',
        status: product.status || 'active',
      });
      setEditId(product.id);
    } else {
      setForm(initialForm);
      setEditId(null);
    }
    setShowModal(true);
  }, []);

  // Upload file with better error handling and progress
  const uploadFile = async (file, folder) => {
    if (!file) return '';
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File terlalu besar. Maksimal 10MB');
    }
    
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw new Error('Gagal upload file: ' + err.message);
    }
  };

  // Form validation
  const validateForm = () => {
    if (!form.name.trim()) {
      throw new Error('Nama produk wajib diisi');
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      throw new Error('Harga harus lebih dari 0');
    }
    if (!form.category_id) {
      throw new Error('Kategori wajib dipilih');
    }
    return true;
  };

  // Save with better error handling and validation
  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      validateForm();

      let thumbnailUrl = form.thumbnail_url;
      let fileUrl = form.file_url;

      // Upload thumbnail if new file
      const thumbFile = thumbInputRef.current?.files?.[0];
      if (thumbFile) {
        console.log('Uploading thumbnail...');
        thumbnailUrl = await uploadFile(thumbFile, 'thumbnails');
        console.log('Thumbnail uploaded:', thumbnailUrl);
      }

      // Upload digital file if new file
      const digitalFile = fileInputRef.current?.files?.[0];
      if (digitalFile) {
        console.log('Uploading digital file...');
        fileUrl = await uploadFile(digitalFile, 'files');
        console.log('Digital file uploaded:', fileUrl);
      }

      // Prepare payload
      const payload = {
        name: form.name.trim(),
        slug: form.slug || slugify(form.name.trim()),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category_id: form.category_id,
        thumbnail_url: thumbnailUrl,
        file_url: fileUrl,
        status: form.status || 'active',
      };

      console.log('Saving payload:', payload);

      let result;
      if (editId) {
        // Update existing product
        result = await supabase
          .from('products')
          .update(payload)
          .eq('id', editId)
          .select(); // Add select() to get updated data back
        
        console.log('Update result:', result);
      } else {
        // Insert new product
        result = await supabase
          .from('products')
          .insert([payload])
          .select(); // Add select() to get inserted data back
        
        console.log('Insert result:', result);
      }

      if (result.error) {
        console.error('Supabase operation error:', result.error);
        throw result.error;
      }

      // Success handling
      setSuccess(editId ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!');
      closeModal();
      
      // Refresh products list
      await fetchProducts();
      
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message || 'Gagal menyimpan produk');
    } finally {
      setUploading(false);
    }
  };

  // Delete with better confirmation
  const handleDelete = async (id) => {
    try {
      setDeletingId(null); // Close modal immediately for better UX
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      setSuccess('Produk berhasil dihapus!');
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Gagal menghapus produk: ' + err.message);
    }
  };

  const getStatusClass = (status) =>
    status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';

  // Close modal with cleanup
  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditId(null);
    setForm(initialForm);
    setError('');
    
    // Clear file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (thumbInputRef.current) thumbInputRef.current.value = '';
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Manajemen Produk</h2>
        <button
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => openModal()}
        >
          <PlusCircle size={20} className="mr-2" />
          Tambah Produk
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
          <CheckCircle size={20} className="mr-2" />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Kategori</th>
                <th className="p-4 font-semibold">Harga</th>
                <th className="p-4 font-semibold">Thumbnail</th>
                <th className="p-4 font-semibold">File</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <PlusCircle size={48} className="mb-2 text-gray-300" />
                      <p>Belum ada produk.</p>
                      <p className="text-sm">Klik "Tambah Produk" untuk memulai.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {product.categories?.name || 'Tanpa Kategori'}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{formatCurrency(product.price)}</td>
                    <td className="p-4">
                      {product.thumbnail_url ? (
                        <img 
                          src={product.thumbnail_url} 
                          alt={`Thumbnail ${product.name}`} 
                          className="w-12 h-12 object-cover rounded-lg shadow-sm"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <ImageIcon size={16} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {product.file_url ? (
                        <a 
                          href={product.file_url} 
                          className="inline-flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium hover:underline" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <UploadCloud size={14} className="mr-1" />
                          Download
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">Tidak ada file</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(product.status)}`}>
                        {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                          onClick={() => openModal(product)}
                          title="Edit produk"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                          onClick={() => setDeletingId(product.id)}
                          title="Hapus produk"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onSubmit={handleSave}
          >
            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
              {editId ? 'Edit Produk' : 'Tambah Produk'}
            </h3>
            
            {/* Error display dalam modal */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nama produk"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Deskripsi produk (opsional)"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Harga *
                </label>
                <input
                  type="number"
                  name="price"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kategori *
                </label>
                <select
                  name="category_id"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Thumbnail
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={thumbInputRef}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                />
                {form.thumbnail_url && (
                  <img 
                    src={form.thumbnail_url} 
                    alt="Preview thumbnail" 
                    className="w-20 h-20 object-cover rounded-lg mt-2 border border-gray-200 dark:border-gray-700" 
                  />
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  File Digital
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                />
                {form.file_url && (
                  <a 
                    href={form.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium mt-2 hover:underline"
                  >
                    <UploadCloud size={14} className="mr-1" />
                    Download File Saat Ini
                  </a>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={closeModal}
                disabled={uploading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                disabled={uploading}
              >
                {uploading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {uploading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2 text-gray-800 dark:text-white">
              Konfirmasi Hapus
            </h3>
            <p className="text-center mb-6 text-gray-600 dark:text-gray-300">
              Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setDeletingId(null)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                onClick={() => handleDelete(deletingId)}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}