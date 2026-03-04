import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function computeCRC16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
    crc &= 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const publicKey = Deno.env.get("SUPERPAY_PUBLIC_KEY");
    const secretKey = Deno.env.get("SUPERPAY_SECRET_KEY");

    const { amount, pedidoId, nomeCompleto, cpf, email } = await req.json();

    if (!amount || !pedidoId) {
      return new Response(
        JSON.stringify({ error: "amount and pedidoId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    let data: any = {};
    let superpayOk = false;

    // Only try SuperPay if credentials exist
    if (publicKey && secretKey) {
      const amountInCents = Math.round(amount * 100);
      const auth = "Basic " + btoa(`${publicKey}:${secretKey}`);
      const webhookUrl = `${supabaseUrl}/functions/v1/superpay-webhook`;

      const payload = {
        amount: amountInCents,
        paymentMethod: "pix",
        customer: {
          name: nomeCompleto || "Cliente",
          email: email || "cliente@email.com",
          document: cpf?.replace(/\D/g, "") || "00000000000",
        },
        pix: { expiresInMinutes: 30 },
        metadata: { pedidoId },
        postbackUrl: webhookUrl,
      };

      console.log("Sending to SuperPay...");

      try {
        const response = await fetch("https://api.superpaybr.com/v1/transactions", {
          method: "POST",
          headers: { Authorization: auth, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        console.log("SuperPay status:", response.status, "body:", responseText);

        try { data = JSON.parse(responseText); } catch { data = {}; }
        superpayOk = response.ok;
      } catch (fetchErr) {
        console.error("SuperPay fetch failed:", fetchErr);
      }
    } else {
      console.log("SuperPay credentials not configured, using fallback PIX");
    }

    // If SuperPay worked, save transaction and return
    if (superpayOk) {
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const transactionId = data.id || data.transactionId;
      if (transactionId) {
        await supabase
          .from("pedidos")
          .update({ superpay_transaction_id: transactionId })
          .eq("id", pedidoId);
      }

      return new Response(
        JSON.stringify({
          transactionId,
          pixCode: data.pix?.qrCode || data.pix?.qr_code || data.pixQrCode || data.qrCode,
          pixKey: data.pix?.key || data.pix?.pixKey,
          expiresAt: data.pix?.expiresAt || data.expiresAt,
          status: data.status,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: generate EMV PIX code locally
    console.log("Using fallback static PIX code");
    const pixKey = "45312876000193";
    const txId = pedidoId.replace(/-/g, "").substring(0, 25);
    const nome = "ATESTADO24H SERVICOS";
    const cidade = "SAO PAULO";
    const amountStr = Number(amount).toFixed(2);

    const merchantAccount = `0014BR.GOV.BCB.PIX01${pixKey.length.toString().padStart(2, "0")}${pixKey}`;
    const additionalField = `05${txId.length.toString().padStart(2, "0")}${txId}`;

    const parts = [
      "000201",
      "010212",
      `26${merchantAccount.length.toString().padStart(2, "0")}${merchantAccount}`,
      "52040000",
      "5303986",
      `54${amountStr.length.toString().padStart(2, "0")}${amountStr}`,
      "5802BR",
      `59${nome.length.toString().padStart(2, "0")}${nome}`,
      `60${cidade.length.toString().padStart(2, "0")}${cidade}`,
      `62${(additionalField.length + 4).toString().padStart(2, "0")}${additionalField}`,
      "6304",
    ];

    const pixString = parts.join("");
    const crc = computeCRC16(pixString);
    const fullPixCode = pixString + crc;

    return new Response(
      JSON.stringify({
        transactionId: null,
        pixCode: fullPixCode,
        status: "fallback",
        fallback: true,
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
