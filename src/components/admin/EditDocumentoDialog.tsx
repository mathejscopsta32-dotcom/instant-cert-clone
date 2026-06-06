import { useEffect, useState } from "react";
import { Loader2, X, FileEdit, Save } from "lucide-react";
import { regenerateAtestadoPDF, type PedidoLike } from "@/lib/regenerateAtestadoPDF";
import { getMedicoByEstado } from "@/lib/getMedicoByEstado";
import { toast } from "sonner";

interface Props {
  pedido: PedidoLike | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const HOSPITAIS = ["UBS", "UPA 24h", "SUS", "Unimed", "Hapvida", "Socorromed"];
const DIAS = Array.from({ length: 30 }, (_, i) => `${i + 1} dia${i ? "s" : ""}`);
const INICIO = [
  { v: "hoje", l: "Hoje" },
  { v: "ontem", l: "Ontem" },
  { v: "anteontem", l: "Anteontem" },
  { v: "personalizado", l: "Personalizado" },
];

const EditDocumentoDialog = ({ pedido, open, onClose, onSaved }: Props) => {
  // Doctor
  const [medicoNome, setMedicoNome] = useState("");
  const [medicoCrm, setMedicoCrm] = useState("");
  // Patient
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  // Document
  const [dataEmissao, setDataEmissao] = useState("");
  const [hospital, setHospital] = useState("UBS");
  const [hospitalEndereco, setHospitalEndereco] = useState("");
  const [dias, setDias] = useState("1 dia");
  const [inicio, setInicio] = useState("personalizado");
  const [inicioData, setInicioData] = useState("");
  const [dataInicioAtestado, setDataInicioAtestado] = useState("");
  // CID
  const [addonCid, setAddonCid] = useState(false);
  const [cidCode, setCidCode] = useState("");
  const [cidDescription, setCidDescription] = useState("");
  const [addonQr, setAddonQr] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!pedido || !open) return;
    setNomeCompleto(pedido.nome_completo || "");
    setCpf(pedido.cpf || "");
    setDataNascimento(pedido.data_nascimento || "");
    setCidade(pedido.cidade || "");
    setEstado(pedido.estado || "");
    setEndereco("");
    setDataEmissao("");
    setHospital(pedido.hospital_preferencia || "UBS");
    setHospitalEndereco("");
    setDias(pedido.dias_afastamento || "1 dia");
    setInicio(pedido.inicio_sintomas || "hoje");
    setInicioData(pedido.inicio_sintomas_data ? pedido.inicio_sintomas_data.slice(0, 10) : "");
    setAddonCid(!!pedido.addon_cid);
    setCidCode("");
    setCidDescription("");
    setAddonQr(!!pedido.addon_qr_code);
    getMedicoByEstado(pedido.estado || "").then((m) => {
      setMedicoNome(m.nome);
      setMedicoCrm(m.crm);
    });
  }, [pedido, open]);

  if (!open || !pedido) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await regenerateAtestadoPDF(pedido, {
        medicoNome,
        medicoCrm,
        nomeCompleto,
        cpf,
        dataNascimento,
        endereco: endereco || undefined,
        cidade,
        estado,
        hospital,
        hospitalEndereco: hospitalEndereco || undefined,
        diasAfastamento: dias,
        inicioSintomas: inicio,
        inicioSintomasData:
          inicio === "personalizado" && inicioData ? new Date(inicioData).toISOString() : null,
        dataEmissao: dataEmissao ? new Date(dataEmissao).toISOString() : null,
        addonCid,
        cidCode: addonCid ? cidCode || undefined : undefined,
        cidDescription: addonCid ? cidDescription || undefined : undefined,
        addonQrCode: addonQr,
      });
      toast.success("PDF regenerado com sucesso!");
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao regenerar PDF.");
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
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Editar documento</h3>
              <p className="text-xs text-muted-foreground">{pedido.nome_completo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Patient */}
          <Section title="Dados do Paciente">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome completo">
                <Input value={nomeCompleto} onChange={setNomeCompleto} />
              </Field>
              <Field label="CPF">
                <Input value={cpf} onChange={setCpf} placeholder="000.000.000-00" />
              </Field>
              <Field label="Data de nascimento">
                <Input value={dataNascimento} onChange={setDataNascimento} placeholder="DD/MM/AAAA" />
              </Field>
              <Field label="Endereço (opcional, sobrepõe cidade/UF)">
                <Input value={endereco} onChange={setEndereco} placeholder="Rua, número - Bairro" />
              </Field>
              <Field label="Cidade">
                <Input value={cidade} onChange={setCidade} />
              </Field>
              <Field label="Estado (UF)">
                <Input value={estado} onChange={(v) => setEstado(v.toUpperCase().slice(0, 2))} placeholder="SP" />
              </Field>
            </div>
          </Section>

          {/* Document */}
          <Section title="Documento">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Hospital">
                <Select value={hospital} onChange={setHospital} options={HOSPITAIS} />
              </Field>
              <Field label="Endereço do hospital (aparece no rodapé)">
                <Input
                  value={hospitalEndereco}
                  onChange={setHospitalEndereco}
                  placeholder="Deixe vazio para usar cidade/UF do cliente"
                />
              </Field>
              <Field label="Dias de afastamento">
                <Select value={dias} onChange={setDias} options={DIAS} />
              </Field>
              <Field label="Data de emissão">
                <input
                  type="datetime-local"
                  value={dataEmissao}
                  onChange={(e) => setDataEmissao(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                />
              </Field>
              <Field label="Início dos sintomas">
                <Select value={inicio} onChange={setInicio} options={INICIO.map((i) => i.l)}
                  rawOptions={INICIO.map((i) => i.v)} />
              </Field>
              {inicio === "personalizado" && (
                <Field label="Data personalizada">
                  <input
                    type="date"
                    value={inicioData}
                    onChange={(e) => setInicioData(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                  />
                </Field>
              )}
            </div>
          </Section>

          {/* Doctor */}
          <Section title="Médico">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome do médico">
                <Input value={medicoNome} onChange={setMedicoNome} />
              </Field>
              <Field label="CRM">
                <Input value={medicoCrm} onChange={setMedicoCrm} placeholder="CRM/SP 123.456" />
              </Field>
            </div>
          </Section>

          {/* Add-ons */}
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
                <Field label="Código CID (opcional)">
                  <Input value={cidCode} onChange={(v) => setCidCode(v.toUpperCase())} placeholder="Ex: R51" />
                </Field>
                <Field label="Descrição CID (opcional)">
                  <Input value={cidDescription} onChange={setCidDescription} placeholder="Ex: Cefaleia" />
                </Field>
              </div>
            )}
          </Section>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-muted">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar e regenerar PDF
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

const Input = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
  />
);

const Select = ({
  value,
  onChange,
  options,
  rawOptions,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  rawOptions?: string[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
  >
    {options.map((o, i) => (
      <option key={o} value={rawOptions ? rawOptions[i] : o}>
        {o}
      </option>
    ))}
  </select>
);

export default EditDocumentoDialog;
