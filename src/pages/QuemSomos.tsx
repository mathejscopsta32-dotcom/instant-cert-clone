import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Award, Users, Clock, CheckCircle2, Stethoscope, Globe, Heart, Lock } from "lucide-react";
import doctorImg from "@/assets/doctor.jpg";

const values = [
  { icon: ShieldCheck, title: "Segurança", desc: "Criptografia SSL/TLS e conformidade total com a LGPD para proteção dos seus dados." },
  { icon: Award, title: "Qualidade", desc: "Médicos com CRM ativo e certificação digital ICP-Brasil para documentos válidos." },
  { icon: Clock, title: "Agilidade", desc: "Atendimento 24 horas por dia, 7 dias por semana, com entrega em minutos." },
  { icon: Heart, title: "Humanização", desc: "Atendimento digital sem perder o cuidado e a atenção que você merece." },
];

const stats = [
  { value: "50.000+", label: "Atestados emitidos" },
  { value: "4.9/5", label: "Avaliação dos clientes" },
  { value: "24/7", label: "Disponibilidade" },
  { value: "100%", label: "Digital e seguro" },
];

const QuemSomos = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 bg-badge text-badge-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" />
                Quem Somos
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                Medicina acessível e <span className="text-primary">digital para todos</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Somos uma plataforma de telemedicina comprometida em democratizar o acesso à saúde 
                no Brasil, conectando pacientes a médicos licenciados de forma rápida, segura e 100% online.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="bg-card border rounded-xl p-4 text-center">
                    <p className="text-2xl font-extrabold text-primary">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <img
                src={doctorImg}
                alt="Dr. Rodrigo V. Vasconcelos - Médico responsável"
                className="rounded-2xl w-full max-w-md object-cover shadow-xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Médico responsável */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-foreground mb-3">Médico Responsável</h2>
            <p className="text-muted-foreground">
              Nossos serviços são supervisionados por profissionais qualificados e registrados.
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground">Dr. Rodrigo V. Vasconcelos</h3>
              <p className="text-primary font-semibold text-sm mt-1">CRM/SP 142.857 — Clínico Geral</p>
              <p className="text-muted-foreground text-sm mt-3">
                Médico formado com ampla experiência em clínica geral e telemedicina. 
                Responsável técnico pela supervisão dos atestados emitidos e consultas 
                realizadas através da plataforma, garantindo a qualidade e conformidade 
                de todos os documentos médicos.
              </p>
              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CRM Ativo
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Certificado ICP-Brasil
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                  <Globe className="w-3.5 h-3.5" /> Telemedicina
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 bg-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold text-foreground mb-3">Nossos Valores</h2>
          <p className="text-muted-foreground mb-12">Princípios que guiam nosso trabalho todos os dias.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-card border rounded-2xl p-6 text-left hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segurança / SSL */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-3">Segurança e Proteção de Dados</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sua segurança é nossa prioridade. Utilizamos as mais avançadas tecnologias de proteção para 
            garantir que seus dados estejam sempre seguros.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-card border rounded-2xl p-6">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">SSL/TLS</h3>
              <p className="text-xs text-muted-foreground">
                Conexão 100% criptografada com certificado SSL de 256 bits para proteger todas as comunicações.
              </p>
            </div>
            <div className="bg-card border rounded-2xl p-6">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">LGPD</h3>
              <p className="text-xs text-muted-foreground">
                Total conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).
              </p>
            </div>
            <div className="bg-card border rounded-2xl p-6">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">Sigilo Médico</h3>
              <p className="text-xs text-muted-foreground">
                Dados protegidos pelo sigilo médico-paciente conforme o Código de Ética Médica.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default QuemSomos;
