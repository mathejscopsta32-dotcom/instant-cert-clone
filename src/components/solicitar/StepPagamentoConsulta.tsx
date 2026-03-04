import { useState, useEffect } from "react";
import { Check, Clock, Copy, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ConsultaFormData } from "@/pages/SolicitarConsulta";
import { calcConsultaTotal } from "@/components/solicitar/StepRevisaoConsulta";
import { supabase } from "@/integrations/supabase/client";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import {
  EntregaImediataBadge,
  PaymentTrustBadges,
  PaymentReviews,
  PixPaymentHeader,
  WhatsAppButton,
  PixBrandFooter,
} from "./PaymentSocialProof";

interface Props {
  formData: ConsultaFormData;
  pedidoId: string;
  onPaymentConfirmed: (pedidoId: string) => void;
}

const StepPagamentoConsulta = ({ formData, pedidoId, onPaymentConfirmed }: Props) => {
  const totalPrice = calcConsultaTotal(formData);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [copied, setCopied] = useState(false);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [loadingPix, setLoadingPix] = useState(true);
  const [pixError, setPixError] = useState<string | null>(null);
  const paymentApproved = usePaymentStatus(pedidoId);

  const precoLabel = `R$ ${totalPrice.toFixed(2).replace(".", ",")}`;

  const createPixTransaction = async () => {
    setLoadingPix(true);
    setPixError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-pix", {
        body: { amount: totalPrice, pedidoId, nomeCompleto: formData.nomeCompleto, cpf: formData.cpf, email: formData.email },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const code = data?.pixCode;
      if (code) { setPixCode(code); setTimeLeft(30 * 60); }
      else throw new Error("QR Code não retornado pela gateway");
    } catch (err: any) {
      console.error("Erro ao criar PIX:", err);
      setPixError(err.message || "Erro ao gerar PIX. Tente novamente.");
    } finally {
      setLoadingPix(false);
    }
  };

  useEffect(() => { createPixTransaction(); }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { if (paymentApproved) onPaymentConfirmed(pedidoId); }, [paymentApproved]);

  const handleCopy = async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true); setTimeout(() => setCopied(false), 3000);
    } catch {
      const ta = document.createElement("textarea"); ta.value = pixCode;
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      setCopied(true); setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="space-y-5">
      <PixPaymentHeader label="Sua consulta será agendada automaticamente após o pagamento." />

      <EntregaImediataBadge />

      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 text-center border border-primary/15">
        <p className="text-xs text-muted-foreground font-medium mb-1">Valor da Consulta</p>
        <p className="text-3xl font-extrabold text-primary">{precoLabel}</p>
        <p className="text-[10px] text-muted-foreground mt-1">Pagamento único · Sem taxas adicionais</p>
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

        <button type="button" onClick={() => createPixTransaction()} disabled={loadingPix}
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

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">Aguardando confirmação do pagamento...</p>
      </div>

      <PaymentTrustBadges />
      <PaymentReviews />
      <WhatsAppButton />
      <PixBrandFooter />
    </div>
  );
};

export default StepPagamentoConsulta;
