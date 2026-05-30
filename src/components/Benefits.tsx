import { CustomIcon } from "@/components/icons/CustomIcon";

const benefits = [
  { icon: "monitor" as const, title: "100% digital", desc: "O processo inteiro acontece pelo computador ou celular, sem deslocamento." },
  { icon: "stethoscope" as const, title: "Médicos com CRM", desc: "Profissionais registrados nos conselhos regionais de medicina, verificáveis publicamente." },
  { icon: "mail" as const, title: "Entrega por e-mail", desc: "Documento em PDF enviado automaticamente após confirmação do pagamento." },
  { icon: "lock" as const, title: "Dados protegidos", desc: "Informações tratadas com criptografia e sigilo médico, conforme exigido pela LGPD." },
  { icon: "flagBR" as const, title: "Validade nacional", desc: "Aceito por empresas, escolas e instituições em todo o território brasileiro." },
  { icon: "bolt" as const, title: "Processo objetivo", desc: "Anamnese estruturada e fluxo simplificado. Sem burocracia desnecessária." },
];

const stats = [
  { value: "15.000+", label: "Atestados emitidos em 2026" },
  { value: "4.9/5", label: "Nota dos pacientes no Google" },
  { value: "5 min", label: "Tempo médio de entrega" },
  { value: "1.235+", label: "Avaliações verificadas" },
];

const Benefits = () => {
  return (
    <section className="py-20 bg-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="section-label mb-3">DIFERENCIAIS</p>
        <h2 className="section-title mb-4">Por que nos escolher</h2>
        <p className="section-subtitle mb-14">
          Seis pontos que estruturam nossa operação de telemedicina, alinhados à
          regulamentação e à expectativa de quem precisa de um atestado válido.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border p-6 text-left hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <CustomIcon name={b.icon} size={26} />
              </div>
              <h3 className="font-bold text-foreground mb-1">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {stats.map((s, i) => (
            <div key={i} className="bg-card border rounded-2xl p-6">
              <p className="text-3xl font-extrabold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 max-w-2xl mx-auto">
          Dados atualizados em tempo real a partir do sistema de emissão e do
          painel público de avaliações no Google.
        </p>
      </div>
    </section>
  );
};

export default Benefits;
