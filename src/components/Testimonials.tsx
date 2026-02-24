import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Roberto Almeida",
    time: "há 2 semanas",
    text: "Excelente alternativa para quem não pode se deslocar até uma clínica. Processo seguro e documento aceito sem problemas pelo meu empregador.",
  },
  {
    name: "Fernanda Costa",
    time: "há 1 mês",
    text: "Precisei de um atestado urgente e consegui em poucos minutos. Muito prático e confiável, recomendo!",
  },
  {
    name: "Carlos Silva",
    time: "há 3 semanas",
    text: "Serviço rápido e seguro. Fiquei impressionado com a agilidade. O atestado foi aceito sem nenhum problema.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="section-title mb-14">Avaliações dos nossos clientes</h2>

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
