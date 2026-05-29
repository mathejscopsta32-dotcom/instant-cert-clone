import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    emoji: "📝",
    title: "Preencha o formulário",
    description:
      "Informe seus dados pessoais e responda à anamnese digital. Todas as informações são protegidas por criptografia.",
  },
  {
    emoji: "💸",
    title: "Pague via Pix",
    description:
      "Pagamento seguro, instantâneo e sem cobranças adicionais.",
  },
  {
    emoji: "📧",
    title: "Receba por e-mail",
    description:
      "O atestado é assinado digitalmente por médico com CRM ativo e enviado em PDF para o e-mail informado.",
  },
];

const Steps = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="section-label mb-3">COMO FUNCIONA</p>
        <h2 className="section-title mb-4">Como funciona o serviço</h2>
        <p className="section-subtitle mb-14">
          Três etapas para solicitar seu atestado médico online sem sair de casa.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative bg-card rounded-2xl border p-8 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                <span aria-hidden>{step.emoji}</span>
              </div>

              <span className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>

              <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            to="/selecionar-servico"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Começar
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Steps;
