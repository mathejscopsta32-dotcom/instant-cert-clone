import { useState, useEffect, useRef } from "react";
import { Check, Clock, Copy, ShieldCheck, AlertCircle, RefreshCw, Upload, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { FormData } from "@/pages/Solicitar";
import { diasOpcoes } from "./StepDetalhes";
import { generatePixPayload } from "@/lib/pix";
import { supabase } from "@/integrations/supabase/client";
import { generateAtestadoPDF } from "@/lib/generateAtestadoPDF";

const ADDON_CID_PRICE = 9.9;
const ADDON_QR_PRICE = 9.9;
const ADDON_PACOTE_PRICE = 39.9;

interface Props {
  formData: FormData;
  onPaymentConfirmed: (pedidoId: string) => void;
}

const FALLBACK_PIX_KEY = "566a023b-14b4-4306-aed5-a05f4ec92d26";

const StepPagamento = ({ formData, onPaymentConfirmed }: Props) => {
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pixKey, setPixKey] = useState(FALLBACK_PIX_KEY);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch PIX key from settings
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

  const selected = diasOpcoes.find((d) => d.label === formData.diasAfastamento);
  const basePrice = selected?.valor || 39.9;

  let amount = basePrice;
  if (formData.addonCid) amount += ADDON_CID_PRICE;
  if (formData.addonQrCode) amount += ADDON_QR_PRICE;
  if (formData.addonPacote3) amount += ADDON_PACOTE_PRICE;

  const precoLabel = `R$ ${amount.toFixed(2).replace(".", ",")}`;

  const pixPayload = generatePixPayload({
    pixKey: pixKey,
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

  const handleRegenerate = () => {
    setTimeLeft(30 * 60);
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

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmitPayment = async () => {
    setSubmitting(true);
    try {
      let comprovanteUrl: string | null = null;

      // Upload comprovante if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("comprovantes")
          .upload(filePath, selectedFile);
        if (!uploadError) {
          comprovanteUrl = filePath;
        }
      }

      // Generate PDF and upload to storage
      let pdfUrl: string | null = null;
      try {
        const doc = await generateAtestadoPDF(formData);
        const pdfBlob = doc.output("blob");
        const pdfPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;
        const { error: pdfUploadError } = await supabase.storage
          .from("atestados")
          .upload(pdfPath, pdfBlob, { contentType: "application/pdf" });
        if (!pdfUploadError) {
          pdfUrl = pdfPath;
        }
      } catch (pdfErr) {
        console.warn("Erro ao gerar/upload PDF:", pdfErr);
      }

      // Insert order — auto-approve if comprovante was uploaded
      const pedidoId = crypto.randomUUID();
      const orderStatus = comprovanteUrl ? "aprovado" : "pendente";
      const { error } = await supabase.from("pedidos").insert({
        id: pedidoId,
        nome_completo: formData.nomeCompleto,
        cpf: formData.cpf,
        email: formData.email,
        telefone: formData.telefone,
        data_nascimento: formData.dataNascimento || null,
        sintomas: formData.sintomas,
        outros_sintomas: formData.outrosSintomas || null,
        inicio_sintomas: formData.inicioSintomas || null,
        inicio_sintomas_data: formData.inicioSintomasData?.toISOString() || null,
        dias_afastamento: formData.diasAfastamento || null,
        observacoes: formData.observacoes || null,
        hospital_preferencia: formData.hospitalPreferencia || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        addon_cid: formData.addonCid,
        addon_qr_code: formData.addonQrCode,
        addon_pacote3: formData.addonPacote3,
        valor_total: amount,
        comprovante_url: comprovanteUrl,
        status: orderStatus,
        pdf_url: pdfUrl,
      } as any);

      if (error) throw error;
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
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl">₱</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Pagamento via PIX</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Seu atestado será liberado após a confirmação do pagamento.
        </p>
      </div>

      {/* Valor Total */}
      <div className="bg-secondary/50 rounded-xl p-4 text-center">
        <p className="text-xs text-muted-foreground font-medium mb-1">Valor Total</p>
        <p className="text-3xl font-extrabold text-primary">{precoLabel}</p>
      </div>

      {/* QR Code */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground text-center">
          Escaneie o QR Code abaixo:
        </p>
        <div className="flex justify-center">
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <QRCodeSVG value={pixPayload} size={220} level="M" />
          </div>
        </div>

        {/* Timer */}
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

        {/* Regenerate */}
        <button
          type="button"
          onClick={handleRegenerate}
          className="w-full inline-flex items-center justify-center gap-2 text-sm text-primary font-semibold hover:underline"
        >
          <RefreshCw className="w-4 h-4" />
          Gerar novo código PIX
        </button>
      </div>

      {/* Copia e Cola */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Ou copie e cole o código:</p>
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
              Copiar
            </>
          )}
        </button>
      </div>

      {/* Aviso importante */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 font-medium">
          Envie o comprovante logo após o pagamento para agilizar a entrega do seu atestado!
        </p>
      </div>

      {/* Enviar comprovante */}
      <div className="bg-muted rounded-xl p-4 space-y-3">
        <div>
          <p className="text-sm font-bold text-foreground">Enviar Comprovante de Pagamento</p>
          <p className="text-xs text-muted-foreground mt-1">
            Após realizar o PIX, envie o comprovante para agilizar a liberação do seu atestado.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleFileSelect}
          className="w-full inline-flex items-center justify-center gap-2 border border-border text-foreground px-4 py-3 rounded-xl font-semibold text-sm hover:bg-secondary transition-colors"
        >
          <Upload className="w-4 h-4" />
          {selectedFile ? selectedFile.name : "Selecionar Arquivo"}
        </button>
      </div>

      {/* Aviso comprovante obrigatório */}
      {!selectedFile && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">
            Para confirmar o pagamento, é obrigatório enviar o comprovante. Selecione o arquivo acima antes de continuar.
          </p>
        </div>
      )}

      {/* Já fiz o pagamento */}
      <button
        type="button"
        onClick={handleSubmitPayment}
        disabled={timeLeft === 0 || submitting || !selectedFile}
        className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando pedido...
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            Já fiz o pagamento
          </>
        )}
      </button>

      {/* Footer badges */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Pagamento 100% Seguro
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-4 h-4 text-primary" />
          Liberação em Minutos
        </div>
      </div>
    </div>
  );
};

export default StepPagamento;
