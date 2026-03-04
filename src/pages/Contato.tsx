import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MapPin, Clock, ShieldCheck } from "lucide-react";

const Contato = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Fale Conosco</h1>
          <p className="text-muted-foreground mt-2">
            Estamos aqui para ajudar. Entre em contato pelos canais abaixo.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="bg-card border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-1">E-mail</h3>
            <p className="text-sm text-muted-foreground">atendimento@atestado24h.com.br</p>
            <p className="text-xs text-muted-foreground mt-1">Respondemos em até 24h</p>
            <p className="text-sm text-muted-foreground mt-2 font-medium">(11) 4002-8922</p>
          </div>

          <div className="bg-card border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Horário</h3>
            <p className="text-sm text-muted-foreground">Plataforma 24h/7 dias</p>
            <p className="text-xs text-muted-foreground mt-1">Suporte: Seg a Sex, 8h às 18h</p>
          </div>

          <div className="bg-card border rounded-2xl p-6 text-center sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Localização</h3>
            <p className="text-sm text-muted-foreground">São Paulo, SP — Brasil</p>
            <p className="text-xs text-muted-foreground mt-1">Atendimento 100% online</p>
          </div>
        </div>

        {/* FAQ rápido */}
        <div className="bg-card border rounded-2xl p-8">
          <h2 className="text-lg font-bold text-foreground mb-6 text-center">Dúvidas Rápidas</h2>
          <div className="space-y-4">
            {[
              { q: "Qual o prazo de entrega do atestado?", a: "Após a confirmação do pagamento, o atestado é disponibilizado em poucos minutos." },
              { q: "Como solicito reembolso?", a: "Caso seu atestado não seja emitido por critério médico, o reembolso é automático. Para outros casos, entre em contato por e-mail." },
              { q: "Meus dados estão seguros?", a: "Sim! Utilizamos criptografia SSL/TLS, conformidade com LGPD e sigilo médico para proteger todas as suas informações." },
            ].map((item, i) => (
              <div key={i} className="border-b border-border last:border-0 pb-4 last:pb-0">
                <h3 className="font-semibold text-foreground text-sm">{item.q}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Seus dados estão protegidos por criptografia SSL e sigilo médico
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contato;
