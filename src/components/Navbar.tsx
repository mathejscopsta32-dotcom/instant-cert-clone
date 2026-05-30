import { ArrowRight, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "@/assets/logo-justmed.png";

const NAV_LINKS = [
  { label: "Como funciona", target: "como-funciona" },
  { label: "Diferenciais", target: "diferenciais" },
  { label: "Opiniões", target: "opinioes" },
  { label: "Dúvidas", target: "duvidas" },
  { label: "Sobre", target: "/quem-somos" as const },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleClick = (target: string) => (e: React.MouseEvent) => {
    setOpen(false);
    if (target.startsWith("/")) return; // route link, let react-router handle
    e.preventDefault();
    if (pathname !== "/") {
      navigate(`/#${target}`);
      return;
    }
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center" aria-label="JustMed Atestados">
          <img src={logo} alt="JustMed Atestados" className="h-11 w-11 object-contain" />
        </Link>

        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((l) =>
            l.target.startsWith("/") ? (
              <Link
                key={l.label}
                to={l.target}
                className="text-sm font-medium text-white/85 hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={`/#${l.target}`}
                onClick={handleClick(l.target)}
                className="text-sm font-medium text-white/85 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            )
          )}
          <Link
            to="/selecionar-servico"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Solicitar atestado
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <button
          type="button"
          aria-label="Abrir menu"
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-white hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((l) =>
              l.target.startsWith("/") ? (
                <Link
                  key={l.label}
                  to={l.target}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-sm font-medium text-foreground/80 hover:text-primary"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={`/#${l.target}`}
                  onClick={handleClick(l.target)}
                  className="py-2.5 text-sm font-medium text-foreground/80 hover:text-primary"
                >
                  {l.label}
                </a>
              )
            )}
            <Link
              to="/selecionar-servico"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold"
            >
              Solicitar atestado
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
