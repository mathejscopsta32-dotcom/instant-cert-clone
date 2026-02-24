import { ClipboardList, Stethoscope, Download } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Preencha o Questionário",
    description: "Responda algumas perguntas sobre seus sintomas e histórico de saúde.",
  },
  {
    icon: Stethoscope,
    title: "Avaliação Médica",
    description: "Nosso sistema e médicos avaliam suas informações instantaneamente.",
  },
  {
    icon: Download,
    title: "Receba seu Atestado",
    description: "Após aprovação e pagamento, baixe seu atestado assinado digitalmente.",
  },
];

const Steps = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="section-label mb-3">PASSO A PASSO</p>
        <h2 className="section-title mb-4">Como Funciona o Atestado Médico Online</h2>
        <p className="section-subtitle mb-14">
          Obtenha seu atestado médico em poucos minutos seguindo apenas 3 passos simples.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative bg-card rounded-2xl border p-8 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-secondary flex items-center justify-center">
                <step.icon className="w-6 h-6 text-primary" />
              </div>

              <span className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>

              <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Steps;
