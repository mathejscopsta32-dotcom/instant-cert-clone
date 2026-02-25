import { ArrowRight, CheckCircle2, Clock, ShieldCheck, Star } from "lucide-react";
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
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Seguro e Confidencial
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-foreground">
              Atestado Médico Online{" "}
              <span className="text-primary">24/7 em 5 minutos</span>
            </h1>

            <p className="text-muted-foreground text-lg">
              Obtenha seu atestado médico agora por apenas{" "}
              <span className="text-primary font-bold">R$ 29,90</span>, simplesmente
              por meio de um questionário on-line em{" "}
              <strong className="text-foreground">5 minutos</strong>.
            </p>

            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                Simples, <strong className="text-foreground">rápido</strong> e confiável
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <strong className="text-foreground">100% on-line</strong> sem consulta médica
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                Atestado Médico Assinado e com Carimbo por Médicos Brasileiros com{" "}
                <strong className="text-foreground">CRM Ativo!</strong>
              </li>
            </ul>

            {/* Doctor highlight */}
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 w-fit">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Dr. Carlos Eduardo Mendes</p>
                <p className="text-xs text-muted-foreground">CRM/SP 142.857 — Clínico Geral</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/solicitar"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Solicitar Atestado
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#"
                className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Acessar Minha Conta
              </a>
            </div>
          </div>

          {/* Right – Doctor image with floating badges */}
          <div className="relative flex justify-center">
            <img
              src={doctorImg}
              alt="Médico profissional"
              className="rounded-2xl w-full max-w-md object-cover shadow-xl"
              loading="lazy"
            />

            {/* Rating badge */}
            <div className="absolute bottom-6 left-2 bg-background rounded-xl shadow-lg px-4 py-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-star fill-star" />
              <div>
                <p className="text-sm font-bold text-foreground">4.9/5</p>
                <p className="text-xs text-muted-foreground">Avaliações</p>
              </div>
            </div>

            {/* Security badge */}
            <div className="absolute top-6 right-2 bg-background rounded-xl shadow-lg px-4 py-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-bold text-foreground">100% Seguro</p>
                <p className="text-xs text-muted-foreground">Dados protegidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
