'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const initialForm = {
  name: '',
  slug: '',
  description: '',
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
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

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCategories(data || []);
      setError('');
    } catch (err) {
      setError('Gagal memuat kategori: ' + err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'name' && { slug: slugify(value) }),
    }));
  };

  // Open modal for add/edit
  const openModal = (cat = null) => {
    setError('');
    setSuccess('');
    if (cat) {
      setForm({
        name: cat.name || '',
        slug: cat.slug || '',
        description: cat.description || '',
      });
      setEditId(cat.id);
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
    if (!form.name.trim()) throw new Error('Nama kategori wajib diisi');
    if (!form.slug.trim()) throw new Error('Slug wajib diisi');
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
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
      };
      let result;
      if (editId) {
        result = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editId)
          .select();
      } else {
        result = await supabase
          .from('categories')
          .insert([payload])
          .select();
      }
      if (result.error) throw result.error;
      setSuccess(editId ? 'Kategori berhasil diperbarui!' : 'Kategori berhasil ditambahkan!');
      closeModal();
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan kategori');
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      setDeletingId(null);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setSuccess('Kategori berhasil dihapus!');
      await fetchCategories();
    } catch (err) {
      setError('Gagal menghapus kategori: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Manajemen Kategori</h2>
        <button
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => openModal()}
        >
          <PlusCircle size={20} className="mr-2" />
          Tambah Kategori
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
                <th className="p-4 font-semibold">Slug</th>
                <th className="p-4 font-semibold">Deskripsi</th>
                <th className="p-4 font-semibold">Dibuat</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <PlusCircle size={48} className="mb-2 text-gray-300" />
                      <p>Belum ada kategori.</p>
                      <p className="text-sm">Klik Tambah Kategori untuk memulai.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 font-semibold">{cat.name}</td>
                    <td className="p-4">{cat.slug}</td>
                    <td className="p-4">{cat.description || '-'}</td>
                    <td className="p-4">{cat.created_at ? new Date(cat.created_at).toLocaleString() : '-'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                          onClick={() => openModal(cat)}
                          title="Edit kategori"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                          onClick={() => setDeletingId(cat.id)}
                          title="Hapus kategori"
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
              {editId ? 'Edit Kategori' : 'Tambah Kategori'}
            </h3>
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nama kategori"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.slug}
                  onChange={handleChange}
                  required
                  placeholder="Slug kategori"
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
                  placeholder="Deskripsi kategori (opsional)"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={closeModal}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
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
            <h3 className="text-lg font-semibold text-center mb-2 text-gray-800 dark:text-white">
              Konfirmasi Hapus
            </h3>
            <p className="text-center mb-6 text-gray-600 dark:text-gray-300">
              Yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.
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