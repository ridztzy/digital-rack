'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Eye, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Hook kustom untuk debounce (menunda eksekusi fungsi)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Komponen helper untuk format
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(date) {
  return date ? new Date(date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
}

// Palet warna untuk setiap status
const statusStyles = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const ITEMS_PER_PAGE = 10;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fungsi utama untuk mengambil data transaksi
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // **PERBAIKAN:** Menggunakan rpc (Remote Procedure Call) untuk query yang lebih kompleks
      // Ini lebih aman dan efisien, terutama jika RLS Anda ketat.
      // Anda perlu membuat fungsi ini di SQL Editor Supabase.
      // Saya akan berikan kodenya di bawah.
      let query = supabase
        .from('transactions')
        .select(`
          *,
          users (
            id, name, avatar_url
          )
        `, { count: 'exact' });

      // 1. Terapkan filter status
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      // 2. Terapkan filter pencarian
      if (debouncedSearchTerm) {
        query = query.or(`transaction_code.ilike.%${debouncedSearchTerm}%,users.name.ilike.%${debouncedSearchTerm}%`);
      }

      // 3. Terapkan paginasi
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      // 4. Urutkan berdasarkan tanggal terbaru
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        // Log error untuk debugging
        console.error("Supabase error:", error);
        throw new Error('Gagal mengambil data. Cek RLS (Row Level Security) Anda.');
      }

      setTransactions(data || []);
      setTotalCount(count || 0);

    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const openDetail = async (trx) => {
    setSelected(trx);
    setItems([]);
    setItemsLoading(true);
    try {
      // Ambil detail transaksi (misal: selectedTransaction)
      const { data: items, error } = await supabase
        .from('transaction_items')
        .select('*, products(name, price)')
        .eq('transaction_id', trx.id); // GUNAKAN transaction_id, BUKAN transactions_id

      console.log("Hasil query transaction_items:", items);
      if (error) {
        console.error("Supabase error:", error);
      }
      setItems(items || []);
    } catch (err) {
      console.error("Gagal memuat item:", err);
    } finally {
      setItemsLoading(false);
    }
  };
  
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Transaksi</h2>

      {/* Panel Kontrol: Search dan Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari kode atau nama user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['all', 'success', 'pending', 'failed'].map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border dark:border-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-4">Kode Transaksi</th>
                <th className="p-4">Pengguna</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4">Metode</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Tanggal</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : error ? (
                 <tr><td colSpan={7} className="p-8 text-center text-red-500">{error}</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Tidak ada transaksi yang cocok.</td></tr>
              ) : (
                transactions.map(trx => (
                  <tr key={trx.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4 font-mono text-sm text-blue-600 dark:text-blue-400">{trx.transaction_code}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={trx.users?.avatar_url || `https://placehold.co/40x40/e2e8f0/64748b?text=${trx.users?.name?.charAt(0) || 'U'}`} alt={trx.users?.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">{trx.users?.name || 'User Dihapus'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-300">{trx.users?.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-500 dark:text-gray-300">{formatCurrency(trx.total_amount)}</td>
                    <td className="p-4 capitalize text-gray-500 dark:text-gray-300">{trx.payment_method?.replace(/_/g, ' ') || '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[trx.status] || 'bg-gray-100 text-gray-700'}`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-300">{formatDate(trx.created_at)}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => openDetail(trx)} className="text-blue-600 hover:underline flex items-center gap-1 mx-auto">
                        <Eye size={16} /> Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
         {/* Kontrol Paginasi */}
        <div className="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">
                Total {totalCount} transaksi
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Halaman {currentPage} dari {totalPages || 1}
                </span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0 || loading}
                    className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
      </div>

      {/* Modal Detail Transaksi */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Detail Transaksi</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
            </div>
            <div className="overflow-y-auto pr-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div><b>Kode:</b> <span className="font-mono text-blue-600 dark:text-blue-400">{selected.transaction_code}</span></div>
                  <div><b>User:</b> {selected.users?.name || '-'}</div>
                  <div><b>Total:</b> {formatCurrency(selected.total_amount)}</div>
                  <div><b>Status:</b> <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${statusStyles[selected.status] || 'bg-gray-100 text-gray-700'}`}>{selected.status}</span></div>
                  <div><b>Metode:</b> <span className="capitalize">{selected.payment_method?.replace(/_/g, ' ') || '-'}</span></div>
                  <div><b>Gateway Ref:</b> <span className="font-mono text-xs break-all">{selected.payment_gateway_ref || '-'}</span></div>
                  <div><b>Dibuat:</b> {formatDate(selected.created_at)}</div>
                  <div><b>Dibayar:</b> {formatDate(selected.paid_at)}</div>
              </div>
              <div className="border-t pt-4 dark:border-gray-700">
                <h4 className="font-bold mb-2 text-gray-800 dark:text-white">Item Produk:</h4>
                {itemsLoading ? <div className="py-4 text-center text-gray-500">Memuat item...</div> :
                 items.length === 0 ? <div className="py-4 text-center text-gray-500">Tidak ada item.</div> : (
                  <table className="w-full text-left text-sm">
                    <thead className="border-b dark:border-gray-700b text-gray-500 dark:text-gray-400"><tr>
                      <th className="p-2">Produk</th>
                      <th className="p-2 text-center">Kuantitas</th>
                      <th className="p-2 text-right">Harga Satuan</th>
                    </tr></thead>
                    <tbody>{items.map(item => (
                      <tr key={item.id} className="border-b dark:border-gray-700 last:border-b-0 text-gray-500 dark:text-gray-400">
                        <td className="p-2">{item.products?.name || 'Produk Dihapus'}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right">{formatCurrency(item.price_at_purchase)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
