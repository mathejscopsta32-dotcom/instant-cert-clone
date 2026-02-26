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
  pedidoId: string;
  onPaymentConfirmed: (pedidoId: string) => void;
}

const StepPagamentoConsulta = ({ formData, pedidoId, onPaymentConfirmed }: Props) => {
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

      if (comprovanteUrl) {
        await supabase.rpc("submit_comprovante", {
          p_pedido_id: pedidoId,
          p_comprovante_url: comprovanteUrl,
        });
      }

      if (comprovanteHash) {
        await supabase.from("comprovante_hashes").insert({
          hash: comprovanteHash,
          pedido_id: pedidoId,
        } as any);
      }

      onPaymentConfirmed(pedidoId);
    } catch (err) {
      console.error("Erro ao enviar comprovante:", err);
      alert("Erro ao enviar comprovante. Tente novamente.");
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

      {/* WhatsApp */}
      <a
        href={`https://wa.me/5511999999999?text=${encodeURIComponent(`Olá! Acabei de solicitar uma consulta online.\nID: ${pedidoId}\nNome: ${formData.nomeCompleto}\nValor: ${precoLabel}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Falar no WhatsApp
      </a>

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
