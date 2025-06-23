'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Pastikan path ini benar

// 1. Membuat Context
const AuthContext = createContext();

// 2. Membuat Provider Component
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null); // Menyimpan data dari tabel 'users' kita
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Coba ambil sesi yang sudah ada
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
            setUser(userData);
        }
        setLoading(false);
    };

    getInitialSession();

    // Dengarkan perubahan state autentikasi
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
         if (session) {
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
            setUser(userData);
        } else {
            setUser(null);
        }
        setLoading(false);
      }
    );

    // Bersihkan listener saat komponen unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Nilai yang akan disediakan untuk komponen anak
  const value = {
    session,
    user,
    // Anda bisa menambahkan fungsi login/logout di sini jika mau
  };

  // Jangan render anak sebelum loading selesai untuk menghindari "flicker"
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Membuat Custom Hook untuk menggunakan context dengan mudah
export const useAuth = () => {
  return useContext(AuthContext);
};
