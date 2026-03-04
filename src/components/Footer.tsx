import { Link } from "react-router-dom";
import { ShieldCheck, Lock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo + links */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">+</span>
              </div>
              <span className="font-bold text-lg">
                Atestado<span className="text-primary">24h</span>
              </span>
            </div>
            <p className="text-sm opacity-70">
              Telemedicina acessível, segura e 100% digital para todo o Brasil.
            </p>
          </div>

          {/* Serviços */}
          <div>
            <h3 className="font-bold text-sm mb-3 opacity-90">Serviços</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/selecionar-servico" className="hover:opacity-100 transition-opacity">Solicitar Atestado</Link></li>
              <li><Link to="/solicitar-piscina" className="hover:opacity-100 transition-opacity">Atestado para Piscina</Link></li>
              <li><Link to="/consulta" className="hover:opacity-100 transition-opacity">Consulta Online</Link></li>
              <li><Link to="/meu-pedido" className="hover:opacity-100 transition-opacity">Acompanhar Pedido</Link></li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="font-bold text-sm mb-3 opacity-90">Institucional</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/quem-somos" className="hover:opacity-100 transition-opacity">Quem Somos</Link></li>
              <li><Link to="/contato" className="hover:opacity-100 transition-opacity">Contato</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-sm mb-3 opacity-90">Legal</h3>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/termos-de-uso" className="hover:opacity-100 transition-opacity">Termos de Uso</Link></li>
              <li><Link to="/politica-de-privacidade" className="hover:opacity-100 transition-opacity">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-60">
            © {new Date().getFullYear()} Atestado24h. Todos os direitos reservados. CNPJ: 45.312.876/0001-93
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs opacity-70">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              SSL Seguro
            </span>
            <span className="flex items-center gap-1.5 text-xs opacity-70">
              <Lock className="w-3.5 h-3.5 text-primary" />
              LGPD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
