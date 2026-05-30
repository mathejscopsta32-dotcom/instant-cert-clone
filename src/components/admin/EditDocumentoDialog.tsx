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
const DIAS = Array.from({ length: 15 }, (_, i) => `${i + 1} dia${i ? "s" : ""}`);
const INICIO = [
  { v: "hoje", l: "Hoje" },
  { v: "ontem", l: "Ontem" },
  { v: "anteontem", l: "Anteontem" },
  { v: "personalizado", l: "Personalizado" },
];

const EditDocumentoDialog = ({ pedido, open, onClose, onSaved }: Props) => {
  const [medicoNome, setMedicoNome] = useState("");
  const [medicoCrm, setMedicoCrm] = useState("");
  const [hospital, setHospital] = useState("UBS");
  const [dias, setDias] = useState("1 dia");
  const [inicio, setInicio] = useState("hoje");
  const [inicioData, setInicioData] = useState("");
  const [addonCid, setAddonCid] = useState(false);
  const [addonQr, setAddonQr] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!pedido || !open) return;
    setHospital(pedido.hospital_preferencia || "UBS");
    setDias(pedido.dias_afastamento || "1 dia");
    setInicio(pedido.inicio_sintomas || "hoje");
    setInicioData(pedido.inicio_sintomas_data ? pedido.inicio_sintomas_data.slice(0, 10) : "");
    setAddonCid(!!pedido.addon_cid);
    setAddonQr(!!pedido.addon_qr_code);
    // Pre-fill doctor from UF lookup
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
        hospital,
        diasAfastamento: dias,
        inicioSintomas: inicio,
        inicioSintomasData: inicio === "personalizado" && inicioData
          ? new Date(inicioData).toISOString()
          : null,
        addonCid,
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
      <div className="bg-card border rounded-2xl shadow-2xl max-w-2xl w-full my-8">
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

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome do médico">
              <input
                value={medicoNome}
                onChange={(e) => setMedicoNome(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              />
            </Field>
            <Field label="CRM">
              <input
                value={medicoCrm}
                onChange={(e) => setMedicoCrm(e.target.value)}
                placeholder="CRM/SP 123.456"
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              />
            </Field>
            <Field label="Hospital">
              <select
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              >
                {HOSPITAIS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </Field>
            <Field label="Dias de afastamento">
              <select
                value={dias}
                onChange={(e) => setDias(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              >
                {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Início dos sintomas">
              <select
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
              >
                {INICIO.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
              </select>
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

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={addonCid} onChange={(e) => setAddonCid(e.target.checked)} />
              <span>Incluir CID</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={addonQr} onChange={(e) => setAddonQr(e.target.checked)} />
              <span>Incluir QR Code de validação</span>
            </label>
          </div>
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

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</label>
    {children}
  </div>
);

export default EditDocumentoDialog;
