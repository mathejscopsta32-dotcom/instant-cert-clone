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
    const body = await req.json();
    console.log("SuperPay webhook received:", JSON.stringify(body));

    // Extract transaction info from SuperPay webhook payload
    // Adjust field names based on actual SuperPay webhook format
    const transactionId = body.id || body.transactionId || body.transaction_id;
    const status = body.status || body.paymentStatus || body.payment_status;
    const pedidoId = body.metadata?.pedidoId || body.metadata?.pedido_id;

    if (!transactionId && !pedidoId) {
      console.error("No transaction ID or pedido ID in webhook payload");
      return new Response(
        JSON.stringify({ error: "Missing transaction or pedido identifier" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if payment was approved
    const approvedStatuses = ["paid", "approved", "completed", "confirmed", "PAID", "APPROVED", "COMPLETED", "CONFIRMED"];
    const isPaid = approvedStatuses.includes(status);

    if (!isPaid) {
      console.log(`Payment status "${status}" is not approved yet. Ignoring.`);
      return new Response(
        JSON.stringify({ received: true, action: "ignored", status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Connect to Supabase with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find and update the pedido
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
