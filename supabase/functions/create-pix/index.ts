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
    const publicKeyRaw = Deno.env.get("FREEPAY_PUBLIC_KEY");
    const secretKeyRaw = Deno.env.get("FREEPAY_SECRET_KEY");
    const publicKey = (publicKeyRaw || "").trim();
    const secretKey = (secretKeyRaw || "").trim();

    if (!publicKey || !secretKey) {
      throw new Error("FreePay credentials not configured");
    }

    const mask = (v: string) =>
      v.length <= 8 ? `len=${v.length}` : `len=${v.length} ${v.slice(0, 4)}…${v.slice(-4)}`;
    console.log(`FreePay creds — public: ${mask(publicKey)} | secret: ${mask(secretKey)}`);

    // Probe /v1/dashboard/balance to isolate credential problem from payload
    const probe = await fetch("https://api.freepaybrasil.com/v1/dashboard/balance", {
      headers: {
        Authorization: "Basic " + btoa(`${publicKey}:${secretKey}`),
        Accept: "application/json",
      },
    });
    const probeText = await probe.text();
    console.log(`FreePay balance probe: ${probe.status} ${probeText.slice(0, 200)}`);
    if (probe.status === 401) {
      return new Response(
        JSON.stringify({
          error:
            "As credenciais da FreePay foram rejeitadas (401). Verifique se as chaves salvas em FREEPAY_PUBLIC_KEY e FREEPAY_SECRET_KEY são exatamente as do painel (Credenciais API) e do mesmo ambiente.",
          details: probeText,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


    const { amount, pedidoId, nomeCompleto, cpf, email, telefone } = await req.json();

    if (!amount || !pedidoId) {
      return new Response(
        JSON.stringify({ error: "amount and pedidoId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== IP-based rate limiting & block list =====
    const xff = req.headers.get("x-forwarded-for") || "";
    const clientIp = xff.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    if (clientIp) {
      const { data: rl } = await supabaseAdmin.rpc("check_pix_rate_limit", {
        p_ip: clientIp,
        p_limit: 2,
      });
      const allowed = (rl as any)?.allowed;
      const reason = (rl as any)?.reason;
      if (allowed === false) {
        console.warn(`Blocked PIX request from IP ${clientIp}: ${reason}`);
        const msg = reason === "blocked"
          ? "Este IP está bloqueado. Entre em contato com o suporte."
          : "Limite diário atingido (2 atestados por dia por IP). Tente novamente amanhã ou fale conosco no WhatsApp.";
        return new Response(
          JSON.stringify({ error: msg, reason }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ===== CPF + Nome rate limiting (2 PIX por dia por CPF ou nome) =====
    const { data: rlCpf } = await supabaseAdmin.rpc("check_cpf_nome_rate_limit", {
      p_cpf: cpf || "",
      p_nome: nomeCompleto || "",
      p_limit: 2,
    });
    if ((rlCpf as any)?.allowed === false) {
      console.warn(`Blocked PIX request for CPF/nome: ${cpf} / ${nomeCompleto}`);
      return new Response(
        JSON.stringify({
          error:
            "Limite diário atingido (2 atestados por dia por CPF/nome). Tente novamente amanhã ou fale conosco no WhatsApp.",
          reason: "cpf_nome_rate_limit",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log this attempt (IP + CPF + nome) for both rate limits
    await supabaseAdmin.from("pix_attempts").insert({
      ip: clientIp || null,
      pedido_id: pedidoId,
      cpf: cpf || null,
      nome: nomeCompleto || null,
    });

    const auth = "Basic " + btoa(`${publicKey}:${secretKey}`);

    const webhookUrl = `${supabaseUrl}/functions/v1/superpay-webhook`;

    // FreePay expects amount as integer in cents
    const amountCents = Math.round(Number(amount) * 100);

    const phoneDigits = (telefone || "5511999999999").toString().replace(/\D/g, "");
    const phoneWithCountry = phoneDigits.startsWith("55") ? phoneDigits : `55${phoneDigits}`;
    const documentNumber = (cpf || "").replace(/\D/g, "") || "00000000000";

    const basePayload = {
      amount: amountCents,
      payment_method: "pix",
      postback_url: webhookUrl,
      customer: {
        name: nomeCompleto || "Cliente",
        email: email || "cliente@email.com",
        document: {
          number: documentNumber,
          type: "cpf",
        },
      },
      items: [
        {
          title: "Atestado Médico Online",
          unit_price: amountCents,
          quantity: 1,
          tangible: false,
          external_ref: pedidoId,
        },
      ],
      pix: {
        expires_in_days: 1,
      },
      metadata: { pedidoId },
    };

    const payloadVariants = [
      {
        label: "flat-digits",
        body: {
          ...basePayload,
          customer: { ...basePayload.customer, phone: phoneWithCountry },
        },
      },
      {
        label: "flat-plus",
        body: {
          ...basePayload,
          customer: { ...basePayload.customer, phone: `+${phoneWithCountry}` },
        },
      },
      {
        label: "wrapped-digits",
        body: {
          request: {
            ...basePayload,
            customer: { ...basePayload.customer, phone: phoneWithCountry },
          },
        },
      },
      {
        label: "wrapped-plus",
        body: {
          request: {
            ...basePayload,
            customer: { ...basePayload.customer, phone: `+${phoneWithCountry}` },
          },
        },
      },
    ];

    let data: any = {};
    let responseStatus = 500;

    for (const variant of payloadVariants) {
      console.log(
        `Sending to FreePay [${variant.label}]:`,
        JSON.stringify({
          ...variant.body,
          request: variant.body.request
            ? {
                ...variant.body.request,
                customer: { ...variant.body.request.customer, document: "***" },
              }
            : undefined,
          customer: "customer" in variant.body
            ? { ...(variant.body as any).customer, document: "***" }
            : undefined,
        })
      );

      const response = await fetch("https://api.freepaybrasil.com/v1/payment-transaction/create", {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(variant.body),
      });

      const responseText = await response.text();
      responseStatus = response.status;
      console.log(`FreePay status [${variant.label}]:`, response.status, "body:", responseText);

      try { data = JSON.parse(responseText); } catch { data = {}; }

      if (response.ok) {
        break;
      }
    }

    if (responseStatus < 200 || responseStatus >= 300) {
      return new Response(
        JSON.stringify({ error: "Payment gateway error", details: data }),
        { status: responseStatus, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // FreePay may return data as a single object or an array under `data`
    const txn = Array.isArray(data?.data) ? data.data[0] : (data?.data ?? data);
    const pix = Array.isArray(txn?.pix) ? txn.pix[0] : txn?.pix;

    const transactionId = txn?.id || data?.id;
    const pixCode = pix?.qr_code || pix?.qrCode || pix?.payload || txn?.qr_code;
    const expiresAt = pix?.expiration_date || pix?.expirationDate;

    // Persist FreePay transaction id (column re-used from previous gateway)
    if (transactionId) {
      await supabaseAdmin
        .from("pedidos")
        .update({ superpay_transaction_id: transactionId })
        .eq("id", pedidoId);
    }


    return new Response(
      JSON.stringify({
        transactionId,
        pixCode,
        expiresAt,
        status: txn?.status,
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
