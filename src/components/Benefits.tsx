import { Zap, Globe, Shield, Lock, CreditCard, Headphones } from "lucide-react";

const benefits = [
  { icon: Zap, title: "Rápido e Conveniente", desc: "Receba seu atestado em minutos, sem sair de casa." },
  { icon: Globe, title: "100% Online", desc: "Todo o processo é digital, do questionário ao recebimento." },
  { icon: Shield, title: "Seguro e Legal", desc: "Atestados emitidos de acordo com as normas vigentes." },
  { icon: Lock, title: "Sigilo Médico", desc: "Suas informações são protegidas por sigilo absoluto." },
  { icon: CreditCard, title: "Pagamento Facilitado", desc: "Aceitamos PIX para maior agilidade na liberação." },
  { icon: Headphones, title: "Suporte Dedicado", desc: "Equipe pronta para ajudar em qualquer etapa." },
];

const Benefits = () => {
  return (
    <section className="py-20 bg-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="section-label mb-3">BENEFÍCIOS</p>
        <h2 className="section-title mb-14">Por que escolher nosso serviço?</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border p-6 text-left hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
