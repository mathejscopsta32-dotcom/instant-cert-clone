import { Star } from "lucide-react";
import { GoogleLogo } from "@/components/icons/GoogleLogo";

interface Review {
  name: string;
  time: string;
  text: string;
}

const rowA: Review[] = [
  { name: "Mariana R.", time: "há 2 dias", text: "Excelente serviço. Recebi meu atestado rapidamente por e-mail. Tudo muito profissional e organizado. Recomendo." },
  { name: "Carlos S.", time: "há 1 semana", text: "Muito prático. Estava doente e não conseguia sair de casa. Fiz tudo pelo celular e o documento chegou rápido." },
  { name: "Patrícia L.", time: "há 2 semanas", text: "Precisava de um atestado urgente. Processo simples, pagamento por Pix e recebi no e-mail em minutos." },
  { name: "Rafael M.", time: "há 3 semanas", text: "Estava desconfiado no início, mas funcionou perfeitamente. O RH da empresa aceitou sem nenhum problema." },
  { name: "Juliana F.", time: "há 1 mês", text: "Melhor plataforma de telemedicina que já usei. Atendimento rápido e o atestado veio com CRM do médico." },
  { name: "Eduardo P.", time: "há 1 mês", text: "Estava com meu filho doente e não podia faltar ao trabalho presencialmente. O atestado chegou rapidinho." },
  { name: "Camila A.", time: "há 1 mês", text: "Serviço 5 estrelas. Preenchi o formulário, paguei via Pix e logo recebi o atestado no meu e-mail." },
  { name: "Felipe T.", time: "há 2 meses", text: "Muito fácil de usar. Achei que seria complicado, mas é bem direto. O atestado foi aceito na faculdade." },
];

const rowB: Review[] = [
  { name: "Larissa B.", time: "há 2 meses", text: "Já usei duas vezes e nas duas recebi rapidamente. Confiável e profissional. Documento com todos os dados." },
  { name: "Bruno C.", time: "há 2 meses", text: "Salvou meu dia. Acordei muito mal e precisava justificar a falta. Em menos de meia hora já tinha o documento." },
  { name: "Fernanda M.", time: "há 3 meses", text: "Adorei. Não precisei enfrentar fila em posto de saúde. Processo todo online e o atestado chegou certinho." },
  { name: "Ricardo G.", time: "há 3 meses", text: "Serviço impecável. Formulário objetivo, pagamento instantâneo e recebimento rápido." },
  { name: "Aline V.", time: "há 4 meses", text: "Sempre que preciso recorro a esse site. Nunca tive problema. O atendimento é sério." },
  { name: "Pedro H.", time: "há 4 meses", text: "Site bonito e fácil de navegar. Recebi o atestado sem complicações. Voltarei a usar." },
  { name: "Beatriz N.", time: "há 5 meses", text: "Incrível como a tecnologia facilita a vida. Fiz tudo em 10 minutos e resolvido." },
  { name: "Lucas D.", time: "há 5 meses", text: "Recomendo de olhos fechados. Profissional, ágil. O atestado veio com CRM e código de validação." },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const avatarColors = [
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-orange-100 text-orange-700",
];

const ReviewCard = ({ r, idx }: { r: Review; idx: number }) => (
  <div className="w-[320px] shrink-0 bg-card border rounded-2xl p-5 text-left shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColors[idx % avatarColors.length]}`}
      >
        {initials(r.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground text-sm truncate">{r.name}</p>
        <p className="text-xs text-muted-foreground">{r.time}</p>
      </div>
      <GoogleLogo size={18} />
    </div>
    <div className="flex gap-0.5 mb-2">
      {[...Array(5)].map((_, j) => (
        <Star key={j} className="w-3.5 h-3.5 text-star fill-star" />
      ))}
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
      {r.text}
    </p>
  </div>
);

const Marquee = ({
  items,
  direction = "left",
}: {
  items: Review[];
  direction?: "left" | "right";
}) => {
  // Duplicate the list so the translate animation loops seamlessly.
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden group">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />

      <div
        className={`flex gap-5 w-max ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        } group-hover:[animation-play-state:paused]`}
      >
        {doubled.map((r, i) => (
          <ReviewCard key={i} r={r} idx={i} />
        ))}
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <p className="section-label mb-3">AVALIAÇÕES</p>
        <h2 className="section-title mb-4">
          Avaliações de pacientes — Atestado Médico Online JustMed
        </h2>
        <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-card border rounded-full px-5 py-2.5 shadow-sm">
          <GoogleLogo size={22} />
          <span className="text-foreground font-bold">4.9</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, j) => (
              <Star key={j} className="w-4 h-4 text-star fill-star" />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            · 1.235 avaliações verificadas no Google
          </span>
        </div>
      </div>

      <div className="space-y-5">
        <Marquee items={rowA} direction="left" />
        <Marquee items={rowB} direction="right" />
      </div>
    </section>
  );
};

export default Testimonials;
