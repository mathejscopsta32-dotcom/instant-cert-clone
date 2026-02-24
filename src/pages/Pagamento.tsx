import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, Clock, Copy, ShieldCheck, QrCode, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import type { FormData } from "@/pages/Solicitar";
import { diasOpcoes } from "@/components/solicitar/StepDetalhes";

const PIX_KEY = "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540529.005802BR5925ATESTADO24H SERVICOS MED6009SAO PAULO62070503***6304";

const Pagamento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.formData as FormData | undefined;

  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    if (!formData) {
      navigate("/solicitar");
      return;
    }

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
  }, [formData, navigate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = PIX_KEY;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleConfirmPayment = () => {
    setPaymentConfirmed(true);
  };

  const precoSelecionado = diasOpcoes.find(d => d.label === formData?.diasAfastamento)?.preco || "R$ 29,99";

  if (!formData) return null;

  if (paymentConfirmed) {
    return (
      <div className="min-h-screen bg-hero">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Pagamento em Análise!</h1>
            <p className="text-muted-foreground mb-6">
              Seu pagamento está sendo processado. Assim que confirmado, seu atestado será
              enviado para o e-mail <strong className="text-foreground">{formData.email}</strong> em poucos minutos.
            </p>
            <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground mb-6">
              <p>
                Caso não receba em até 30 minutos, verifique sua caixa de spam ou entre em contato
                com nosso suporte.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 bg-badge text-badge-foreground text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Pagamento Seguro
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Pagamento via PIX
          </h1>
          <p className="text-muted-foreground mt-2">
            Escaneie o QR Code ou copie o código PIX para realizar o pagamento.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code / PIX */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            {/* Timer */}
            <div className={`flex items-center justify-center gap-2 mb-6 px-4 py-2.5 rounded-xl text-sm font-semibold ${
              timeLeft < 300 ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground"
            }`}>
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

            {/* QR Code placeholder */}
            <div className="flex justify-center mb-6">
              <div className="w-52 h-52 bg-muted rounded-2xl flex items-center justify-center border-2 border-dashed border-border">
                <QrCode className="w-32 h-32 text-foreground" />
              </div>
            </div>

            {/* Copy PIX */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center font-medium">PIX Copia e Cola</p>
              <div className="bg-muted rounded-xl p-3 text-xs text-muted-foreground break-all font-mono max-h-20 overflow-y-auto">
                {PIX_KEY}
              </div>
              <button
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
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4">Resumo do Pedido</h3>

              <div className="space-y-3 text-sm">
                <Row label="Nome" value={formData.nomeCompleto} />
                <Row label="CPF" value={formData.cpf} />
                <Row label="E-mail" value={formData.email} />
                <Row label="Afastamento" value={formData.diasAfastamento} />
              </div>

              <div className="border-t mt-4 pt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className="text-2xl font-extrabold text-primary">{precoSelecionado}</span>
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirmPayment}
              disabled={timeLeft === 0}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              <Check className="w-4 h-4" />
              Já realizei o pagamento
            </button>

            {/* Info */}
            <div className="bg-muted rounded-xl p-4 space-y-2">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                Pagamento processado com segurança. Seus dados são protegidos por criptografia.
              </p>
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                Após confirmação do pagamento, o atestado é enviado em até 5 minutos para seu e-mail.
              </p>
            </div>
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

export default Pagamento;
