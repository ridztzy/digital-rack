'use client';

import { useEffect, useState } from 'react';
import { Search, Calendar, Filter, Eye, Download, CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';


export default function EnhancedUserTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedTrx, setSelectedTrx] = useState(null);

  // Ambil data transaksi dari Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError('');
      try {
        // Ambil user yang sedang login
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Anda harus login untuk melihat riwayat transaksi.');
          setLoading(false);
          return;
        }
        // Ambil transaksi milik user
        const { data, error } = await supabase
          .from('transactions')
          .select('*, transaction_items(*, products(name, file_url))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (err) {
        setError('Gagal memuat riwayat transaksi.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(trx => 
        trx.transaction_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(trx => trx.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(trx => new Date(trx.created_at) >= filterDate);
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, statusFilter, dateFilter, transactions]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400`;
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalAmount = filteredTransactions
    .filter(trx => trx.status === 'completed')
    .reduce((sum, trx) => sum + trx.total_amount, 0);

  const completedCount = filteredTransactions.filter(trx => trx.status === 'completed').length;
  const pendingCount = filteredTransactions.filter(trx => trx.status === 'pending').length;

  function mapStatus(status) {
    if (status === 'success') return 'completed';
    if (status === 'failed') return 'failed';
    if (status === 'pending') return 'pending';
    return status;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Riwayat Transaksi
          </h1>     
        </div>


        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari kode transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="all">Semua Status</option>
                <option value="completed">Berhasil</option>
                <option value="pending">Menunggu</option>
                <option value="failed">Gagal</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="all">Semua Periode</option>
                <option value="7days">7 Hari Terakhir</option>
                <option value="30days">30 Hari Terakhir</option>
                <option value="90days">90 Hari Terakhir</option>
              </select>
              <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Export Button */}
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Memuat transaksi...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Tidak ada transaksi ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Kode Transaksi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pembayaran
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {trx.transaction_code}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {trx.transaction_items.length} item{trx.transaction_items.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(trx.total_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(mapStatus(trx.status))}>
                          {getStatusIcon(mapStatus(trx.status))}
                          {mapStatus(trx.status) === 'completed' ? 'Berhasil' : 
                           mapStatus(trx.status) === 'pending' ? 'Menunggu' : 'Gagal'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {trx.payment_method}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(trx.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedTrx(trx)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction Detail Modal */}
        {selectedTrx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col relative text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 overflow-y-auto">
              <button
                onClick={() => setSelectedTrx(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                aria-label="Tutup"
              >
                <XCircle size={24} />
              </button>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Detail Transaksi</h3>
              <div className="mb-4 space-y-2">
                <div><b>Kode:</b> <span className="font-mono text-blue-600 dark:text-blue-400">{selectedTrx.transaction_code}</span></div>
                <div>
                  <b>Status:</b> <span className={getStatusBadge(mapStatus(selectedTrx.status)) + " ml-1"}>{getStatusIcon(mapStatus(selectedTrx.status))}{mapStatus(selectedTrx.status) === 'completed' ? 'Berhasil' : mapStatus[selectedTrx.status] === 'pending' ? 'Menunggu' : 'Gagal'}</span>
                </div>
                <div><b>Total:</b> {formatCurrency(selectedTrx.total_amount)}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Produk:</h4>
                <ul className="space-y-4">
                  {selectedTrx.transaction_items.map(item => (
                    <li key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                      <div className="font-medium text-gray-800 dark:text-gray-100">{item.products?.name || 'Produk Dihapus'}</div>
                      {/* Download hanya jika status sukses dan file_url ada */}
                      {(mapStatus(selectedTrx.status) === 'completed' || mapStatus(selectedTrx.status) === 'success') && item.products?.file_url && (
                        <a
                          href={item.products.file_url}
                          download
                          className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4" />
                          Download File
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}