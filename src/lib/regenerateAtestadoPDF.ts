import { supabase } from "@/integrations/supabase/client";
import { generateAtestadoPDF } from "@/lib/generateAtestadoPDF";
import { getMedicoByEstado } from "@/lib/getMedicoByEstado";
import type { FormData } from "@/pages/Solicitar";

export interface PedidoLike {
  id: string;
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  data_nascimento: string | null;
  cidade: string | null;
  estado: string | null;
  sintomas: string[] | null;
  outros_sintomas: string | null;
  inicio_sintomas: string | null;
  inicio_sintomas_data: string | null;
  dias_afastamento: string | null;
  observacoes: string | null;
  hospital_preferencia: string | null;
  addon_cid: boolean | null;
  addon_qr_code: boolean | null;
  addon_pacote3: boolean | null;
}

export interface RegenerateOverrides {
  medicoNome?: string;
  medicoCrm?: string;
  hospital?: string;
  diasAfastamento?: string;
  inicioSintomas?: string;
  inicioSintomasData?: string | null;
  addonCid?: boolean;
  addonQrCode?: boolean;
}

export async function regenerateAtestadoPDF(
  pedido: PedidoLike,
  overrides: RegenerateOverrides = {}
): Promise<string> {
  // Determine doctor
  let medicoNome = overrides.medicoNome;
  let medicoCrm = overrides.medicoCrm;
  if (!medicoNome || !medicoCrm) {
    const m = await getMedicoByEstado(pedido.estado || "");
    medicoNome = medicoNome || m.nome;
    medicoCrm = medicoCrm || m.crm;
  }

  const inicioData = overrides.inicioSintomasData ?? pedido.inicio_sintomas_data;

  const formData: FormData = {
    nomeCompleto: pedido.nome_completo,
    cpf: pedido.cpf,
    email: pedido.email,
    telefone: pedido.telefone,
    dataNascimento: pedido.data_nascimento || "",
    sintomas: pedido.sintomas || [],
    outrosSintomas: pedido.outros_sintomas || "",
    inicioSintomas: overrides.inicioSintomas ?? (pedido.inicio_sintomas || "hoje"),
    inicioSintomasData: inicioData ? new Date(inicioData) : undefined,
    diasAfastamento: overrides.diasAfastamento ?? (pedido.dias_afastamento || "1 dia"),
    observacoes: pedido.observacoes || "",
    hospitalPreferencia: overrides.hospital ?? (pedido.hospital_preferencia || "UBS"),
    cidade: pedido.cidade || "",
    estado: pedido.estado || "",
    addonCid: overrides.addonCid ?? !!pedido.addon_cid,
    addonQrCode: overrides.addonQrCode ?? !!pedido.addon_qr_code,
    addonPacote3: !!pedido.addon_pacote3,
    aceitaTermos: true,
    medicoSelecionado: "",
    medicoOverride: { fullName: medicoNome, crm: medicoCrm },
  };

  const doc = await generateAtestadoPDF(formData);
  const blob = doc.output("blob");
  const path = `${Date.now()}-regen-${Math.random().toString(36).slice(2)}.pdf`;
  const { error: uploadErr } = await supabase.storage
    .from("atestados")
    .upload(path, blob, { contentType: "application/pdf" });
  if (uploadErr) throw uploadErr;

  // Update pedido row: pdf_url + persist overrides applied
  const updatePayload: Record<string, unknown> = { pdf_url: path };
  if (overrides.hospital !== undefined) updatePayload.hospital_preferencia = overrides.hospital;
  if (overrides.diasAfastamento !== undefined) updatePayload.dias_afastamento = overrides.diasAfastamento;
  if (overrides.inicioSintomas !== undefined) updatePayload.inicio_sintomas = overrides.inicioSintomas;
  if (overrides.inicioSintomasData !== undefined) updatePayload.inicio_sintomas_data = overrides.inicioSintomasData;
  if (overrides.addonCid !== undefined) updatePayload.addon_cid = overrides.addonCid;
  if (overrides.addonQrCode !== undefined) updatePayload.addon_qr_code = overrides.addonQrCode;
  await supabase.from("pedidos").update(updatePayload).eq("id", pedido.id);

  return path;
}
