import { useState, useEffect, useRef } from "react";
import { Check, Clock, Copy, ShieldCheck, AlertCircle, RefreshCw, Upload, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ConsultaFormData } from "@/pages/SolicitarConsulta";
import { calcConsultaTotal } from "@/components/solicitar/StepRevisaoConsulta";
import { generatePixPayload } from "@/lib/pix";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK_PIX_KEY = "566a023b-14b4-4306-aed5-a05f4ec92d26";

interface Props {
  formData: ConsultaFormData;
  onPaymentConfirmed: (pedidoId: string) => void;
}

const StepPagamentoConsulta = ({ formData, onPaymentConfirmed }: Props) => {
  const totalPrice = calcConsultaTotal(formData);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [comprovanteHash, setComprovanteHash] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState(FALLBACK_PIX_KEY);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "pix_key")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setPixKey(data.value);
      });
  }, []);

  const precoLabel = `R$ ${totalPrice.toFixed(2).replace(".", ",")}`;

  const pixPayload = generatePixPayload({
    pixKey,
    merchantName: "CONSULTA24H",
    merchantCity: "SAO PAULO",
    amount: totalPrice,
    description: "Consulta Medica Online",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRegenerate = () => setTimeLeft(30 * 60);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = pixPayload;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleFileSelect = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setValidationError(null);
    setComprovanteHash(null);
    setValidating(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-comprovante`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: form,
        }
      );
      const result = await response.json();
      if (result.valid) {
        setComprovanteHash(result.hash);
        setValidationError(null);
      } else {
        setValidationError(result.reason || "Comprovante inválido.");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Validation error:", err);
      setComprovanteHash(null);
      setValidationError(null);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmitPayment = async () => {
    setSubmitting(true);
    try {
      let comprovanteUrl: string | null = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("comprovantes")
          .upload(filePath, selectedFile);
        if (!uploadError) comprovanteUrl = filePath;
      }

      const pedidoId = crypto.randomUUID();
      const { error } = await supabase.from("pedidos").insert({
        id: pedidoId,
        nome_completo: formData.nomeCompleto,
        cpf: formData.cpf,
        email: formData.email,
        telefone: formData.telefone,
        data_nascimento: formData.dataNascimento || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        valor_total: totalPrice,
        comprovante_url: comprovanteUrl,
        status: "pendente",
        tipo: "consulta",
        addon_cid: formData.addonCid,
        addon_qr_code: formData.addonQrCode,
      } as any);

      if (error) throw error;

      if (comprovanteHash) {
        await supabase.from("comprovante_hashes").insert({
          hash: comprovanteHash,
          pedido_id: pedidoId,
        } as any);
      }

      onPaymentConfirmed(pedidoId);
    } catch (err) {
      console.error("Erro ao salvar pedido:", err);
      alert("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl">₱</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Pagamento via PIX</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sua consulta será agendada após a confirmação do pagamento.
        </p>
      </div>

      <div className="bg-secondary/50 rounded-xl p-4 text-center">
        <p className="text-xs text-muted-foreground font-medium mb-1">Valor da Consulta</p>
        <p className="text-3xl font-extrabold text-primary">{precoLabel}</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground text-center">Escaneie o QR Code abaixo:</p>
        <div className="flex justify-center">
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <QRCodeSVG value={pixPayload} size={220} level="M" />
          </div>
        </div>
        {timeLeft > 0 ? (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            Expira em {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs text-destructive font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            PIX expirado
          </div>
        )}
        <button type="button" onClick={handleRegenerate} className="w-full inline-flex items-center justify-center gap-2 text-sm text-primary font-semibold hover:underline">
          <RefreshCw className="w-4 h-4" />
          Gerar novo código PIX
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Ou copie e cole o código:</p>
        <div className="bg-muted rounded-xl p-3 text-xs text-muted-foreground break-all font-mono max-h-20 overflow-y-auto">{pixPayload}</div>
        <button type="button" onClick={handleCopy} disabled={timeLeft === 0}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${copied ? "bg-primary text-primary-foreground" : "border border-primary text-primary hover:bg-secondary"} disabled:opacity-50`}>
          {copied ? (<><Check className="w-4 h-4" />Código copiado!</>) : (<><Copy className="w-4 h-4" />Copiar</>)}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 font-medium">Envie o comprovante logo após o pagamento para agilizar o agendamento da sua consulta!</p>
      </div>

      <div className="bg-muted rounded-xl p-4 space-y-3">
        <div>
          <p className="text-sm font-bold text-foreground">Enviar Comprovante de Pagamento</p>
          <p className="text-xs text-muted-foreground mt-1">Após realizar o PIX, envie o comprovante para confirmar.</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
        <button type="button" onClick={handleFileSelect} disabled={validating}
          className="w-full inline-flex items-center justify-center gap-2 border border-border text-foreground px-4 py-3 rounded-xl font-semibold text-sm hover:bg-secondary transition-colors disabled:opacity-50">
          {validating ? (<><Loader2 className="w-4 h-4 animate-spin" />Validando comprovante...</>) : (<><Upload className="w-4 h-4" />{selectedFile ? selectedFile.name : "Selecionar Arquivo"}</>)}
        </button>
      </div>

      {validationError && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">{validationError}</p>
        </div>
      )}

      {!selectedFile && !validationError && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">Para confirmar o pagamento, é obrigatório enviar o comprovante.</p>
        </div>
      )}

      <button type="button" onClick={handleSubmitPayment}
        disabled={timeLeft === 0 || submitting || !selectedFile || validating || !!validationError}
        className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm">
        {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Enviando pedido...</>) : (<><Check className="w-4 h-4" />Já fiz o pagamento</>)}
      </button>

      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Pagamento 100% Seguro
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-4 h-4 text-primary" />
          Agendamento Imediato
        </div>
      </div>
    </div>
  );
};

export default StepPagamentoConsulta;
