import { Gift, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white" fillOpacity="0.2"/>
              <path d="M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4V7z" fill="white" strokeWidth="0.5"/>
              <path d="M19.5 4.5l-2 2M4.5 19.5l2-2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
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
