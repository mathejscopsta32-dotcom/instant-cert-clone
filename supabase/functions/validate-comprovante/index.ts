import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function hashBuffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ valid: false, reason: "Nenhum arquivo enviado." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const buffer = await file.arrayBuffer();
    const hash = await hashBuffer(buffer);

    // Check for duplicates
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: existing } = await supabase
      .from("comprovante_hashes")
      .select("id")
      .eq("hash", hash)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: "Este comprovante já foi enviado anteriormente. Envie um comprovante diferente.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to validate if image is a real payment receipt
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiValid = true;
    let aiReason = "";

    if (LOVABLE_API_KEY && file.type.startsWith("image/")) {
      try {
        const base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        const dataUri = `data:${file.type};base64,${base64}`;

        const aiResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content: `Você é um validador de comprovantes de pagamento PIX. Analise a imagem e responda APENAS com um JSON no formato: {"valido": true/false, "motivo": "explicação curta"}.

Critérios para ser VÁLIDO:
- Deve ser uma captura de tela de um comprovante de pagamento PIX ou transferência bancária real
- Deve conter informações típicas: valor, data, hora, nome do destinatário, instituição bancária
- A data/hora deve ser recente (últimas 24 horas)

Critérios para ser INVÁLIDO:
- Imagem editada, montagem ou documento falso
- Screenshot de outra coisa que não seja um comprovante
- Foto de foto (segunda captura)
- Imagem muito borrada ou ilegível
- Documento sem informações de pagamento

Seja rigoroso mas justo na análise.`,
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "image_url",
                      image_url: { url: dataUri },
                    },
                    {
                      type: "text",
                      text: "Analise este comprovante de pagamento e valide se é real.",
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          
          // Extract JSON from response
          const jsonMatch = content.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              aiValid = parsed.valido === true;
              aiReason = parsed.motivo || "";
            } catch {
              // If JSON parse fails, accept the comprovante
              aiValid = true;
            }
          }
        }
      } catch (aiErr) {
        console.error("AI validation error:", aiErr);
        // If AI fails, still accept (don't block the user)
        aiValid = true;
      }
    }

    if (!aiValid) {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: aiReason || "O comprovante enviado não parece ser um comprovante de pagamento válido.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return hash so frontend can store it after successful order creation
    return new Response(
      JSON.stringify({ valid: true, hash }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("validate-comprovante error:", err);
    return new Response(
      JSON.stringify({ valid: false, reason: "Erro ao validar comprovante." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
