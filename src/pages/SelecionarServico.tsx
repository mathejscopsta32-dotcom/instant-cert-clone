import { Link } from "react-router-dom";
import { FileText, Stethoscope, Waves, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalIframe from "@/components/GlobalIframe";

const services = [
  {
    icon: FileText,
    title: "Atestado Médico",
    desc: "Atestado para afastamento do trabalho ou escola por motivo de saúde.",
    price: "A partir de R$ 29,90",
    to: "/escolher-medico?destino=/solicitar",
    color: "bg-emerald-500",
    features: ["1 a 15 dias de afastamento", "CID-10 opcional", "QR Code de verificação"],
  },
  {
    icon: Stethoscope,
    title: "Laudo Médico",
    desc: "Laudo médico detalhado com diagnóstico e orientações clínicas.",
    price: "A partir de R$ 29,90",
    to: "/escolher-medico?destino=/solicitar%3Ftipo%3Dlaudo",
    color: "bg-blue-500",
    features: ["Diagnóstico detalhado", "Orientações clínicas", "Assinatura digital"],
  },
  {
    icon: Waves,
    title: "Atestado para Piscina",
    desc: "Atestado dermatológico atestando aptidão para atividades aquáticas.",
    price: "R$ 29,90",
    to: "/escolher-medico?destino=/solicitar-piscina",
    color: "bg-cyan-500",
    features: ["Aptidão dermatológica", "Válido para academias e clubes", "Entrega imediata"],
  },
  {
    icon: Stethoscope,
    title: "Consulta Médica Online",
    desc: "Teleconsulta com médico licenciado para avaliação, diagnóstico e orientações.",
    price: "R$ 29,90",
    to: "/escolher-medico?destino=/consulta",
    color: "bg-violet-500",
    features: ["Avaliação clínica completa", "Prescrição médica digital", "Atendimento 24h"],
  },
];

const SelecionarServico = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <GlobalIframe />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-5">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Seguro e Confidencial
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Selecione o Serviço Desejado
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Escolha o tipo de documento médico que você precisa.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <Link
              key={i}
              to={s.to}
              className="group bg-card border border-border/60 rounded-2xl p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col"
            >
              <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <s.icon className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-lg font-bold text-foreground mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{s.desc}</p>

              <ul className="space-y-2 mb-5">
                {s.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <p className="text-primary font-bold text-lg mb-3">{s.price}</p>
                <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold group-hover:opacity-90 transition-opacity w-full justify-center">
                  Solicitar
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 mt-10 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Dados protegidos (LGPD)
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            Médicos com CRM ativo
          </span>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SelecionarServico;
