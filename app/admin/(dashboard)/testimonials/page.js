'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, Star, User, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const initialForm = {
  name: '',
  role: '',
  company: '',
  content: '',
  rating: 5,
  avatar_url: '',
  is_featured: false,
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
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

  // Fetch testimonials
  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTestimonials(data || []);
      setError('');
    } catch (err) {
      setError('Gagal memuat testimoni: ' + err.message);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Open modal for add/edit
  const openModal = (testimonial = null) => {
    setError('');
    setSuccess('');
    if (testimonial) {
      setForm({
        name: testimonial.name || '',
        role: testimonial.role || '',
        company: testimonial.company || '',
        content: testimonial.content || '',
        rating: testimonial.rating || 5,
        avatar_url: testimonial.avatar_url || '',
        is_featured: testimonial.is_featured || false,
      });
      setEditId(testimonial.id);
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
    if (!form.name.trim()) throw new Error('Nama wajib diisi');
    if (!form.content.trim()) throw new Error('Konten testimoni wajib diisi');
    if (form.rating < 1 || form.rating > 5) throw new Error('Rating harus antara 1-5');
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
        role: form.role.trim(),
        company: form.company.trim(),
        content: form.content.trim(),
        rating: parseInt(form.rating),
        avatar_url: form.avatar_url.trim(),
        is_featured: form.is_featured,
      };
      let result;
      if (editId) {
        result = await supabase
          .from('testimonials')
          .update(payload)
          .eq('id', editId)
          .select();
      } else {
        result = await supabase
          .from('testimonials')
          .insert([payload])
          .select();
      }
      if (result.error) throw result.error;
      setSuccess(editId ? 'Testimoni berhasil diperbarui!' : 'Testimoni berhasil ditambahkan!');
      closeModal();
      await fetchTestimonials();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan testimoni');
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      setDeletingId(null);
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setSuccess('Testimoni berhasil dihapus!');
      await fetchTestimonials();
    } catch (err) {
      setError('Gagal menghapus testimoni: ' + err.message);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Testimoni</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola testimoni dan ulasan pelanggan</p>
        </div>
        <button
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => openModal()}
        >
          <PlusCircle size={20} className="mr-2" />
          Tambah Testimoni
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
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Pelanggan</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Rating</th>
                <th className="p-4 font-semibold text-gray-900 dark:text-white">Testimoni</th>
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
              ) : testimonials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <Star size={48} className="mb-2 text-gray-300" />
                      <p>Belum ada testimoni.</p>
                      <p className="text-sm">Klik Tambah Testimoni untuk memulai.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                testimonials.map(testimonial => (
                  <tr key={testimonial.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                          {testimonial.avatar_url ? (
                            <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {testimonial.role} {testimonial.company && `• ${testimonial.company}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        {renderStars(testimonial.rating)}
                        <span className="ml-2 text-sm font-medium">{testimonial.rating}/5</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        <p className="text-sm line-clamp-2">{testimonial.content}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        testimonial.is_featured 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {testimonial.is_featured ? 'Unggulan' : 'Biasa'}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{testimonial.created_at ? new Date(testimonial.created_at).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                          onClick={() => openModal(testimonial)}
                          title="Edit testimoni"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                          onClick={() => setDeletingId(testimonial.id)}
                          title="Hapus testimoni"
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
              {editId ? 'Edit Testimoni' : 'Tambah Testimoni'}
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
                  Nama Pelanggan *
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Nama lengkap pelanggan"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Jabatan/Profesi
                </label>
                <input
                  type="text"
                  name="role"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="CEO, Designer, dll"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Perusahaan
                </label>
                <input
                  type="text"
                  name="company"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Nama perusahaan"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rating *
                </label>
                <select
                  name="rating"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.rating}
                  onChange={handleChange}
                  required
                >
                  {[5, 4, 3, 2, 1].map(rating => (
                    <option key={rating} value={rating}>{rating} Bintang</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                URL Avatar
              </label>
              <input
                type="url"
                name="avatar_url"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.avatar_url}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Testimoni *
              </label>
              <textarea
                name="content"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.content}
                onChange={handleChange}
                rows={4}
                required
                placeholder="Tulis testimoni pelanggan di sini..."
              />
            </div>
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  checked={form.is_featured}
                  onChange={handleChange}
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Jadikan testimoni unggulan
                </span>
              </label>
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
              Yakin ingin menghapus testimoni ini? Tindakan ini tidak dapat dibatalkan.
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