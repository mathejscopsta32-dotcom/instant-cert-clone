import { Link } from "react-router-dom";
import { Briefcase, CalendarCheck, Users, Building2, GraduationCap, Waves, Dumbbell, Plane } from "lucide-react";
import Footer from "@/components/Footer";
import GlobalIframe from "@/components/GlobalIframe";
import logo from "@/assets/logo-justmed.png";

type Servico = {
  icon: typeof Briefcase;
  title: string;
  desc: string;
  to: string;
};

const services: Servico[] = [
  {
    icon: Briefcase,
    title: "Trabalho",
    desc: "Justifica ausência e abona faltas no emprego",
    to: "/solicitar?tipo=trabalho",
  },
  {
    icon: CalendarCheck,
    title: "Comparecimento",
    desc: "Comprova consulta médica em parte do expediente",
    to: "/solicitar?tipo=comparecimento",
  },
  {
    icon: Users,
    title: "Acompanhamento",
    desc: "Para quem levou familiar à consulta ou cirurgia",
    to: "/solicitar?tipo=acompanhamento",
  },
  {
    icon: Building2,
    title: "Internação Hospitalar",
    desc: "Comprova período de internação em hospital",
    to: "/solicitar?tipo=internacao",
  },
  {
    icon: GraduationCap,
    title: "Escola/Faculdade/Estágio",
    desc: "Justifica falta em aulas, provas ou estágio",
    to: "/solicitar?tipo=escola",
  },
  {
    icon: Waves,
    title: "Piscina",
    desc: "Libera o uso de piscinas em clubes e academias",
    to: "/solicitar-piscina",
  },
  {
    icon: Dumbbell,
    title: "Aptidão Física",
    desc: "Libera academia, corridas e esportes em geral",
    to: "/solicitar?tipo=aptidao",
  },
  {
    icon: Plane,
    title: "Cancelamento de Voo",
    desc: "Justifica reembolso ou remarcação de passagem aérea por motivo de saúde",
    to: "/escolher-medico?destino=/solicitar%3Ftipo%3Dvoo",
  },
];

const TOTAL_STEPS = 8;
const CURRENT_STEP = 1;

const SelecionarServico = () => {
  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      <GlobalIframe />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/" aria-label="JustMed Atestados">
            <img src={logo} alt="JustMed Atestados" className="h-14 w-14 object-contain" />
          </Link>
        </div>

        {/* Price banner */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-3.5 text-center mb-5">
          <p className="text-sm md:text-base">
            <span className="font-extrabold text-emerald-700">R$ 34,99</span>
            <span className="text-emerald-700/70"> · </span>
            <span className="text-emerald-800/80 font-medium">Receba em minutos por e-mail</span>
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all"
              style={{ width: `${(CURRENT_STEP / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < CURRENT_STEP ? "bg-emerald-600" : "bg-emerald-100"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-2">
          Tipo de Atestado
        </h1>
        <p className="text-muted-foreground mb-6 text-sm md:text-base">
          Selecione o tipo de atestado que você precisa:
        </p>

        {/* Options */}
        <div className="space-y-3">
          {services.map((s, i) => (
            <Link
              key={i}
              to={s.to}
              className="group flex items-center gap-4 bg-white border border-border rounded-xl px-4 py-4 hover:border-emerald-400 hover:shadow-sm transition-all"
            >
              <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 transition-colors">
                <s.icon className="w-5 h-5 text-foreground/80 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-foreground leading-tight">{s.title}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SelecionarServico;
