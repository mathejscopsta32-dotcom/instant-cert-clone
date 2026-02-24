const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">+</span>
          </div>
          <span className="font-bold text-lg">
            Atestado<span className="text-primary">24h</span>
          </span>
        </div>
        <p className="text-sm opacity-70">
          © {new Date().getFullYear()} Atestado24h. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
