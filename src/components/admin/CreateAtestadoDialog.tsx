import { useState } from "react";
import { Loader2, X, FilePlus2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { regenerateAtestadoPDF, type PedidoLike } from "@/lib/regenerateAtestadoPDF";
import { getMedicoByEstado } from "@/lib/getMedicoByEstado";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const HOSPITAIS = ["UBS", "UPA 24h", "SUS", "Unimed", "Hapvida", "Socorromed"];
const DIAS = Array.from({ length: 30 }, (_, i) => `${i + 1} dia${i ? "s" : ""}`);

const today = () => new Date().toISOString().slice(0, 10);

const CreateAtestadoDialog = ({ open, onClose, onCreated }: Props) => {
  // Patient
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  // Document
  const [hospital, setHospital] = useState("UBS");
  const [hospitalEndereco, setHospitalEndereco] = useState("");
  const [dias, setDias] = useState("1 dia");
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().slice(0, 16));
  const [inicioData, setInicioData] = useState(today());
  const [dataInicioAtestado, setDataInicioAtestado] = useState(today());
  // Doctor
  const [medicoNome, setMedicoNome] = useState("");
  const [medicoCrm, setMedicoCrm] = useState("");
  // Addons
  const [addonCid, setAddonCid] = useState(false);
  const [cidCode, setCidCode] = useState("");
  const [cidDescription, setCidDescription] = useState("");
  const [addonQr, setAddonQr] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const reset = () => {
    setNomeCompleto(""); setCpf(""); setEmail(""); setTelefone("");
    setDataNascimento(""); setEndereco(""); setCidade(""); setEstado("");
    setHospital("UBS"); setHospitalEndereco(""); setDias("1 dia");
    setDataEmissao(new Date().toISOString().slice(0, 16));
    setInicioData(today()); setDataInicioAtestado(today());
    setMedicoNome(""); setMedicoCrm("");
    setAddonCid(false); setCidCode(""); setCidDescription(""); setAddonQr(true);
  };

  const handleAutoDoctor = async () => {
    if (!estado) { toast.error("Preencha o estado primeiro"); return; }
    const m = await getMedicoByEstado(estado);
    setMedicoNome(m.nome); setMedicoCrm(m.crm);
    toast.success("Médico preenchido conforme UF");
  };

  const handleSave = async () => {
    if (!nomeCompleto.trim() || !cpf.trim()) {
      toast.error("Nome e CPF são obrigatórios");
      return;
    }
    setSaving(true);
    try {
      // Resolve doctor
      let mNome = medicoNome, mCrm = medicoCrm;
      if (!mNome || !mCrm) {
        const m = await getMedicoByEstado(estado);
        mNome = mNome || m.nome; mCrm = mCrm || m.crm;
      }

      const emissaoIso = dataEmissao ? new Date(dataEmissao).toISOString() : new Date().toISOString();
      const inicioIso = inicioData ? new Date(inicioData).toISOString() : null;
      const inicioAtestadoIso = dataInicioAtestado ? new Date(dataInicioAtestado).toISOString() : null;

      // 1) Insert new pedido (aprovado por padrão pois é criado manualmente pelo admin)
      const { data: inserted, error: insertErr } = await (supabase as any)
        .from("pedidos")
        .insert({
          nome_completo: nomeCompleto,
          cpf,
          email: email || "manual@admin.local",
          telefone,
          data_nascimento: dataNascimento || null,
          cidade: cidade || null,
          estado: estado || null,
          endereco: endereco || null,
          hospital_preferencia: hospital,
          hospital_endereco: hospitalEndereco || null,
          dias_afastamento: dias,
          inicio_sintomas: "personalizado",
          inicio_sintomas_data: inicioIso,
          data_inicio_atestado: inicioAtestadoIso,
          data_emissao: emissaoIso,
          medico_nome: mNome,
          medico_crm: mCrm,
          addon_cid: addonCid,
          addon_qr_code: addonQr,
          addon_pacote3: false,
          cid_code: addonCid ? (cidCode || null) : null,
          cid_description: addonCid ? (cidDescription || null) : null,
          valor_total: 0,
          status: "aprovado",
          tipo: "atestado",
        })
        .select("*")
        .single();
      if (insertErr) throw insertErr;

      // 2) Generate PDF via regenerate helper
      const pedidoLike: PedidoLike = inserted as PedidoLike;
      await regenerateAtestadoPDF(pedidoLike, {
        medicoNome: mNome,
        medicoCrm: mCrm,
        nomeCompleto,
        cpf,
        dataNascimento,
        endereco: endereco || undefined,
        cidade,
        estado,
        hospital,
        hospitalEndereco: hospitalEndereco || undefined,
        diasAfastamento: dias,
        inicioSintomas: "personalizado",
        inicioSintomasData: inicioIso,
        dataEmissao: emissaoIso,
        dataInicioAtestado: inicioAtestadoIso,
        addonCid,
        cidCode: addonCid ? cidCode || undefined : undefined,
        cidDescription: addonCid ? cidDescription || undefined : undefined,
        addonQrCode: addonQr,
      });

      toast.success("Atestado criado e PDF gerado!");
      reset();
      onCreated();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao criar atestado.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-card border rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Novo atestado manual</h3>
              <p className="text-xs text-muted-foreground">Preencha os dados e gere o PDF</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          <Section title="Dados do Paciente">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome completo *"><Input value={nomeCompleto} onChange={setNomeCompleto} /></Field>
              <Field label="CPF *"><Input value={cpf} onChange={setCpf} placeholder="000.000.000-00" /></Field>
              <Field label="Email"><Input value={email} onChange={setEmail} placeholder="cliente@email.com" /></Field>
              <Field label="Telefone (com DDD)"><Input value={telefone} onChange={setTelefone} placeholder="(11) 99999-9999" /></Field>
              <Field label="Data de nascimento"><Input value={dataNascimento} onChange={setDataNascimento} placeholder="DD/MM/AAAA" /></Field>
              <Field label="Endereço (opcional)"><Input value={endereco} onChange={setEndereco} placeholder="Rua, número - Bairro" /></Field>
              <Field label="Cidade"><Input value={cidade} onChange={setCidade} /></Field>
              <Field label="Estado (UF)">
                <Input value={estado} onChange={(v) => setEstado(v.toUpperCase().slice(0, 2))} placeholder="SP" />
              </Field>
            </div>
          </Section>

          <Section title="Documento">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Hospital"><Select value={hospital} onChange={setHospital} options={HOSPITAIS} /></Field>
              <Field label="Endereço do hospital (rodapé)">
                <Input value={hospitalEndereco} onChange={setHospitalEndereco} placeholder="Vazio = usar cidade/UF do cliente" />
              </Field>
              <Field label="Dias de afastamento"><Select value={dias} onChange={setDias} options={DIAS} /></Field>
              <Field label="Data de emissão">
                <input type="datetime-local" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
              </Field>
              <Field label="Início dos sintomas">
                <input type="date" value={inicioData} onChange={(e) => setInicioData(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
              </Field>
              <Field label="Início do atestado (repouso a partir de)">
                <input type="date" value={dataInicioAtestado} onChange={(e) => setDataInicioAtestado(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
              </Field>
            </div>
          </Section>

          <Section title="Médico">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome do médico"><Input value={medicoNome} onChange={setMedicoNome} placeholder="Preencha ou clique em Auto" /></Field>
              <Field label="CRM"><Input value={medicoCrm} onChange={setMedicoCrm} placeholder="CRM/SP 123.456" /></Field>
            </div>
            <button onClick={handleAutoDoctor} type="button"
              className="mt-2 text-xs font-semibold text-primary hover:underline">
              Preencher automaticamente pela UF
            </button>
          </Section>

          <Section title="CID e validação">
            <div className="flex flex-wrap gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={addonCid} onChange={(e) => setAddonCid(e.target.checked)} />
                <span>Incluir CID</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={addonQr} onChange={(e) => setAddonQr(e.target.checked)} />
                <span>Incluir QR Code de validação</span>
              </label>
            </div>
            {addonCid && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Código CID"><Input value={cidCode} onChange={(v) => setCidCode(v.toUpperCase())} placeholder="Ex: R51" /></Field>
                <Field label="Descrição CID"><Input value={cidDescription} onChange={setCidDescription} placeholder="Ex: Cefaleia" /></Field>
              </div>
            )}
          </Section>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-muted">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Criar e gerar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">{title}</h4>
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    className="w-full px-3 py-2 rounded-lg border bg-background text-sm" />
);

const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 rounded-lg border bg-background text-sm">
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

export default CreateAtestadoDialog;
