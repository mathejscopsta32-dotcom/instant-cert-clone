import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, User, FileText, Stethoscope, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar";
import StepDadosPessoais from "@/components/solicitar/StepDadosPessoais";
import StepSintomas from "@/components/solicitar/StepSintomas";
import StepDetalhes from "@/components/solicitar/StepDetalhes";
import StepRevisao from "@/components/solicitar/StepRevisao";

export interface FormData {
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  sintomas: string[];
  outrosSintomas: string;
  finalidade: string;
  dataInicio: Date | undefined;
  diasAfastamento: string;
  observacoes: string;
}

const initialFormData: FormData = {
  nomeCompleto: "",
  cpf: "",
  email: "",
  telefone: "",
  dataNascimento: "",
  sintomas: [],
  outrosSintomas: "",
  finalidade: "",
  dataInicio: undefined,
  diasAfastamento: "",
  observacoes: "",
};

const stepsMeta = [
  { icon: User, label: "Dados Pessoais" },
  { icon: Stethoscope, label: "Sintomas" },
  { icon: FileText, label: "Detalhes" },
  { icon: CreditCard, label: "Revisão" },
];

const Solicitar = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const updateForm = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
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
      if (!formData.finalidade) newErrors.finalidade = "Selecione a finalidade";
      if (!formData.dataInicio) newErrors.dataInicio = "Selecione a data de início";
      if (!formData.diasAfastamento) newErrors.diasAfastamento = "Selecione os dias de afastamento";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    alert("Solicitação enviada com sucesso! Você receberá um e-mail com as instruções de pagamento.");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-hero">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 bg-badge text-badge-foreground text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Seguro e Confidencial
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Solicitar Atestado Médico
          </h1>
          <p className="text-muted-foreground mt-2">
            Preencha o formulário abaixo para solicitar seu atestado médico online.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10">
          {stepsMeta.map((step, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      i <= currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    i < currentStep
                      ? "bg-primary text-primary-foreground"
                      : i === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {i < stepsMeta.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors ${
                      i < currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium hidden sm:block ${
                  i <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
          {currentStep === 0 && (
            <StepDadosPessoais formData={formData} updateForm={updateForm} errors={errors} />
          )}
          {currentStep === 1 && (
            <StepSintomas formData={formData} updateForm={updateForm} errors={errors} />
          )}
          {currentStep === 2 && (
            <StepDetalhes formData={formData} updateForm={updateForm} errors={errors} />
          )}
          {currentStep === 3 && <StepRevisao formData={formData} />}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 0 ? (
              <button
                onClick={handlePrev}
                className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-lg font-semibold hover:bg-muted transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            ) : (
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-lg font-semibold hover:bg-muted transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Início
              </button>
            )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
              >
                Enviar Solicitação
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solicitar;
