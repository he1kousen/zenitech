// Supabase Edge Function: create-payment
// Generate Midtrans Snap token server-side biar MIDTRANS_SERVER_KEY tidak exposed.
//
// Deploy:
//   supabase functions deploy create-payment --no-verify-jwt
//
// Set secret di Supabase Dashboard → Settings → Edge Functions → Secrets:
//   MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx (dari Midtrans Sandbox)
//
// (Atau via CLI: supabase secrets set MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx)

// deno-lint-ignore-file no-explicit-any

const MIDTRANS_SNAP_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";

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

interface CustomerDetails {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface ItemDetail {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

interface CreatePaymentBody {
  orderId: string;
  amount: number;
  customerDetails: CustomerDetails;
  itemDetails: ItemDetail[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
  if (!serverKey) {
    return jsonResponse(
      { error: "MIDTRANS_SERVER_KEY belum di-set di Edge Function secrets" },
      500,
    );
  }

  let body: CreatePaymentBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { orderId, amount, customerDetails, itemDetails } = body || ({} as any);

  if (!orderId || typeof amount !== "number" || amount <= 0) {
    return jsonResponse(
      { error: "Field orderId dan amount (number > 0) wajib diisi" },
      400,
    );
  }
  if (!Array.isArray(itemDetails) || itemDetails.length === 0) {
    return jsonResponse(
      { error: "itemDetails tidak boleh kosong" },
      400,
    );
  }

  // Midtrans menolak gross_amount yang tidak sama dengan jumlah item × qty.
  // Jadi kita tambahkan satu item "Ongkos kirim" sintetik di sisi caller agar
  // total cocok. Server cuma forward apa yang dikirim Checkout.
  const grossAmount = Math.round(amount);

  // Midtrans Snap sandbox auth: Basic base64(serverKey + ":")
  const authToken = btoa(`${serverKey}:`);

  const midtransPayload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: customerDetails?.first_name || "Customer",
      last_name: customerDetails?.last_name || "",
      email: customerDetails?.email || "noreply@zenitech.local",
      phone: customerDetails?.phone || "",
    },
    item_details: itemDetails.map((it) => ({
      id: String(it.id),
      price: Math.round(Number(it.price)),
      quantity: Math.max(1, Number(it.quantity)),
      name: String(it.name).slice(0, 50),
    })),
    credit_card: { secure: true },
  };

  let midtransRes: Response;
  try {
    midtransRes = await fetch(MIDTRANS_SNAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${authToken}`,
      },
      body: JSON.stringify(midtransPayload),
    });
  } catch (err) {
    return jsonResponse(
      {
        error: "Gagal menghubungi Midtrans",
        detail: (err as Error).message,
      },
      502,
    );
  }

  let midtransJson: any;
  try {
    midtransJson = await midtransRes.json();
  } catch {
    return jsonResponse(
      { error: "Response Midtrans bukan JSON yang valid" },
      502,
    );
  }

  if (!midtransRes.ok || !midtransJson?.token) {
    return jsonResponse(
      {
        error: "Midtrans menolak request",
        detail: midtransJson,
      },
      midtransRes.status || 502,
    );
  }

  return jsonResponse({
    token: midtransJson.token,
    redirect_url: midtransJson.redirect_url,
    order_id: orderId,
  });
});
