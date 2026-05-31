import { useState, useEffect } from "react";
import { Check, Clock, Copy, AlertCircle, RefreshCw, Loader2, QrCode, Smartphone, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { FormData } from "@/pages/Solicitar";
import { diasOpcoes } from "./StepDetalhes";
import { supabase } from "@/integrations/supabase/client";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import {
  PaymentTrustBadges,
  PaymentReviews,
  WhatsAppButton,
  PixBrandFooter,
} from "./PaymentSocialProof";

const ADDON_CID_PRICE = 9.9;
const ADDON_QR_PRICE = 9.9;
const ADDON_PACOTE_PRICE = 39.9;

interface Props {
  formData: FormData;
  pedidoId: string;
  onPaymentConfirmed: (pedidoId: string) => void;
}

const StepPagamento = ({ formData, pedidoId, onPaymentConfirmed }: Props) => {
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [copied, setCopied] = useState(false);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [loadingPix, setLoadingPix] = useState(true);
  const [pixError, setPixError] = useState<string | null>(null);
  const paymentApproved = usePaymentStatus(pedidoId);

  const selected = diasOpcoes.find((d) => d.label === formData.diasAfastamento);
  const basePrice = selected?.valor || 39.9;

  let amount = basePrice;
  if (formData.addonCid) amount += ADDON_CID_PRICE;
  if (formData.addonQrCode) amount += ADDON_QR_PRICE;
  if (formData.addonPacote3) amount += ADDON_PACOTE_PRICE;

  const precoLabel = `R$ ${amount.toFixed(2).replace(".", ",")}`;

  const createPixTransaction = async () => {
    setLoadingPix(true);
    setPixError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-pix", {
        body: { amount, pedidoId, nomeCompleto: formData.nomeCompleto, cpf: formData.cpf, email: formData.email, telefone: formData.telefone },
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

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="space-y-6">
      {/* Banner verde estilo justmedatestados */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 shadow-lg shadow-primary/20">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -right-2 bottom-0 w-20 h-20 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white/20 backdrop-blur rounded-lg px-2.5 py-1 flex items-center gap-1.5">
              <svg viewBox="0 0 512 512" className="w-3.5 h-3.5" fill="currentColor">
                <path d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 372.6 391.5 392.6 391.5H407.7L293.6 505.6C275.2 524 245.7 524 227.3 505.6L112.8 391.1H126.4C146.4 391.1 165.3 383.3 179.5 369.1L242.4 292.5Z" />
                <path d="M262.5 219.5C257.1 224.9 247.8 224.9 242.4 219.5L179.5 142.9C165.3 128.7 146.4 120.9 126.4 120.9H112.8L227.3 6.4C245.7-12 275.2-12 293.6 6.4L407.7 120.5H392.6C372.6 120.5 353.7 128.3 339.5 142.5L262.5 219.5Z" />
              </svg>
              <span className="text-[10px] font-bold tracking-wider">PIX</span>
            </div>
            <span className="text-[11px] font-medium opacity-90">Pagamento instantâneo</span>
          </div>
          <p className="text-xs opacity-90 mb-1">Valor a pagar</p>
          <p className="text-4xl font-extrabold tracking-tight">{precoLabel}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs opacity-95">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Atestado liberado automaticamente após o pagamento
          </div>
        </div>
      </div>

      {/* Passos */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { n: 1, icon: Smartphone, label: "Abra seu app do banco" },
          { n: 2, icon: QrCode, label: "Escaneie ou copie o código" },
          { n: 3, icon: CheckCircle2, label: "Confirme o pagamento" },
        ].map((s) => (
          <div key={s.n} className="bg-muted/40 border border-border/60 rounded-xl p-3 text-center">
            <div className="w-7 h-7 mx-auto rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mb-1.5">{s.n}</div>
            <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] leading-tight text-foreground font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* QR Code */}
      <div className="bg-card border-2 border-primary/15 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-center text-foreground">Escaneie o QR Code com a câmera do app</p>
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-primary/30 min-h-[252px] min-w-[252px] flex items-center justify-center">
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
          <div className="flex items-center justify-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Expira em</span>
            <span className="font-bold text-primary tabular-nums">{mins}:{secs}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs text-destructive font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> PIX expirado
          </div>
        )}

        <button type="button" onClick={() => createPixTransaction()} disabled={loadingPix}
          className="w-full inline-flex items-center justify-center gap-2 text-xs text-primary font-semibold hover:underline disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loadingPix ? "animate-spin" : ""}`} />
          Gerar novo código PIX
        </button>
      </div>

      {/* Copia e cola */}
      {pixCode && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">PIX Copia e Cola</p>
            <span className="text-[10px] text-muted-foreground">Mais prático no celular</span>
          </div>
          <div className="bg-muted rounded-xl p-3 text-[11px] text-muted-foreground break-all font-mono max-h-20 overflow-y-auto border border-border/60">{pixCode}</div>
          <button type="button" onClick={handleCopy} disabled={timeLeft === 0}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${copied ? "bg-green-600 text-white" : "bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20"} disabled:opacity-50`}>
            {copied ? (<><Check className="w-4 h-4" />Código copiado!</>) : (<><Copy className="w-4 h-4" />Copiar código PIX</>)}
          </button>
        </div>
      )}

      {/* Aguardando */}
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

export default StepPagamento;
