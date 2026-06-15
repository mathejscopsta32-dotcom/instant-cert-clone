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
  // Persisted edit overrides
  medico_nome?: string | null;
  medico_crm?: string | null;
  endereco?: string | null;
  hospital_endereco?: string | null;
  data_emissao?: string | null;
  data_inicio_atestado?: string | null;
  cid_code?: string | null;
  cid_description?: string | null;
}

export interface RegenerateOverrides {
  medicoNome?: string;
  medicoCrm?: string;
  hospital?: string;
  hospitalEndereco?: string;
  diasAfastamento?: string;
  inicioSintomas?: string;
  inicioSintomasData?: string | null;
  addonCid?: boolean;
  addonQrCode?: boolean;
  nomeCompleto?: string;
  cpf?: string;
  dataNascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  dataEmissao?: string | null;
  dataInicioAtestado?: string | null;
  cidCode?: string;
  cidDescription?: string;
}

export async function regenerateAtestadoPDF(
  pedido: PedidoLike,
  overrides: RegenerateOverrides = {}
): Promise<string> {
  // Determine doctor — prefer override → previously saved → UF lookup
  let medicoNome = overrides.medicoNome || pedido.medico_nome || undefined;
  let medicoCrm = overrides.medicoCrm || pedido.medico_crm || undefined;
  if (!medicoNome || !medicoCrm) {
    const m = await getMedicoByEstado(pedido.estado || "");
    medicoNome = medicoNome || m.nome;
    medicoCrm = medicoCrm || m.crm;
  }

  const inicioData = overrides.inicioSintomasData ?? pedido.inicio_sintomas_data;
  const dataEmissao = overrides.dataEmissao ?? pedido.data_emissao ?? null;
  const dataInicioAtestado =
    overrides.dataInicioAtestado ?? pedido.data_inicio_atestado ?? null;

  const formData: FormData = {
    nomeCompleto: overrides.nomeCompleto ?? pedido.nome_completo,
    cpf: overrides.cpf ?? pedido.cpf,
    email: pedido.email,
    telefone: pedido.telefone,
    dataNascimento: overrides.dataNascimento ?? (pedido.data_nascimento || ""),
    sintomas: pedido.sintomas || [],
    outrosSintomas: pedido.outros_sintomas || "",
    inicioSintomas: overrides.inicioSintomas ?? (pedido.inicio_sintomas || "hoje"),
    inicioSintomasData: inicioData ? new Date(inicioData) : undefined,
    diasAfastamento: overrides.diasAfastamento ?? (pedido.dias_afastamento || "1 dia"),
    observacoes: pedido.observacoes || "",
    hospitalPreferencia: overrides.hospital ?? (pedido.hospital_preferencia || "UBS"),
    cidade: overrides.cidade ?? (pedido.cidade || ""),
    estado: overrides.estado ?? (pedido.estado || ""),
    addonCid: overrides.addonCid ?? !!pedido.addon_cid,
    addonQrCode: overrides.addonQrCode ?? !!pedido.addon_qr_code,
    addonPacote3: !!pedido.addon_pacote3,
    aceitaTermos: true,
    medicoSelecionado: "",
    medicoOverride: { fullName: medicoNome, crm: medicoCrm },
    enderecoOverride: (overrides.endereco ?? pedido.endereco) || undefined,
    hospitalEnderecoOverride:
      (overrides.hospitalEndereco ?? pedido.hospital_endereco) || undefined,
    dataEmissaoOverride: dataEmissao ? new Date(dataEmissao) : undefined,
    dataInicioAtestadoOverride: dataInicioAtestado ? new Date(dataInicioAtestado) : undefined,
    cidOverride: (() => {
      const code = overrides.cidCode ?? pedido.cid_code ?? "";
      const desc = overrides.cidDescription ?? pedido.cid_description ?? "";
      return code || desc ? { code, description: desc } : undefined;
    })(),
  };

  const doc = await generateAtestadoPDF(formData, pedido.id);
  const blob = doc.output("blob");
  const path = `${Date.now()}-regen-${Math.random().toString(36).slice(2)}.pdf`;
  const { error: uploadErr } = await supabase.storage
    .from("atestados")
    .upload(path, blob, { contentType: "application/pdf" });
  if (uploadErr) throw uploadErr;

  // Persist all overrides + ensure data_emissao is stored so the validation
  // page shows EXACTLY the same emission timestamp printed on the PDF.
  const finalEmissao = dataEmissao ?? new Date().toISOString();
  const updatePayload: Record<string, unknown> = {
    pdf_url: path,
    data_emissao: finalEmissao,
    medico_nome: medicoNome,
    medico_crm: medicoCrm,
  };
  if (overrides.hospital !== undefined) updatePayload.hospital_preferencia = overrides.hospital;
  if (overrides.diasAfastamento !== undefined) updatePayload.dias_afastamento = overrides.diasAfastamento;
  if (overrides.inicioSintomas !== undefined) updatePayload.inicio_sintomas = overrides.inicioSintomas;
  if (overrides.inicioSintomasData !== undefined) updatePayload.inicio_sintomas_data = overrides.inicioSintomasData;
  if (overrides.dataInicioAtestado !== undefined) updatePayload.data_inicio_atestado = overrides.dataInicioAtestado;
  if (overrides.addonCid !== undefined) updatePayload.addon_cid = overrides.addonCid;
  if (overrides.addonQrCode !== undefined) updatePayload.addon_qr_code = overrides.addonQrCode;
  if (overrides.nomeCompleto !== undefined) updatePayload.nome_completo = overrides.nomeCompleto;
  if (overrides.cpf !== undefined) updatePayload.cpf = overrides.cpf;
  if (overrides.dataNascimento !== undefined) updatePayload.data_nascimento = overrides.dataNascimento;
  if (overrides.cidade !== undefined) updatePayload.cidade = overrides.cidade;
  if (overrides.estado !== undefined) updatePayload.estado = overrides.estado;
  if (overrides.endereco !== undefined) updatePayload.endereco = overrides.endereco || null;
  if (overrides.hospitalEndereco !== undefined)
    updatePayload.hospital_endereco = overrides.hospitalEndereco || null;
  if (overrides.cidCode !== undefined) updatePayload.cid_code = overrides.cidCode || null;
  if (overrides.cidDescription !== undefined)
    updatePayload.cid_description = overrides.cidDescription || null;

  await (supabase as any).from("pedidos").update(updatePayload).eq("id", pedido.id);

  return path;
}
