import { ArrowRight, ShieldCheck, Star } from "lucide-react";
import { Link } from "react-router-dom";
import doctorImg from "@/assets/doctor.jpg";

const Hero = () => {
  return (
    <section className="bg-hero py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 bg-badge text-badge-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
              <span aria-hidden>🟢</span>
              Atendimento 24h, todos os dias
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-foreground">
              Atestado médico online,{" "}
              <span className="text-primary">receba em até 5 minutos.</span>
            </h1>

            <p className="text-muted-foreground text-lg">
              Você preenche a anamnese e um médico com CRM ativo emite o documento
              com assinatura digital. Validade nacional, conforme a Resolução CFM
              nº 2.314/2022.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/selecionar-servico"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Solicitar atestado
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="inline-flex items-center text-sm text-muted-foreground px-2">
                <span className="mr-1.5" aria-hidden>📧</span>
                Entrega por e-mail ou WhatsApp
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-star fill-star" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">1.235+</strong> avaliações no Google
              </p>
            </div>
          </div>

          {/* Right – Doctor image with badges */}
          <div className="relative flex justify-center">
            <img
              src={doctorImg}
              alt="Médica profissional com estetoscópio"
              className="rounded-2xl w-full max-w-md object-cover shadow-xl"
              loading="lazy"
            />

            <div className="absolute bottom-6 left-2 bg-background rounded-xl shadow-lg px-4 py-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-bold text-foreground">CRM ativo</p>
                <p className="text-xs text-muted-foreground">CFM 2.314/2022</p>
              </div>
            </div>

            <div className="absolute top-6 right-2 bg-background rounded-xl shadow-lg px-4 py-3 flex items-center gap-2">
              <span className="text-lg" aria-hidden>⚡</span>
              <div>
                <p className="text-sm font-bold text-foreground">Em 5 min</p>
                <p className="text-xs text-muted-foreground">Entrega média</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-10 max-w-3xl mx-auto">
          Serviço de telemedicina para condições de baixa complexidade, conforme
          Resolução CFM nº 2.314/2022 e Lei 13.989/2020. Não substitui atendimento
          presencial de emergência.
        </p>
      </div>
    </section>
  );
};

export default Hero;
