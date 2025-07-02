'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User, Mail, Phone, Calendar, Edit, Save, X, Eye, EyeOff, Shield, Camera, MapPin, Briefcase } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { session, user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    company: '',
    avatar_url: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Statistics state
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalSpent: 0,
    totalDownloads: 0,
    memberSince: ''
  });

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    fetchUserProfile();
    fetchUserStats();
  }, [session, router]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Set form data
      setProfileForm({
        name: profile?.name || user?.name || '',
        phone: profile?.phone || '',
        bio: profile?.bio || '',
        location: profile?.location || '',
        website: profile?.website || '',
        company: profile?.company || '',
        avatar_url: profile?.avatar_url || user?.avatar_url || ''
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Gagal memuat profil pengguna');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Fetch transaction statistics
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('total_amount, status, created_at')
        .eq('user_id', session.user.id);

      if (transError) throw transError;

      const successfulTransactions = transactions?.filter(t => t.status === 'success') || [];
      const totalSpent = successfulTransactions.reduce((sum, t) => sum + t.total_amount, 0);

      // Get member since date
      const memberSince = new Date(session.user.created_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long'
      });

      setStats({
        totalTransactions: successfulTransactions.length,
        totalSpent,
        totalDownloads: successfulTransactions.length * 2, // Estimate
        memberSince
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: session.user.id,
          ...profileForm,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Update auth user metadata if name or avatar changed
      if (profileForm.name !== user?.name || profileForm.avatar_url !== user?.avatar_url) {
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            name: profileForm.name,
            avatar_url: profileForm.avatar_url
          }
        });

        if (authError) throw authError;
      }

      setSuccess('Profil berhasil diperbarui!');
      
      // Refresh the page to get updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Gagal memperbarui profil: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok');
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      setSaving(false);
      return;
    }

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      setSuccess('Password berhasil diubah!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      console.error('Error updating password:', error);
      setError('Gagal mengubah password: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file maksimal 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }

    setSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      setProfileForm(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
      setSuccess('Avatar berhasil diupload! Jangan lupa simpan perubahan.');

    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Gagal mengupload avatar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Login Diperlukan
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Silakan login untuk mengakses halaman profil
          </p>
          <Button onClick={() => router.push('/login')}>
            Login Sekarang
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profil Saya
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Kelola informasi profil dan pengaturan akun Anda
          </p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-700 dark:text-green-300 text-sm flex items-center">
              <Save className="w-4 h-4 mr-2" />
              {success}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300 text-sm flex items-center">
              <X className="w-4 h-4 mr-2" />
              {error}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <Card className="p-6 mb-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={profileForm.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name || 'User')}&size=128&background=3b82f6&color=ffffff`}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profileForm.name || 'Nama Belum Diisi'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {session.user.email}
                </p>
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role === 'admin' ? 'Administrator' : 'Member'}
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Statistik</h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Total Transaksi</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.totalTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Total Pembelian</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(stats.totalSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Total Download</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.totalDownloads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Member Sejak</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.memberSince}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: 'profile', label: 'Informasi Profil', icon: User },
                  { id: 'security', label: 'Keamanan', icon: Shield },
                  { id: 'preferences', label: 'Preferensi', icon: Edit }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Informasi Profil
                  </h2>
                  <Edit className="w-5 h-5 text-gray-400" />
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nama Lengkap *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Masukkan nama lengkap"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          value={session.user.email}
                          disabled
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Email tidak dapat diubah
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nomor Telepon
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Contoh: 08123456789"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lokasi
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={profileForm.location}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Contoh: Jakarta, Indonesia"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Perusahaan
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={profileForm.company}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Nama perusahaan"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profileForm.website}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Ceritakan sedikit tentang diri Anda..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={saving}
                      className="flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Keamanan Akun
                  </h2>
                  <Shield className="w-5 h-5 text-gray-400" />
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Masukkan password saat ini"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Masukkan password baru (minimal 6 karakter)"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Ulangi password baru"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Tips Keamanan Password
                        </h4>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                          <li>• Gunakan minimal 8 karakter</li>
                          <li>• Kombinasikan huruf besar, kecil, angka, dan simbol</li>
                          <li>• Jangan gunakan informasi pribadi</li>
                          <li>• Gunakan password yang unik untuk setiap akun</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={saving}
                      className="flex items-center space-x-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Ubah Password</span>
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {activeTab === 'preferences' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Preferensi
                  </h2>
                  <Edit className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Notifikasi Email
                    </h3>
                    <div className="space-y-3">
                      {[
                        { id: 'order_updates', label: 'Update pesanan dan transaksi', description: 'Terima notifikasi tentang status pesanan Anda' },
                        { id: 'promotions', label: 'Promosi dan penawaran khusus', description: 'Dapatkan info tentang diskon dan produk baru' },
                        { id: 'newsletter', label: 'Newsletter mingguan', description: 'Tips, tutorial, dan update dari DigiRidz' },
                        { id: 'security', label: 'Notifikasi keamanan', description: 'Peringatan login dan aktivitas akun' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id={item.id}
                            defaultChecked={item.id === 'order_updates' || item.id === 'security'}
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <label htmlFor={item.id} className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                              {item.label}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Pengaturan Privasi
                    </h3>
                    <div className="space-y-3">
                      {[
                        { id: 'profile_public', label: 'Profil publik', description: 'Izinkan orang lain melihat profil dasar Anda' },
                        { id: 'show_purchases', label: 'Tampilkan riwayat pembelian', description: 'Tampilkan produk yang pernah Anda beli di profil' },
                        { id: 'allow_messages', label: 'Terima pesan dari pengguna lain', description: 'Izinkan pengguna lain mengirim pesan kepada Anda' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id={item.id}
                            defaultChecked={item.id === 'profile_public'}
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <label htmlFor={item.id} className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                              {item.label}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Language & Region */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Bahasa & Wilayah
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Bahasa
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          <option value="id">Bahasa Indonesia</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Zona Waktu
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          <option value="Asia/Jakarta">WIB (UTC+7)</option>
                          <option value="Asia/Makassar">WITA (UTC+8)</option>
                          <option value="Asia/Jayapura">WIT (UTC+9)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button className="flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Simpan Preferensi</span>
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}