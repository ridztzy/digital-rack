import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto'; // 1. Import modul crypto bawaan Node.js

// Inisialisasi Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { order_id, status_code, gross_amount, signature_key, payment_type, transaction_status, transaction_time, transaction_id, va_numbers } = body;

    // 2. Verifikasi Signature Key untuk keamanan
    // Ini memastikan notifikasi benar-benar datang dari Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
        throw new Error('MIDTRANS_SERVER_KEY tidak diatur di environment variables.');
    }
    // Signature hash harus pakai status_code, bukan transaction_status!
    const hashString = order_id + status_code + gross_amount + serverKey;
    const hashed = crypto.createHash('sha512').update(hashString).digest('hex');

    if (hashed !== signature_key) {
      // Jika signature tidak cocok, tolak request
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }
    // --- Akhir dari langkah verifikasi ---

    // 3. Map status Midtrans ke status internal Anda
    let newStatus = 'pending';
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      newStatus = 'success';
    } else if (transaction_status === 'expire' || transaction_status === 'cancel' || transaction_status === 'deny') {
      newStatus = 'failed';
    }

    // Pilih satu referensi saja (misal transaction_id Midtrans)
    const paymentRef = transaction_id || (va_numbers && va_numbers[0]?.va_number) || null;

    // 4. Update tabel 'transactions' hanya jika signature valid
    const { error } = await supabaseAdmin
      .from('transactions')
      .update({ 
          status: newStatus,
          payment_method: payment_type, // Simpan juga metode pembayaran
          paid_at: (newStatus === 'success') ? transaction_time : null, // Catat waktu lunas
          payment_gateway_ref: paymentRef // Opsional: Simpan seluruh notifikasi untuk audit
      })
      .eq('transaction_code', order_id);

    if (error) {
      // Jika ada error saat update database
      console.error('Webhook DB update error:', error);
      // Kirim respons error ke Midtrans agar mereka bisa mencoba mengirim notifikasi lagi nanti
      return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
    }

    // Jika berhasil, kirim respons sukses
    return NextResponse.json({ success: true, received: true });

  } catch (err) {
    console.error('Webhook processing error:', err.message);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
