const items = [
  {
    emoji: "⚖️",
    title: "Validade legal completa",
    desc: "Atestado emitido por médico com CRM ativo, em conformidade com a Resolução CFM nº 2.314/2022. Válido para trabalho, escola, piscina e comparecimento em todo o Brasil.",
  },
  {
    emoji: "🔐",
    title: "Privacidade garantida",
    desc: "Seus dados de saúde são tratados com criptografia e sigilo médico, conforme exigido pela LGPD (Lei 13.709/2018).",
  },
  {
    emoji: "💰",
    title: "Sem custos ocultos",
    desc: "Valor único e transparente: cobre teleconsulta, emissão e entrega do documento. O preço final aparece antes do pagamento.",
  },
  {
    emoji: "✅",
    title: "Validação após a entrega",
    desc: "Cada atestado passa por validação antes do envio. Suporte 24h disponível para qualquer questionamento posterior.",
  },
];

const Commitments = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="section-label mb-3">GARANTIAS</p>
          <h2 className="section-title mb-4">Compromissos com você</h2>
          <p className="section-subtitle">
            Quatro garantias regulatórias e operacionais que estruturam o serviço.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {items.map((it, i) => (
            <div key={i} className="bg-card border rounded-2xl p-6 flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                <span aria-hidden>{it.emoji}</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">{it.title}</h3>
                <p className="text-sm text-muted-foreground">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Commitments;
