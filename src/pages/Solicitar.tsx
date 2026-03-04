import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, User, FileText, Stethoscope, CreditCard, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import GlobalIframe from "@/components/GlobalIframe";
import StepDadosPessoais from "@/components/solicitar/StepDadosPessoais";
import StepSintomas from "@/components/solicitar/StepSintomas";
import StepDetalhes from "@/components/solicitar/StepDetalhes";
import StepRevisao from "@/components/solicitar/StepRevisao";
import StepPagamento from "@/components/solicitar/StepPagamento";
import { supabase } from "@/integrations/supabase/client";
import { generateAtestadoPDF } from "@/lib/generateAtestadoPDF";
import { diasOpcoes } from "@/components/solicitar/StepDetalhes";


export interface FormData {
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  sintomas: string[];
  outrosSintomas: string;
  inicioSintomas: string;
  inicioSintomasData: Date | undefined;
  diasAfastamento: string;
  observacoes: string;
  hospitalPreferencia: string;
  cidade: string;
  estado: string;
  addonCid: boolean;
  addonQrCode: boolean;
  addonPacote3: boolean;
  aceitaTermos: boolean;
  medicoSelecionado: string;
}

const initialFormData: FormData = {
  nomeCompleto: "",
  cpf: "",
  email: "",
  telefone: "",
  dataNascimento: "",
  sintomas: [],
  outrosSintomas: "",
  inicioSintomas: "",
  inicioSintomasData: undefined,
  diasAfastamento: "",
  observacoes: "",
  hospitalPreferencia: "",
  cidade: "",
  estado: "",
  addonCid: false,
  addonQrCode: false,
  addonPacote3: false,
  aceitaTermos: false,
  medicoSelecionado: "",
};

const stepsMeta = [
  { icon: User, label: "Dados Pessoais" },
  { icon: Stethoscope, label: "Sintomas" },
  { icon: FileText, label: "Detalhes" },
  { icon: CheckCircle2, label: "Revisão" },
  { icon: CreditCard, label: "Pagamento" },
];

const TOTAL_STEPS = 5;

const STORAGE_KEY = "solicitar_atestado_state";

