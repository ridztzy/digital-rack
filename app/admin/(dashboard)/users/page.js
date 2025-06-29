'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Eye, X, Edit, Trash2, Plus, UserPlus, Mail, Shield, User } from 'lucide-react';

function formatDate(date) {
  return date ? new Date(date).toLocaleString('id-ID') : '-';
}

const roleColor = {
  admin: 'bg-blue-100 text-blue-800',
  user: 'bg-green-100 text-green-800',
  moderator: 'bg-purple-100 text-purple-800',
};

const authProviders = {
  google: { name: 'Google', icon: '🔍', color: 'bg-red-100 text-red-700' },
  email: { name: 'Email', icon: '📧', color: 'bg-gray-100 text-gray-700' },
  github: { name: 'GitHub', icon: '🐙', color: 'bg-gray-800 text-white' },
  facebook: { name: 'Facebook', icon: '📘', color: 'bg-blue-100 text-blue-700' },
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    avatar_url: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_users_with_auth', {});
      
      if (rpcError) {
        console.error('RPC error:', rpcError);
        setError(rpcError.message);
        return;
      }
      
      console.log('Fetched users:', rpcData);
      setUsers(rpcData || []);

    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: 'temp123456', // Temporary password - user should reset
        email_confirm: true,
        user_metadata: {
          name: newUser.name,
          avatar_url: newUser.avatar_url
        }
      });

      if (authError) throw authError;

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name: newUser.name,
          avatar_url: newUser.avatar_url,
          role: newUser.role
        });

      if (profileError) throw profileError;

      // Reset form and close modal
      setNewUser({ name: '', email: '', role: 'user', avatar_url: '' });
      setShowAddModal(false);
      
      // Refresh users list
      await fetchUsers();
      
      alert('User berhasil ditambahkan! Password sementara: temp123456');
      
    } catch (err) {
      console.error('Add user error:', err);
      alert('Error menambahkan user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setLoading(true);
    
    try {
      // Update user metadata in auth
      const { error: authError } = await supabase.auth.admin.updateUserById(
        editingUser.id,
        {
          user_metadata: {
            name: editingUser.name,
            avatar_url: editingUser.avatar_url
          }
        }
      );

      if (authError) throw authError;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: editingUser.name,
          avatar_url: editingUser.avatar_url,
          role: editingUser.role
        })
        .eq('id', editingUser.id);

      if (profileError) throw profileError;

      setShowEditModal(false);
      setEditingUser(null);
      await fetchUsers();
      alert('User berhasil diupdate!');
      
    } catch (err) {
      console.error('Edit user error:', err);
      alert('Error mengupdate user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    
    try {
      // Delete user from auth (will cascade to profiles)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) throw authError;

      setShowDeleteConfirm(null);
      await fetchUsers();
      alert('User berhasil dihapus!');
      
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Error menghapus user: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getAuthProvider = (user) => {
    // Detect provider from email or other metadata
    if (user.email?.includes('gmail.com')) return authProviders.google;
    if (user.provider === 'github') return authProviders.github;
    if (user.provider === 'facebook') return authProviders.facebook;
    return authProviders.email;
  };

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Daftar Pengguna</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Manajemen Pengguna</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <UserPlus size={20} className="mr-2" />
          Tambah User
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <span className="mr-2">⚠️</span>
          {error}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Cari nama/email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-4 font-semibold">Avatar</th>
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Dibuat</th>
                <th className="p-4 font-semibold">Aksi</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <UserPlus size={48} className="mb-2 text-gray-300" />
                      <p>Belum ada pengguna.</p>
                      <p className="text-sm">Klik Tambah User untuk memulai.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                          <span className="text-lg">{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold">{user.name || '-'}</td>
                    <td className="p-4">{user.email || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${roleColor[user.role] || 'bg-gray-100 text-gray-700'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="p-4">{formatDate(user.created_at)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                          onClick={() => setSelected(user)}
                          title="Lihat detail"
                        >
                          <Eye size={14} className="mr-1" />
                          Detail
                        </button>
                        <button
                          className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium hover:bg-green-50 dark:hover:bg-green-900/20 px-2 py-1 rounded transition-colors"
                          onClick={() => openEditModal(user)}
                          title="Edit user"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                          onClick={() => setShowDeleteConfirm(user)}
                          title="Hapus user"
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

      {/* Modal Detail User */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
              onClick={() => setSelected(null)}
              title="Tutup"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Detail Pengguna</h3>
            <div className="flex items-center mb-4">
              {selected.avatar_url ? (
                <img src={selected.avatar_url} alt="avatar" className="w-14 h-14 rounded-full object-cover mr-4" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-4 text-2xl">
                  {selected.name?.[0]?.toUpperCase() || selected.email?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <div className="font-semibold text-lg text-gray-900">{selected.name || '-'}</div>
                <div className="text-gray-700">{selected.email || '-'}</div>
                <div className="mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${roleColor[selected.role] || 'bg-gray-100 text-gray-700'}`}>
                    {selected.role || 'user'}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-gray-900">
              <div><b>ID:</b> <span className="font-mono text-sm">{selected.id}</span></div>
              <div><b>Login Provider:</b> {getAuthProvider(selected).name}</div>
              <div><b>Dibuat:</b> {formatDate(selected.created_at)}</div>
              <div><b>Diupdate:</b> {formatDate(selected.updated_at)}</div>
              <div><b>Last Sign In:</b> {formatDate(selected.last_sign_in_at)}</div>
              {selected.email_confirmed_at && (
                <div><b>Email Confirmed:</b> {formatDate(selected.email_confirmed_at)}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Tambah User Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Nama</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Masukkan email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Avatar URL (Opsional)</label>
                <input
                  type="url"
                  value={newUser.avatar_url}
                  onChange={(e) => setNewUser(prev => ({ ...prev, avatar_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Menambahkan...' : 'Tambah User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Nama</label>
                <input
                  type="text"
                  required
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                  title="Email tidak dapat diubah"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Role</label>
                <select
                  value={editingUser.role || 'user'}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Avatar URL</label>
                <input
                  type="url"
                  value={editingUser.avatar_url || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, avatar_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? 'Mengupdate...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus User</h3>
                <p className="text-gray-700">Apakah Anda yakin ingin menghapus user ini?</p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="text-sm text-gray-900">
                <b>Nama:</b> {showDeleteConfirm.name || '-'}<br />
                <b>Email:</b> {showDeleteConfirm.email || '-'}
              </div>
            </div>
            <p className="text-red-600 text-sm mb-4">
              <b>Peringatan:</b> Tindakan ini tidak dapat dibatalkan. Semua data user akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Menghapus...' : 'Hapus User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}