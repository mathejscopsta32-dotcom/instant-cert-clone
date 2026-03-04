import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const amountInCents = Math.round(amount * 100);
    const auth = "Basic " + btoa(`${publicKey}:${secretKey}`);
    const webhookUrl = `${supabaseUrl}/functions/v1/superpay-webhook`;

    const payload = {
      amount: amountInCents,
      paymentMethod: "pix",
      items: [
        {
          title: "Serviço Médico Online",
          unitPrice: amountInCents,
          quantity: 1,
          tangible: false,
        },
      ],
      customer: {
        name: nomeCompleto || "Cliente",
        email: email || "cliente@email.com",
        document: {
          type: "cpf",
          number: cpf?.replace(/\D/g, "") || "00000000000",
        },
      },
      pix: {
        expiresInMinutes: 30,
      },
      metadata: JSON.stringify({ pedidoId }),
      externalRef: pedidoId,
      postbackUrl: webhookUrl,
    };

    console.log("Sending to SuperPay:", JSON.stringify({ ...payload, customer: { ...payload.customer, document: "***" } }));

    const response = await fetch("https://api.superpaybr.com/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("SuperPay status:", response.status, "body:", responseText);

    let data: any;
    try { data = JSON.parse(responseText); } catch { data = {}; }

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Payment gateway error", details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save transaction ID
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const transactionId = data.id || data.transactionId;
    if (transactionId) {
      await supabase
        .from("pedidos")
        .update({ superpay_transaction_id: transactionId })
        .eq("id", pedidoId);
    }

    const pixCode = data.pix?.qrCode || data.pix?.qr_code || data.pix?.payload ||
                    data.pixQrCode || data.qrCode || data.qr_code || data.payload;

    return new Response(
      JSON.stringify({
        transactionId,
        pixCode,
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
