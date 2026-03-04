import { useSearchParams, useNavigate } from "react-router-dom";
import { Star, ShieldCheck, CheckCircle2, Award } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalIframe from "@/components/GlobalIframe";

import imgDrCarlos from "@/assets/doctors/dr-carlos.jpg";
import imgDraAna from "@/assets/doctors/dra-ana.jpg";
import imgDrRoberto from "@/assets/doctors/dr-roberto.jpg";
import imgDraJuliana from "@/assets/doctors/dra-juliana.jpg";

const medicos = [
  {
    nome: "Dr. Carlos Eduardo",
    crm: "CRM/SP 142.587",
    especialidade: "Clínico Geral",
    experiencia: "12 anos de experiência",
    avaliacao: 4.9,
    avaliacoes: 1847,
    img: imgDrCarlos,
  },
  {
    nome: "Dra. Ana Beatriz",
    crm: "CRM/RJ 198.432",
    especialidade: "Clínica Geral",
    experiencia: "8 anos de experiência",
    avaliacao: 4.8,
    avaliacoes: 1523,
    img: imgDraAna,
  },
  {
    nome: "Dr. Roberto Mendes",
    crm: "CRM/MG 165.291",
    especialidade: "Clínico Geral",
    experiencia: "15 anos de experiência",
    avaliacao: 4.9,
    avaliacoes: 2104,
    img: imgDrRoberto,
  },
  {
    nome: "Dra. Juliana Costa",
    crm: "CRM/SP 201.845",
    especialidade: "Clínica Geral",
    experiencia: "6 anos de experiência",
    avaliacao: 4.7,
    avaliacoes: 983,
    img: imgDraJuliana,
  },
];

const EscolherMedico = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const destino = searchParams.get("destino") || "/solicitar";

  const handleSelect = (medicoNome: string) => {
    const separator = destino.includes("?") ? "&" : "?";
    navigate(`${destino}${separator}medico=${encodeURIComponent(medicoNome)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <GlobalIframe />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-5">
            <Award className="w-3.5 h-3.5" />
            Médicos Verificados com CRM Ativo
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Escolha seu Médico
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Selecione o profissional que irá avaliar seu caso clínico.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {medicos.map((m, i) => (
            <button
              key={i}
              onClick={() => handleSelect(m.nome)}
              className="group bg-card border border-border/60 rounded-2xl p-5 hover:shadow-xl hover:border-primary/40 transition-all duration-300 text-left flex gap-4 items-start"
            >
              <img
                src={m.img}
                alt={m.nome}
                className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 ring-2 ring-border group-hover:ring-primary/40 transition-all"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-foreground truncate">{m.nome}</h2>
                <p className="text-xs text-primary font-semibold mt-0.5">{m.crm}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.especialidade} • {m.experiencia}</p>

                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s < Math.floor(m.avaliacao) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{m.avaliacao}</span>
                  <span className="text-xs text-muted-foreground">({m.avaliacoes.toLocaleString("pt-BR")})</span>
                </div>

                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold group-hover:opacity-90 transition-opacity">
                    Selecionar
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            CRM verificado e ativo
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            Sigilo médico garantido
          </span>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EscolherMedico;