const Solicitar = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(() => {
    try { const s = sessionStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s).currentStep ?? 0 : 0; } catch { return 0; }
  });
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const s = sessionStorage.getItem(STORAGE_KEY);
      if (s) {
        const parsed = JSON.parse(s);
        return { ...initialFormData, ...parsed.formData, inicioSintomasData: parsed.formData?.inicioSintomasData ? new Date(parsed.formData.inicioSintomasData) : undefined };
      }
      return initialFormData;
    } catch { return initialFormData; }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [pedidoId, setPedidoId] = useState<string | null>(() => {
    try { const s = sessionStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s).pedidoId ?? null : null; } catch { return null; }
  });
  const navigate = useNavigate();

  // Read medico from URL on mount
  useEffect(() => {
    const medico = searchParams.get("medico");
    if (medico && !formData.medicoSelecionado) {
      setFormData(prev => ({ ...prev, medicoSelecionado: medico }));
    }
  }, [searchParams]);

  // Persist state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ currentStep, formData, pedidoId }));
  }, [currentStep, formData, pedidoId]);

  const updateForm = (updates: Partial<FormData>) => {
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
      if (formData.sintomas.length === 0 && !formData.outrosSintomas.trim()) {
        newErrors.sintomas = "Selecione pelo menos um sintoma ou descreva seus sintomas";
      }
    }

    if (step === 2) {
      if (!formData.inicioSintomas) newErrors.inicioSintomas = "Selecione quando começaram os sintomas";
      if (formData.inicioSintomas === "personalizado" && !formData.inicioSintomasData) newErrors.inicioSintomasData = "Selecione a data personalizada";
      if (!formData.diasAfastamento) newErrors.diasAfastamento = "Selecione os dias de afastamento";
      if (!formData.cidade.trim()) newErrors.cidade = "Cidade é obrigatória";
      if (!formData.estado) newErrors.estado = "Estado é obrigatório";
      if (!formData.hospitalPreferencia) newErrors.hospitalPreferencia = "Selecione um hospital";
    }

    if (step === 3) {
      if (!formData.aceitaTermos) newErrors.aceitaTermos = "Você precisa aceitar os termos para continuar";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createPedido = async () => {
    setCreatingOrder(true);
    try {
      const ADDON_CID_PRICE = 9.9;
      const ADDON_QR_PRICE = 9.9;
      const ADDON_PACOTE_PRICE = 39.9;
      const selected = diasOpcoes.find((d) => d.label === formData.diasAfastamento);
      const basePrice = selected?.valor || 39.9;
      let amount = basePrice;
      if (formData.addonCid) amount += ADDON_CID_PRICE;
      if (formData.addonQrCode) amount += ADDON_QR_PRICE;
      if (formData.addonPacote3) amount += ADDON_PACOTE_PRICE;

      let pdfUrl: string | null = null;
      try {
        const doc = await generateAtestadoPDF(formData);
        const pdfBlob = doc.output("blob");
        const pdfPath = `${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;
        const { error: pdfUploadError } = await supabase.storage
          .from("atestados")
          .upload(pdfPath, pdfBlob, { contentType: "application/pdf" });
        if (!pdfUploadError) pdfUrl = pdfPath;
      } catch (pdfErr) {
        console.warn("Erro ao gerar/upload PDF:", pdfErr);
      }

      const { data, error } = await supabase.rpc("upsert_pedido", {
        p_cpf: formData.cpf,
        p_tipo: "atestado",
        p_nome_completo: formData.nomeCompleto,
        p_email: formData.email,
        p_telefone: formData.telefone,
        p_data_nascimento: formData.dataNascimento || null,
        p_cidade: formData.cidade || null,
        p_estado: formData.estado || null,
        p_valor_total: amount,
        p_sintomas: formData.sintomas,
        p_outros_sintomas: formData.outrosSintomas || null,
        p_inicio_sintomas: formData.inicioSintomas || null,
        p_inicio_sintomas_data: formData.inicioSintomasData?.toISOString() || null,
        p_dias_afastamento: formData.diasAfastamento || null,
        p_observacoes: formData.observacoes || null,
        p_hospital_preferencia: formData.hospitalPreferencia || null,
        p_addon_cid: formData.addonCid,
        p_addon_qr_code: formData.addonQrCode,
        p_addon_pacote3: formData.addonPacote3,
        p_pdf_url: pdfUrl,
      } as any);

      if (error) throw error;
      setPedidoId(data as string);
      setCurrentStep(4);
    } catch (err) {
      console.error("Erro ao criar pedido:", err);
      alert("Erro ao criar pedido. Tente novamente.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        createPedido();
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handlePaymentConfirmed = (pedidoId: string) => {
    sessionStorage.removeItem(STORAGE_KEY);
    try {
      localStorage.setItem(`pedido_form_${pedidoId}`, JSON.stringify(formData));
    } catch (error) {
      console.warn("Não foi possível salvar os dados localmente:", error);
    }
    window.location.href = `/meu-pedido?id=${pedidoId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 via-background to-background">
      <Navbar />
      <GlobalIframe />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Seguro e Confidencial
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Solicitar Atestado Médico
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Preencha o formulário abaixo para solicitar seu atestado médico online.
          </p>
        </div>

        {/* Progress Steps — pill-style */}
        <div className="relative mb-10">
          {/* Background track */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-10 sm:mx-16" />
          {/* Active track */}
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 mx-10 sm:mx-16"
            style={{
              width: `${(currentStep / (TOTAL_STEPS - 1)) * 100}%`,
              maxWidth: `calc(100% - ${window.innerWidth >= 640 ? 128 : 80}px)`,
            }}
          />

          <div className="relative flex items-start justify-between">
            {stepsMeta.map((step, i) => (
              <div key={i} className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    i < currentStep
                      ? "bg-primary text-primary-foreground scale-100"
                      : i === currentStep
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110"
                      : "bg-card text-muted-foreground border-2 border-border"
                  }`}
                >
                  {i < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-[11px] mt-2 font-medium hidden sm:block transition-colors ${
                    i <= currentStep ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step counter (mobile) */}
        <p className="sm:hidden text-center text-xs text-muted-foreground mb-4 font-medium">
          Etapa {currentStep + 1} de {TOTAL_STEPS} — {stepsMeta[currentStep].label}
        </p>

        {/* Form Card */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-10 shadow-lg shadow-primary/5">
          {currentStep === 0 && (
            <StepDadosPessoais formData={formData} updateForm={updateForm} errors={errors} />
          )}
          {currentStep === 1 && (
            <StepSintomas formData={formData} updateForm={updateForm} errors={errors} />
          )}
          {currentStep === 2 && (
            <StepDetalhes formData={formData} updateForm={updateForm} errors={errors} />
          )}
          {currentStep === 3 && (
            <StepRevisao
              formData={formData}
              updateForm={updateForm}
              onFinalize={handleNext}
              errors={errors}
            />
          )}
          {currentStep === 4 && pedidoId && (
            <StepPagamento formData={formData} pedidoId={pedidoId} onPaymentConfirmed={handlePaymentConfirmed} />
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
              {currentStep > 0 ? (
                <button
                  onClick={handlePrev}
                  className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-muted transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              ) : (
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-muted transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Início
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all text-sm shadow-md shadow-primary/20"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={creatingOrder}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-xl font-semibold hover:opacity-90 transition-all text-sm shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {creatingOrder ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Criando pedido...</>
                  ) : (
                    <>Finalizar Pedido <CreditCard className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Dados protegidos (LGPD)
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            Médicos com CRM ativo
          </span>
        </div>
      </div>
    </div>
  );
};

export default Solicitar;
