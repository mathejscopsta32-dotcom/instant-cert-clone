import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, User, CreditCard, Waves, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import GlobalIframe from "@/components/GlobalIframe";
import StepDadosPessoais from "@/components/solicitar/StepDadosPessoais";
import StepPagamento from "@/components/solicitar/StepPagamento";
import { supabase } from "@/integrations/supabase/client";
import { generatePiscinaPDF } from "@/lib/generatePiscinaPDF";
import type { FormData } from "@/pages/Solicitar";

export interface PiscinaFormData {
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  cidade: string;
  estado: string;
  aceitaTermos: boolean;
}

const initialFormData: PiscinaFormData = {
  nomeCompleto: "",
  cpf: "",
  email: "",
  telefone: "",
  dataNascimento: "",
  cidade: "",
  estado: "",
  aceitaTermos: false,
};

const stepsMeta = [
  { icon: User, label: "Dados Pessoais" },
  { icon: CheckCircle2, label: "Revisão" },
  { icon: CreditCard, label: "Pagamento" },
];

const TOTAL_STEPS = 3;
const STORAGE_KEY = "solicitar_piscina_state";
const PRICE = 29.9;

const SolicitarPiscina = () => {
  const [currentStep, setCurrentStep] = useState(() => {
    try { const s = sessionStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s).currentStep ?? 0 : 0; } catch { return 0; }
  });
  const [formData, setFormData] = useState<PiscinaFormData>(() => {
    try {
      const s = sessionStorage.getItem(STORAGE_KEY);
      if (s) return { ...initialFormData, ...JSON.parse(s).formData };
      return initialFormData;
    } catch { return initialFormData; }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [pedidoId, setPedidoId] = useState<string | null>(() => {
    try { const s = sessionStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s).pedidoId ?? null : null; } catch { return null; }
  });
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ currentStep, formData, pedidoId }));
  }, [currentStep, formData, pedidoId]);

  const updateForm = (updates: Partial<PiscinaFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach((key) => delete clearedErrors[key]);
    setErrors(clearedErrors);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.nomeCompleto.trim()) newErrors.nomeCompleto = "Nome é obrigatório";
      else if (formData.nomeCompleto.trim().length < 3) newErrors.nomeCompleto = "Nome deve ter pelo menos 3 caracteres";
      const cpfClean = formData.cpf.replace(/\D/g, "");
      if (!cpfClean) newErrors.cpf = "CPF é obrigatório";
      else if (cpfClean.length !== 11) newErrors.cpf = "CPF deve ter 11 dígitos";
      if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "E-mail inválido";
      const telClean = formData.telefone.replace(/\D/g, "");
      if (!telClean) newErrors.telefone = "Telefone é obrigatório";
      else if (telClean.length < 10) newErrors.telefone = "Telefone inválido";
      if (!formData.dataNascimento) newErrors.dataNascimento = "Data de nascimento é obrigatória";
    }
    if (step === 1) {
      if (!formData.aceitaTermos) newErrors.aceitaTermos = "Você precisa aceitar os termos";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createPedido = async () => {
    setCreatingOrder(true);
    try {
      let pdfUrl: string | null = null;
      try {
        const doc = await generatePiscinaPDF(formData);
        const pdfBlob = doc.output("blob");
        const pdfPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;
        const { error: pdfUploadError } = await supabase.storage
          .from("atestados")
          .upload(pdfPath, pdfBlob, { contentType: "application/pdf" });
        if (!pdfUploadError) pdfUrl = pdfPath;
      } catch (pdfErr) {
        console.warn("Erro ao gerar PDF piscina:", pdfErr);
      }

      const { data, error } = await supabase.rpc("upsert_pedido", {
        p_cpf: formData.cpf,
        p_tipo: "piscina",
        p_nome_completo: formData.nomeCompleto,
        p_email: formData.email,
        p_telefone: formData.telefone,
        p_data_nascimento: formData.dataNascimento || null,
        p_cidade: formData.cidade || null,
        p_estado: formData.estado || null,
        p_valor_total: PRICE,
        p_pdf_url: pdfUrl,
      } as any);

      if (error) throw error;
      setPedidoId(data as string);
      setCurrentStep(2);
    } catch (err) {
      console.error("Erro ao criar pedido:", err);
      alert("Erro ao criar pedido. Tente novamente.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) createPedido();
      else setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    }
  };

  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handlePaymentConfirmed = (id: string) => {
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.href = `/meu-pedido?id=${id}`;
  };

  // Create a compatible FormData for StepPagamento
  const paymentFormData: FormData = {
    ...formData,
    sintomas: [],
    outrosSintomas: "",
    inicioSintomas: "",
    inicioSintomasData: undefined,
    diasAfastamento: "",
    observacoes: "",
    hospitalPreferencia: "",
    addonCid: false,
    addonQrCode: false,
    addonPacote3: false,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 via-background to-background">
      <Navbar />
      <GlobalIframe />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-cyan-500/10 text-cyan-600 text-xs font-semibold px-4 py-2 rounded-full mb-5">
            <Waves className="w-3.5 h-3.5" />
            Atestado para Piscina
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Atestado Dermatológico para Piscina
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Atestado de aptidão para atividades aquáticas por apenas <span className="text-primary font-bold">R$ 29,90</span>.
          </p>
        </div>

        {/* Progress */}
        <div className="relative mb-10">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-10 sm:mx-16" />
          <div className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 mx-10 sm:mx-16"
            style={{ width: `${(currentStep / (TOTAL_STEPS - 1)) * 100}%`, maxWidth: `calc(100% - ${window.innerWidth >= 640 ? 128 : 80}px)` }} />
          <div className="relative flex items-start justify-between">
            {stepsMeta.map((step, i) => (
              <div key={i} className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                  i < currentStep ? "bg-primary text-primary-foreground" : i === currentStep ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110" : "bg-card text-muted-foreground border-2 border-border"
                }`}>
                  {i < currentStep ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                </div>
                <span className={`text-[11px] mt-2 font-medium hidden sm:block ${i <= currentStep ? "text-primary" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-10 shadow-lg shadow-primary/5">
          {currentStep === 0 && (
            <StepDadosPessoais formData={formData as any} updateForm={updateForm as any} errors={errors} />
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Revisão do Pedido</h2>
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-sm">
                <p><strong className="text-foreground">Nome:</strong> <span className="text-muted-foreground">{formData.nomeCompleto}</span></p>
                <p><strong className="text-foreground">CPF:</strong> <span className="text-muted-foreground">{formData.cpf}</span></p>
                <p><strong className="text-foreground">E-mail:</strong> <span className="text-muted-foreground">{formData.email}</span></p>
                <p><strong className="text-foreground">Telefone:</strong> <span className="text-muted-foreground">{formData.telefone}</span></p>
                <p><strong className="text-foreground">Data de Nascimento:</strong> <span className="text-muted-foreground">{formData.dataNascimento}</span></p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4">
                <p className="text-sm font-bold text-foreground mb-1">Serviço</p>
                <p className="text-sm text-muted-foreground">Atestado Dermatológico para Piscina e Atividade Aquática</p>
                <p className="text-lg font-extrabold text-primary mt-2">R$ 29,90</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.aceitaTermos}
                  onChange={(e) => updateForm({ aceitaTermos: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  Li e aceito os <a href="/termos-de-uso" target="_blank" className="text-primary underline">Termos de Uso</a> e a{" "}
                  <a href="/politica-de-privacidade" target="_blank" className="text-primary underline">Política de Privacidade</a>.
                </span>
              </label>
              {errors.aceitaTermos && <p className="text-destructive text-sm">{errors.aceitaTermos}</p>}
            </div>
          )}

          {currentStep === 2 && pedidoId && (
            <StepPagamento formData={paymentFormData} pedidoId={pedidoId} onPaymentConfirmed={handlePaymentConfirmed} />
          )}

          {currentStep < 2 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
              {currentStep > 0 ? (
                <button onClick={handlePrev} className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-muted transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
              ) : (
                <button onClick={() => navigate("/selecionar-servico")} className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-muted transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={creatingOrder}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all text-sm shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {creatingOrder ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Criando pedido...</>
                ) : currentStep === 1 ? (
                  <>Finalizar Pedido <CreditCard className="w-4 h-4" /></>
                ) : (
                  <>Próximo <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Dados protegidos (LGPD)</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Médicos com CRM ativo</span>
        </div>
      </div>
    </div>
  );
};

export default SolicitarPiscina;
