import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const publicKey = Deno.env.get("SUPERPAY_PUBLIC_KEY");
    const secretKey = Deno.env.get("SUPERPAY_SECRET_KEY");

    if (!publicKey || !secretKey) {
      throw new Error("SuperPay credentials not configured");
    }

    const { amount, pedidoId, nomeCompleto, cpf, email } = await req.json();

    if (!amount || !pedidoId) {
      return new Response(
        JSON.stringify({ error: "amount and pedidoId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // amount comes in BRL (e.g. 39.90), SuperPay expects cents
    const amountInCents = Math.round(amount * 100);

    const auth = "Basic " + btoa(`${publicKey}:${secretKey}`);

    const payload = {
      amount: amountInCents,
      paymentMethod: "pix",
      customer: {
        name: nomeCompleto || "Cliente",
        email: email || "cliente@email.com",
        document: cpf?.replace(/\D/g, "") || "00000000000",
      },
      pix: {
        expiresInMinutes: 30,
      },
      metadata: {
        pedidoId,
      },
    };

    const response = await fetch("https://api.superpaybr.com/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SuperPay error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Payment gateway error", details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return relevant PIX data to the frontend
    return new Response(
      JSON.stringify({
        transactionId: data.id,
        pixCode: data.pix?.qrCode || data.pix?.qr_code || data.pixQrCode || data.qrCode,
        pixKey: data.pix?.key || data.pix?.pixKey,
        expiresAt: data.pix?.expiresAt || data.expiresAt,
        status: data.status,
        raw: data,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating PIX:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
