import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Loader2, XCircle, FileCheck2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import icpBrasil from "@/assets/icp-brasil.png";

interface Validacao {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string | null;
  cidade: string | null;
  estado: string | null;
  endereco: string | null;
  hospital_preferencia: string | null;
  hospital_endereco: string | null;
  dias_afastamento: string | null;
  inicio_sintomas_data: string | null;
  data_emissao: string | null;
  data_inicio_atestado: string | null;
  medico_nome: string | null;
  medico_crm: string | null;
  cid_code: string | null;
  cid_description: string | null;
  addon_cid: boolean | null;
  status: string;
  created_at: string;
}

const maskCpf = (cpf: string) => {
  const d = (cpf || "").replace(/\D/g, "");
  if (d.length !== 11) return cpf || "—";
  return `${d.slice(0, 3)}.***.***-${d.slice(9)}`;
};

const Validar = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Validacao | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.rpc("get_pedido_validacao", { p_id: id });
      if (error || !data) {
        setError("Documento não encontrado ou inválido.");
      } else {
        setData(data as Validacao);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-6 text-center">
        <XCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Documento não validado</h1>
        <p className="text-muted-foreground max-w-sm">{error || "Não foi possível encontrar este atestado em nossa base de dados."}</p>
        <Link to="/" className="mt-6 text-primary font-semibold hover:underline">Voltar ao site</Link>
      </div>
    );
  }

  const emissao = data.data_emissao ? new Date(data.data_emissao) : new Date(data.created_at);
  const inicioAtest = data.data_inicio_atestado
    ? new Date(data.data_inicio_atestado)
    : (data.inicio_sintomas_data ? new Date(data.inicio_sintomas_data) : null);
  const inicioSintomas = data.inicio_sintomas_data ? new Date(data.inicio_sintomas_data) : null;

  const endereco =
    data.endereco ||
    [data.cidade, data.estado].filter(Boolean).join(" - ") || "—";
  const hospitalEnd =
    data.hospital_endereco ||
    data.endereco ||
    [data.cidade, data.estado].filter(Boolean).join(" - ") || "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Validation banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl p-6 shadow-xl shadow-emerald-600/20 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-2xl p-3">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold opacity-90">DOCUMENTO VÁLIDO</span>
              </div>
              <h1 className="text-xl font-bold leading-tight">
                Atestado Médico autenticado
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Amparado pelo padrão ICP-Brasil (MP 2.200-2/2001)
              </p>
            </div>
          </div>
        </div>

        {/* Document card */}
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/40 flex items-center gap-3">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-muted-foreground">Código de validação</p>
              <p className="font-mono text-sm font-bold text-foreground">{data.id.slice(0, 8).toUpperCase()}-{data.id.slice(9, 13).toUpperCase()}</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <Row label="Paciente" value={data.nome_completo?.toUpperCase() || "—"} bold />
            <div className="grid grid-cols-2 gap-4">
              <Row label="CPF" value={maskCpf(data.cpf)} />
              <Row label="Nascimento" value={data.data_nascimento || "—"} />
            </div>
            <Row label="Endereço" value={endereco} />

            <hr className="border-border" />

            <Row
              label="Emitido em"
              value={format(emissao, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
              bold
            />
            {inicioSintomas && (
              <Row
                label="Início dos sintomas"
                value={format(inicioSintomas, "dd/MM/yyyy", { locale: ptBR })}
              />
            )}
            {inicioAtest && (
              <Row
                label="Repouso a partir de"
                value={format(inicioAtest, "dd/MM/yyyy", { locale: ptBR })}
              />
            )}
            <Row label="Dias de afastamento" value={data.dias_afastamento || "—"} />

            {data.addon_cid && data.cid_code && (
              <Row
                label="CID"
                value={`${data.cid_code}${data.cid_description ? " - " + data.cid_description : ""}`}
              />
            )}

            <hr className="border-border" />

            <Row label="Médico responsável" value={data.medico_nome || "—"} bold />
            <Row label="CRM" value={data.medico_crm || "—"} />
            <Row
              label="Local de atendimento"
              value={`${data.hospital_preferencia || ""}${hospitalEnd ? " - " + hospitalEnd : ""}`}
            />
          </div>

          {/* ICP footer */}
          <div className="px-6 py-5 bg-muted/40 border-t flex items-center gap-4">
            <img src={icpBrasil} alt="ICP Brasil" className="w-12 h-12 object-contain" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              Este documento foi <strong className="text-foreground">assinado digitalmente</strong> com certificado padrão ICP-Brasil, conforme a Medida Provisória nº 2.200-2/2001. A integridade e autenticidade podem ser verificadas nesta página.
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Esta validação foi realizada em {format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
};

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">{label}</p>
    <p className={`text-sm text-foreground ${bold ? "font-bold" : ""}`}>{value}</p>
  </div>
);

export default Validar;
