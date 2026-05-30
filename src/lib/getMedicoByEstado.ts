import { supabase } from "@/integrations/supabase/client";

const DEFAULT_MEDICO = {
  nome: "Dr. Rodrigo V. Vasconcelos",
  crm: "CRM/SP 158.743",
};

/**
 * Returns the assigned doctor (name + CRM) for the given Brazilian UF.
 * Falls back to the default SP doctor when no row matches or the request fails.
 */
export async function getMedicoByEstado(
  uf: string | null | undefined,
): Promise<{ nome: string; crm: string }> {
  const code = (uf ?? "").toUpperCase().trim();
  if (!code) return DEFAULT_MEDICO;

  try {
    const { data, error } = await supabase
      .from("medicos_por_estado" as never)
      .select("nome, crm")
      .eq("uf", code)
      .maybeSingle();
    if (error || !data) return DEFAULT_MEDICO;
    const row = data as { nome: string; crm: string };
    return { nome: row.nome, crm: row.crm };
  } catch {
    return DEFAULT_MEDICO;
  }
}
