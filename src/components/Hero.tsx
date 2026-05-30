import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import doctorImg from "@/assets/doctor-main.jpg";
import avatar1 from "@/assets/avatar-br-1.jpg";
import avatar2 from "@/assets/avatar-br-2.jpg";
import avatar3 from "@/assets/avatar-br-3.jpg";
import avatar4 from "@/assets/avatar-br-4.jpg";
import { CustomIcon } from "@/components/icons/CustomIcon";

const Hero = () => {
  return (
    <section className="hero-dark text-white py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <CustomIcon name="clock" size={14} className="text-emerald-300" />
              Atendimento 24h, todos os dias
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] text-white tracking-tight">
              Atestado<br />
              médico online,<br />
              <span className="gold-shimmer">receba em</span><br />
              <span className="gold-shimmer">até 5 minutos.</span>
            </h1>

            <p className="text-white/75 text-base md:text-lg max-w-xl">
              Você preenche a anamnese e um médico com CRM ativo emite o documento
              com assinatura digital. Validade nacional, conforme a Resolução CFM
              nº 2.314/2022.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/selecionar-servico"
                className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-6 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-500/20"
              >
                Solicitar atestado
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[avatar1, avatar2, avatar3, avatar4].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      aria-hidden
                      width={28}
                      height={28}
                      loading="lazy"
                      className="w-7 h-7 rounded-full border-2 border-emerald-950 object-cover"
                    />
                  ))}
                </div>
                <div className="flex gap-0.5 ml-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-star fill-star" />
                  ))}
                </div>
                <p className="text-xs text-white/80">
                  <strong className="text-white">1.235+</strong> avaliações no Google
                </p>
              </div>
            </div>

            <p className="text-xs text-white/60 -mt-1">
              Entrega por e-mail ou WhatsApp
            </p>
          </div>

          {/* Right – Doctor image with floating badges */}
          <div className="relative flex justify-center md:justify-end">
            <div className="relative w-full max-w-md">
              <img
                src={doctorImg}
                alt="Médica profissional com estetoscópio em atendimento de telemedicina"
                className="rounded-3xl w-full object-cover shadow-2xl ring-1 ring-white/10"
                loading="lazy"
              />

              <div className="absolute -top-3 right-4 bg-emerald-950/90 backdrop-blur border border-emerald-500/30 text-white rounded-full pl-3 pr-4 py-1.5 flex items-center gap-2 shadow-lg">
                <span className="w-7 h-7 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <CustomIcon name="stethoscope" size={14} className="text-emerald-300" />
                </span>
                <span className="text-xs font-semibold">CRM ativo</span>
              </div>

              <div className="absolute top-10 -right-4 w-14 h-14 rounded-full border-4 border-emerald-400 overflow-hidden shadow-xl bg-emerald-950">
                <img src={doctorImg} alt="" className="w-full h-full object-cover" aria-hidden />
              </div>

              <div className="absolute bottom-16 -left-4 w-14 h-14 rounded-full border-4 border-emerald-400 overflow-hidden shadow-xl bg-emerald-950">
                <img src={doctorImg} alt="" className="w-full h-full object-cover" aria-hidden />
              </div>

              <div className="absolute -bottom-3 right-4 bg-emerald-950/90 backdrop-blur border border-emerald-500/30 text-white rounded-full pl-3 pr-4 py-1.5 flex items-center gap-2 shadow-lg">
                <span className="w-7 h-7 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <CustomIcon name="shield" size={14} className="text-emerald-300" />
                </span>
                <span className="text-xs font-semibold">CFM 2.314/2022</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/55 text-center mt-14 max-w-3xl mx-auto">
          Serviço de telemedicina para condições de baixa complexidade, conforme
          Resolução CFM nº 2.314/2022 e Lei 13.989/2020. Não substitui atendimento
          presencial de emergência.
        </p>
      </div>
    </section>
  );
};

export default Hero;
