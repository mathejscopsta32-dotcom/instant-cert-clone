import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, User, CreditCard, Video, Stethoscope, ClipboardList } from "lucide-react";
import Navbar from "@/components/Navbar";
import StepDadosPessoais from "@/components/solicitar/StepDadosPessoais";
import StepSintomasConsulta from "@/components/solicitar/StepSintomasConsulta";
import StepPerguntasMedicas from "@/components/solicitar/StepPerguntasMedicas";
import StepRevisaoConsulta from "@/components/solicitar/StepRevisaoConsulta";
import StepPagamentoConsulta from "@/components/solicitar/StepPagamentoConsulta";

export interface ConsultaFormData {
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  cidade: string;
  estado: string;
  // Sintomas
  sintomas: string[];
  outrosSintomas: string;
  // Perguntas médicas
  inicioSintomas: string;
  intensidade: string;
  tomaMedicamento: string;
  medicamentos: string;
  possuiDoencaCronica: string;
  doencasCronicas: string;
  possuiAlergia: string;
  alergias: string;
  observacoes: string;
  // Revisão
  aceitaTermos: boolean;
}

const initialFormData: ConsultaFormData = {
  nomeCompleto: "",
  cpf: "",
  email: "",
  telefone: "",
  dataNascimento: "",
  cidade: "",
  estado: "",
  sintomas: [],
  outrosSintomas: "",
  inicioSintomas: "",
  intensidade: "",
  tomaMedicamento: "",
  medicamentos: "",
  possuiDoencaCronica: "",
  doencasCronicas: "",
  possuiAlergia: "",
  alergias: "",
  observacoes: "",
  aceitaTermos: false,
};

const stepsMeta = [
  { icon: User, label: "Dados Pessoais" },
  { icon: Stethoscope, label: "Sintomas" },
  { icon: ClipboardList, label: "Avaliação" },
  { icon: CheckCircle2, label: "Revisão" },
  { icon: CreditCard, label: "Pagamento" },
];

const TOTAL_STEPS = 5;

const SolicitarConsulta = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ConsultaFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const updateForm = (updates: Partial<ConsultaFormData>) => {
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
      if (!formData.intensidade) newErrors.intensidade = "Selecione a intensidade dos sintomas";
    }

    if (step === 3) {
      if (!formData.aceitaTermos) newErrors.aceitaTermos = "Você precisa aceitar os termos para continuar";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handlePaymentConfirmed = (pedidoId: string) => {
    window.location.href = `/meu-pedido?id=${pedidoId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 via-background to-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-5 shadow-sm">
            <Video className="w-3.5 h-3.5" />
            Consulta Online 24/7
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Consulta Médica Online
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Consulte com um médico online por apenas <span className="text-primary font-bold">R$ 29,90</span>.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="relative mb-10">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-10 sm:mx-16" />
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
            <StepDadosPessoais formData={formData as any} updateForm={updateForm as any} errors={errors} />
          )}
          {currentStep === 1 && (
            <StepSintomasConsulta formData={formData} updateForm={updateForm} errors={errors} />
          )}
          {currentStep === 2 && (
            <StepPerguntasMedicas formData={formData} updateForm={updateForm} errors={errors} />
          )}
          {currentStep === 3 && (
            <StepRevisaoConsulta formData={formData} updateForm={updateForm} errors={errors} />
          )}
          {currentStep === 4 && (
            <StepPagamentoConsulta formData={formData} onPaymentConfirmed={handlePaymentConfirmed} />
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
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-xl font-semibold hover:opacity-90 transition-all text-sm shadow-md shadow-primary/20"
                >
                  Finalizar Pedido
                  <CreditCard className="w-4 h-4" />
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

export default SolicitarConsulta;
