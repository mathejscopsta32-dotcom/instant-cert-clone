import { Gift, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import logoDr from "@/assets/logo-dr.png";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoDr} alt="Dr. Rodrigo V. Vasconcelos" className="h-10 object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-lg text-foreground tracking-tight">
              Atestado<span className="text-primary">24h</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">Saúde Digital</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Gift className="w-4 h-4 text-destructive" />
            Indique e Ganhe
          </a>
          <a href="#" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <User className="w-4 h-4" />
            Minha Conta
          </a>
          <Link
            to="/solicitar"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Solicitar Agora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
