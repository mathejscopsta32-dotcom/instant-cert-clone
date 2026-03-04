import { useState, useEffect, useRef } from "react";
import { Check, Clock, Copy, ShieldCheck, AlertCircle, RefreshCw, Upload, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ConsultaFormData } from "@/pages/SolicitarConsulta";
import { calcConsultaTotal } from "@/components/solicitar/StepRevisaoConsulta";
import { supabase } from "@/integrations/supabase/client";

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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [loadingPix, setLoadingPix] = useState(true);
  const [pixError, setPixError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const precoLabel = `R$ ${totalPrice.toFixed(2).replace(".", ",")}`;

  const createPixTransaction = async () => {
    setLoadingPix(true);
    setPixError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-pix", {
        body: {
          amount: totalPrice,
          pedidoId,
          nomeCompleto: formData.nomeCompleto,
          cpf: formData.cpf,
          email: formData.email,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const code = data?.pixCode;
      if (code) {
        setPixCode(code);
        setTimeLeft(30 * 60);
      } else {
        throw new Error("QR Code não retornado pela gateway");
      }
    } catch (err: any) {
      console.error("Erro ao criar PIX:", err);
      setPixError(err.message || "Erro ao gerar PIX. Tente novamente.");
    } finally {
      setLoadingPix(false);
    }
  };

  useEffect(() => {
    createPixTransaction();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRegenerate = () => createPixTransaction();

  const handleCopy = async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = pixCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleFileSelect = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setValidationError(null);
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
          <div className="bg-white p-5 rounded-2xl shadow-sm border min-h-[260px] flex items-center justify-center">
            {loadingPix ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">Gerando PIX...</p>
              </div>
            ) : pixError ? (
              <div className="flex flex-col items-center gap-2 text-destructive text-center px-4">
                <AlertCircle className="w-8 h-8" />
                <p className="text-sm font-medium">{pixError}</p>
              </div>
            ) : pixCode ? (
              <QRCodeSVG value={pixCode} size={220} level="M" />
            ) : null}
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

        <button type="button" onClick={handleRegenerate} disabled={loadingPix}
          className="w-full inline-flex items-center justify-center gap-2 text-sm text-primary font-semibold hover:underline disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loadingPix ? "animate-spin" : ""}`} />
          Gerar novo código PIX
        </button>
      </div>

      {pixCode && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Ou copie e cole o código:</p>
          <div className="bg-muted rounded-xl p-3 text-xs text-muted-foreground break-all font-mono max-h-20 overflow-y-auto">{pixCode}</div>
          <button type="button" onClick={handleCopy} disabled={timeLeft === 0}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${copied ? "bg-primary text-primary-foreground" : "border border-primary text-primary hover:bg-secondary"} disabled:opacity-50`}>
            {copied ? (<><Check className="w-4 h-4" />Código copiado!</>) : (<><Copy className="w-4 h-4" />Copiar</>)}
          </button>
        </div>
      )}

      <div className="bg-muted rounded-xl p-4 space-y-3">
        <div>
          <p className="text-sm font-bold text-foreground">Enviar Comprovante de Pagamento</p>
          <p className="text-xs text-muted-foreground mt-1">Após realizar o PIX, envie o comprovante para confirmar.</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
        <button type="button" onClick={handleFileSelect}
          className="w-full inline-flex items-center justify-center gap-2 border border-border text-foreground px-4 py-3 rounded-xl font-semibold text-sm hover:bg-secondary transition-colors">
          <Upload className="w-4 h-4" />{selectedFile ? selectedFile.name : "Selecionar Arquivo"}
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
        disabled={timeLeft === 0 || submitting || !selectedFile || !!validationError}
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
