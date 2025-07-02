'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, Image as ImageIcon, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const initialForm = {
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  button_text: '',
  button_url: '',
  is_active: true,
  order_index: 0,
};

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // Fetch banners
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      setBanners(data || []);
      setError('');
    } catch (err) {
      setError('Gagal memuat banner: ' + err.message);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Open modal for add/edit
  const openModal = (banner = null) => {
    setError('');
    setSuccess('');
    if (banner) {
      setForm({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        image_url: banner.image_url || '',
        button_text: banner.button_text || '',
        button_url: banner.button_url || '',
        is_active: banner.is_active ?? true,
        order_index: banner.order_index || 0,
      });
      setEditId(banner.id);
    } else {
      setForm(initialForm);
      setEditId(null);
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(initialForm);
    setError('');
  };

  // Form validation
  const validateForm = () => {
    if (!form.title.trim()) throw new Error('Judul banner wajib diisi');
    if (!form.image_url.trim()) throw new Error('URL gambar wajib diisi');
    return true;
  };

  // Save (add/edit)
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      validateForm();
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim(),
        button_text: form.button_text.trim(),
        button_url: form.button_url.trim(),
        is_active: form.is_active,
        order_index: parseInt(form.order_index) || 0,
      };
      let result;
      if (editId) {
        result = await supabase
          .from('banners')
          .update(payload)
          .eq('id', editId)
          .select();
      } else {
        result = await supabase
          .from('banners')
          .insert([payload])
          .select();
      }
      if (result.error) throw result.error;
      setSuccess(editId ? 'Banner berhasil diperbarui!' : 'Banner berhasil ditambahkan!');
      closeModal();
      await fetchBanners();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan banner');
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      setDeletingId(null);
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setSuccess('Banner berhasil dihapus!');
      await fetchBanners();
    } catch (err) {
      setError('Gagal menghapus banner: ' + err.message);
    }
  };

  // Toggle active status
  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      setSuccess('Status banner berhasil diubah!');
      await fetchBanners();
    } catch (err) {
      setError('Gagal mengubah status banner: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Banner</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola banner dan hero section website</p>
        </div>
        <button
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => openModal()}
        >
          <PlusCircle size={20} className="mr-2" />
          Tambah Banner
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle size={20} className="mr-2" />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Preview</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Judul</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Urutan</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Dibuat</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <ImageIcon size={48} className="mb-2 text-gray-300" />
                      <p>Belum ada banner.</p>
                      <p className="text-sm">Klik Tambah Banner untuk memulai.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                banners.map(banner => (
                  <tr key={banner.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4">
                      <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {banner.image_url ? (
                          <img 
                            src={banner.image_url} 
                            alt={banner.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center" style={{ display: banner.image_url ? 'none' : 'flex' }}>
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{banner.title}</div>
                        {banner.subtitle && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{banner.subtitle}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-medium">
                        {banner.order_index}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(banner.id, banner.is_active)}
                        className={`flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          banner.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {banner.is_active ? <Eye size={12} className="mr-1" /> : <EyeOff size={12} className="mr-1" />}
                        {banner.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="p-4 text-sm">{banner.created_at ? new Date(banner.created_at).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                          onClick={() => openModal(banner)}
                          title="Edit banner"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                          onClick={() => setDeletingId(banner.id)}
                          title="Hapus banner"
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onSubmit={handleSave}
          >
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              {editId ? 'Edit Banner' : 'Tambah Banner'}
            </h3>
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Judul Banner *
                </label>
                <input
                  type="text"
                  name="title"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Judul utama banner"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subtitle
                </label>
                <input
                  type="text"
                  name="subtitle"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.subtitle}
                  onChange={handleChange}
                  placeholder="Subtitle banner"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Deskripsi
              </label>
              <textarea
                name="description"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Deskripsi banner (opsional)"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                URL Gambar *
              </label>
              <input
                type="url"
                name="image_url"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.image_url}
                onChange={handleChange}
                required
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teks Tombol
                </label>
                <input
                  type="text"
                  name="button_text"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.button_text}
                  onChange={handleChange}
                  placeholder="Lihat Produk"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL Tombol
                </label>
                <input
                  type="url"
                  name="button_url"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.button_url}
                  onChange={handleChange}
                  placeholder="/products"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Urutan Tampil
                </label>
                <input
                  type="number"
                  name="order_index"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.order_index}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={form.is_active}
                    onChange={handleChange}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Banner aktif
                  </span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={closeModal}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center"
              >
                Simpan
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
            <h3 className="text-lg font-semibold text-center mb-2 text-gray-900 dark:text-white">
              Konfirmasi Hapus
            </h3>
            <p className="text-center mb-6 text-gray-600 dark:text-gray-300">
              Yakin ingin menghapus banner ini? Tindakan ini tidak dapat dibatalkan.
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