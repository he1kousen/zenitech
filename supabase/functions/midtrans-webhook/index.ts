// Supabase Edge Function: midtrans-webhook
// Menerima notifikasi pembayaran dari Midtrans (server-to-server) dan
// meng-update status orders + payments berdasarkan transaction_status.
//
// Deploy:
//   supabase functions deploy midtrans-webhook --no-verify-jwt
//
// PENTING: --no-verify-jwt WAJIB karena Midtrans memanggil endpoint ini tanpa
// JWT user. Keamanan dijamin lewat verifikasi signature_key (HMAC-SHA512).
//
// Set secrets di Supabase Dashboard → Settings → Edge Functions → Secrets:
//   MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx       (sudah ada dari fungsi sebelumnya)
//   SUPABASE_URL=https://xxx.supabase.co          (auto-injected, tidak perlu set manual)
//   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...          (untuk bypass RLS saat update)
//
// Catatan: SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di-inject otomatis oleh
// Supabase ke setiap Edge Function — tidak perlu set manual di Secrets.
//
// =============================================================================
// CARA DAFTARIN URL WEBHOOK INI DI MIDTRANS DASHBOARD:
// =============================================================================
// 1. Login ke https://dashboard.sandbox.midtrans.com (atau dashboard.midtrans.com untuk production)
// 2. Buka menu Settings → Configuration
// 3. Cari field "Payment Notification URL"
// 4. Isi dengan: https://<PROJECT_REF>.supabase.co/functions/v1/midtrans-webhook
//    (Ganti <PROJECT_REF> dengan reference ID project Supabase kamu)
// 5. Klik Save / Update Settings
// 6. (Opsional) Test pakai tombol "Test Notification URL" di dashboard Midtrans
// =============================================================================

// deno-lint-ignore-file no-explicit-any

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// SHA-512 hex digest pakai Web Crypto API (built-in di Deno).
async function sha512Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_id?: string;
  payment_type?: string;
  transaction_time?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // 1. Parse body
  let notification: MidtransNotification;
  try {
    notification = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
  } = notification || ({} as MidtransNotification);

  if (!order_id || !status_code || !gross_amount || !signature_key) {
    return jsonResponse(
      { error: "Field wajib (order_id, status_code, gross_amount, signature_key) tidak lengkap" },
      400,
    );
  }

  // 2. Verifikasi signature
  //    signature_key = SHA512(order_id + status_code + gross_amount + server_key)
  const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
  if (!serverKey) {
    return jsonResponse(
      { error: "MIDTRANS_SERVER_KEY belum di-set di Edge Function secrets" },
      500,
    );
  }

  const expectedSignature = await sha512Hex(
    `${order_id}${status_code}${gross_amount}${serverKey}`,
  );

  if (expectedSignature !== signature_key) {
    console.warn("[midtrans-webhook] Signature mismatch", {
      order_id,
      received: signature_key.slice(0, 12) + "...",
      expected: expectedSignature.slice(0, 12) + "...",
    });
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  // 3. Tentukan status baru berdasarkan transaction_status
  //    Mapping sesuai dokumentasi Midtrans:
  //    https://docs.midtrans.com/reference/transaction-status
  let orderStatus: "paid" | "pending" | "cancelled" | null = null;
  let paymentStatus: string = transaction_status;
  let paidAt: string | null = null;

  switch (transaction_status) {
    case "capture":
      // Untuk credit card, capture + fraud_status=accept artinya sukses.
      // Kalau challenge, biarkan pending sampai dispute selesai.
      if (fraud_status === "accept" || !fraud_status) {
        orderStatus = "paid";
        paidAt = new Date().toISOString();
      } else {
        orderStatus = "pending";
      }
      break;
    case "settlement":
      orderStatus = "paid";
      paidAt = new Date().toISOString();
      break;
    case "pending":
      orderStatus = "pending";
      break;
    case "deny":
    case "cancel":
    case "expire":
      orderStatus = "cancelled";
      break;
    case "refund":
    case "partial_refund":
    case "chargeback":
    case "partial_chargeback":
      // Status di luar lifecycle awal — simpan di payments saja, jangan ubah orders.
      orderStatus = null;
      break;
    default:
      console.warn(
        "[midtrans-webhook] Unknown transaction_status:",
        transaction_status,
      );
      orderStatus = null;
  }

  // 4. Update database pakai service role (bypass RLS — webhook tanpa user JWT)
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      { error: "Supabase env vars (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) tidak ditemukan" },
      500,
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Update payments — match by midtrans_order_id (yang dikirim ke Midtrans saat create token)
  const paymentUpdate: Record<string, unknown> = {
    status: paymentStatus,
  };
  if (paidAt) paymentUpdate.paid_at = paidAt;

  const { error: paymentError } = await supabase
    .from("payments")
    .update(paymentUpdate)
    .eq("midtrans_order_id", order_id);

  if (paymentError) {
    console.error("[midtrans-webhook] Gagal update payments:", paymentError);
    // Jangan return — tetap coba update orders supaya state konsisten
  }

  // Update orders kalau status mapping memang berubah
  if (orderStatus) {
    // Cari order_id yang berkaitan via tabel payments
    const { data: paymentRow, error: lookupError } = await supabase
      .from("payments")
      .select("order_id")
      .eq("midtrans_order_id", order_id)
      .maybeSingle();

    if (lookupError) {
      console.error("[midtrans-webhook] Gagal lookup payment:", lookupError);
    } else if (paymentRow?.order_id) {
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: orderStatus })
        .eq("id", paymentRow.order_id);

      if (orderError) {
        console.error("[midtrans-webhook] Gagal update orders:", orderError);
      }
    } else {
      // Fallback: midtrans_order_id sama dengan orders.id (kasus default di Checkout.jsx)
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: orderStatus })
        .eq("id", order_id);

      if (orderError) {
        console.error(
          "[midtrans-webhook] Gagal update orders (fallback):",
          orderError,
        );
      }
    }
  }

  // 5. Return 200 OK — Midtrans expect 2xx, kalau bukan dia bakal retry.
  return jsonResponse({
    received: true,
    order_id,
    transaction_status,
    order_status: orderStatus,
  });
});
