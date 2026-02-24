import { useState, useEffect } from "react";
import { Check, Clock, Copy, ShieldCheck, AlertCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { FormData } from "@/pages/Solicitar";
import { diasOpcoes } from "./StepDetalhes";
import { generatePixPayload } from "@/lib/pix";

interface Props {
  formData: FormData;
  onPaymentConfirmed: () => void;
}

const PIX_KEY = "c3a20682-cc6f-4a3c-ae81-982b97780dc6";

const StepPagamento = ({ formData, onPaymentConfirmed }: Props) => {
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [copied, setCopied] = useState(false);

  const selected = diasOpcoes.find((d) => d.label === formData.diasAfastamento);
  const amount = selected?.valor || 39.9;
  const precoLabel = selected?.preco || "R$ 39,90";

  const pixPayload = generatePixPayload({
    pixKey: PIX_KEY,
    merchantName: "ATESTADO24H",
    merchantCity: "SAO PAULO",
    amount,
    description: "Atestado Medico",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground mb-1">Pagamento via PIX</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Escaneie o QR Code ou copie o código PIX para realizar o pagamento.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="space-y-4">
          {/* Timer */}
          <div
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
              timeLeft < 300
                ? "bg-destructive/10 text-destructive"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {timeLeft > 0 ? (
              <>
                <Clock className="w-4 h-4" />
                Expira em {formatTime(timeLeft)}
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                PIX expirado — solicite novamente
              </>
            )}
          </div>

          {/* QR Code real */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-2xl">
              <QRCodeSVG value={pixPayload} size={200} level="M" />
            </div>
          </div>

          {/* Copy PIX */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center font-medium">
              PIX Copia e Cola
            </p>
            <div className="bg-muted rounded-xl p-3 text-xs text-muted-foreground break-all font-mono max-h-20 overflow-y-auto">
              {pixPayload}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={timeLeft === 0}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                copied
                  ? "bg-primary text-primary-foreground"
                  : "border border-primary text-primary hover:bg-secondary"
              } disabled:opacity-50`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Código copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar código PIX
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resumo */}
        <div className="space-y-4">
          <div className="bg-muted rounded-xl p-4 space-y-3 text-sm">
            <h3 className="font-bold text-foreground">Resumo</h3>
            <Row label="Nome" value={formData.nomeCompleto} />
            <Row label="CPF" value={formData.cpf} />
            <Row label="E-mail" value={formData.email} />
            <Row label="Afastamento" value={formData.diasAfastamento} />
          </div>

          <div className="bg-secondary rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total</span>
            <span className="text-2xl font-extrabold text-primary">{precoLabel}</span>
          </div>

          <button
            type="button"
            onClick={onPaymentConfirmed}
            disabled={timeLeft === 0}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            <Check className="w-4 h-4" />
            Já realizei o pagamento
          </button>

          <div className="bg-muted rounded-xl p-4 space-y-2">
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              Pagamento processado com segurança. Seus dados são protegidos por criptografia.
            </p>
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              Após confirmação, o atestado é enviado em até 5 minutos para seu e-mail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium text-right max-w-[55%] break-words">{value}</span>
  </div>
);

export default StepPagamento;
