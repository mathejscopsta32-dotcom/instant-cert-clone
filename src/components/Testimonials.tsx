import { Star } from "lucide-react";

const testimonials = [
  { name: "Mariana R.", time: "há 2 dias", text: "Excelente serviço. Recebi meu atestado rapidamente por e-mail. Tudo muito profissional e organizado. Recomendo." },
  { name: "Carlos S.", time: "há 1 semana", text: "Muito prático. Estava doente e não conseguia sair de casa. Fiz tudo pelo celular e o documento chegou rápido." },
  { name: "Patrícia L.", time: "há 2 semanas", text: "Precisava de um atestado urgente. Processo simples, pagamento por Pix e recebi no e-mail em minutos." },
  { name: "Rafael M.", time: "há 3 semanas", text: "Estava desconfiado no início, mas funcionou perfeitamente. O RH da empresa aceitou sem nenhum problema." },
  { name: "Juliana F.", time: "há 1 mês", text: "Melhor plataforma de telemedicina que já usei. Atendimento rápido e o atestado veio com CRM do médico." },
  { name: "Eduardo P.", time: "há 1 mês", text: "Estava com meu filho doente e não podia faltar ao trabalho presencialmente. O atestado chegou rapidinho." },
  { name: "Camila A.", time: "há 1 mês", text: "Serviço 5 estrelas. Preenchi o formulário, paguei via Pix e logo recebi o atestado no meu e-mail." },
  { name: "Felipe T.", time: "há 2 meses", text: "Muito fácil de usar. Achei que seria complicado, mas é bem direto. O atestado foi aceito na faculdade." },
  { name: "Larissa B.", time: "há 2 meses", text: "Já usei duas vezes e nas duas recebi rapidamente. Confiável e profissional. Documento com todos os dados." },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="section-label mb-3">AVALIAÇÕES</p>
        <h2 className="section-title mb-3">
          Avaliações de pacientes — Atestado Médico Online JustMed
        </h2>
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, j) => (
              <Star key={j} className="w-4 h-4 text-star fill-star" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">4.9</strong> · 1.235 avaliações verificadas no Google
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-card border rounded-2xl p-6 text-left">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-star fill-star" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
              <p className="font-bold text-foreground text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.time}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
