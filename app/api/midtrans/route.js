import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import midtransclient from 'midtrans-client';

// Menggunakan Supabase Admin Client dengan Service Role Key untuk operasi backend yang aman.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderItems, customerDetails, userId } = body;

    if (!orderItems || !customerDetails || !userId || orderItems.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Request tidak valid: Data order, user, atau customer tidak lengkap.' 
      }, { status: 400 });
    }

    // 1. VALIDASI HARGA DAN PRODUK DI BACKEND (Kode Anda sudah benar)
    const productIds = orderItems.map(item => item.productId);
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, price, name')
      .in('id', productIds);

    if (productsError) {
      console.error("Supabase products fetch error:", productsError);
      throw new Error(`Gagal memvalidasi produk dari database.`);
    }

    let serverCalculatedTotal = 0;
    const validatedItemsForMidtrans = [];
    const validatedItemsForDb = [];

    for (const item of orderItems) {
      const productFromServer = productsData.find(p => p.id === item.productId);
      if (!productFromServer) {
        throw new Error(`Produk "${item.name}" (ID: ${item.productId}) tidak ditemukan atau sudah tidak tersedia.`);
      }
      
      serverCalculatedTotal += productFromServer.price * item.quantity;

      validatedItemsForMidtrans.push({
        id: item.productId,
        price: productFromServer.price,
        quantity: item.quantity,
        name: productFromServer.name,
      });

      validatedItemsForDb.push({
        product_id: item.productId,
        quantity: item.quantity,
        price_at_purchase: productFromServer.price,
      });
    }

    // 2. SIMPAN ORDER KE DATABASE (Kode Anda sudah benar)
    const transactionCode = `TRX-${Date.now()}`;
    const { data: transactionData, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        transaction_code: transactionCode,
        user_id: userId,
        total_amount: serverCalculatedTotal,
        status: 'pending',
      })
      .select('id')
      .single();

    if (transactionError) {
      console.error("Supabase transaction insert error:", transactionError);
      throw new Error("Gagal menyimpan transaksi utama.");
    }

    const newTransactionId = transactionData.id;
    const itemsToInsert = validatedItemsForDb.map(item => ({
      transaction_id: newTransactionId,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('transaction_items')
      .insert(itemsToInsert);
    
    if (itemsError) {
      console.error("Supabase transaction_items insert error:", itemsError);
      // Di dunia nyata, Anda mungkin ingin menghapus transaksi yang sudah dibuat jika item gagal disimpan (rollback logic)
      throw new Error("Gagal menyimpan detail item transaksi.");
    }
    
    // ===================================================================
    // 3. LANGKAH BARU: HAPUS ITEM DARI KERANJANG PENGGUNA
    // ===================================================================
    const { data: cartData } = await supabaseAdmin
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (cartData) {
        const purchasedProductIds = validatedItemsForDb.map(item => item.product_id);
        const { error: deleteError } = await supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('cart_id', cartData.id)
            .in('product_id', purchasedProductIds);
        
        if (deleteError) {
            // Log error ini, tapi jangan hentikan proses checkout karena pembayaran lebih penting.
            console.error("Peringatan: Gagal menghapus item dari keranjang:", deleteError.message);
        }
    } else {
        console.error("Peringatan: Tidak dapat menemukan keranjang untuk user_id:", userId);
    }
    // --- AKHIR DARI LANGKAH BARU ---

    // 4. BUAT TRANSAKSI MIDTRANS (Kode Anda sudah benar)
    const snap = new midtransclient.Snap({
      isProduction: false,
        // process.env.NODE_ENV === 'production',
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    });

    const parameter = {
        transaction_details: {
            order_id: transactionCode,
            gross_amount: serverCalculatedTotal
        },
        item_details: validatedItemsForMidtrans,
        customer_details: {
            first_name: customerDetails.name,
            email: customerDetails.email,
        },
    };

    const transaction = await snap.createTransaction(parameter);
    
    // 5. KIRIM TOKEN KE FRONTEND (Kode Anda sudah benar)
    return NextResponse.json({ 
      success: true, 
      data: {
        token: transaction.token,
        transactionCode: transactionCode
      } 
    });

  } catch (err) {
    console.error('Error di API Midtrans (route.js):', err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Terjadi kesalahan internal pada server.' 
    }, { status: 500 });
  }
}
