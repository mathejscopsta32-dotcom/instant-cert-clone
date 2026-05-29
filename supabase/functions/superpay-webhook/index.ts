import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// FreePay webhook handler (kept under previous route name to avoid breaking config)
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("FreePay webhook received:", JSON.stringify(body));

    // FreePay sends fields in PascalCase. Be tolerant to lowercase as well.
    const txData = body.data || body;
    const transactionId =
      txData.Id || txData.id || body.Id || body.id || null;
    const status: string =
      (txData.Status || txData.status || body.Status || body.status || "").toString();

    // pedidoId can be encoded in metadata or ExternalId
    let pedidoId: string | null = null;
    const rawMeta = txData.Metadata ?? txData.metadata ?? body.Metadata ?? body.metadata;
    try {
      const meta = typeof rawMeta === "string" ? JSON.parse(rawMeta) : rawMeta;
      pedidoId = meta?.pedidoId || meta?.pedido_id || null;
    } catch {
      pedidoId = null;
    }
    if (!pedidoId) {
      pedidoId = txData.ExternalId || txData.externalId || body.ExternalId || body.externalId || null;
    }

    if (!transactionId && !pedidoId) {
      console.error("No transaction ID or pedido ID in webhook payload");
      return new Response(
        JSON.stringify({ error: "Missing transaction or pedido identifier" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isPaid = status.toUpperCase() === "PAID";
    if (!isPaid) {
      console.log(`Payment status "${status}" is not approved yet. Ignoring.`);
      return new Response(
        JSON.stringify({ received: true, action: "ignored", status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase.from("pedidos").update({
      status: "aprovado",
      updated_at: new Date().toISOString(),
    });

    if (pedidoId) {
      query = query.eq("id", pedidoId);
    } else {
      query = query.eq("superpay_transaction_id", transactionId);
    }

    const { error } = await query;

    if (error) {
      console.error("Error updating pedido:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Pedido updated to 'aprovado' for transaction ${transactionId || pedidoId}`);

    return new Response(
      JSON.stringify({ received: true, action: "approved" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
