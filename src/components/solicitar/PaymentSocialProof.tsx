import { Star, Zap, ShieldCheck, Users, MessageCircle, CheckCircle2 } from "lucide-react";

const reviews = [
  { name: "Maria S.", city: "São Paulo", text: "Recebi meu atestado em menos de 5 minutos. Super prático!", rating: 5 },
  { name: "Carlos R.", city: "Rio de Janeiro", text: "Processo rápido e seguro. Recomendo demais!", rating: 5 },
  { name: "Ana P.", city: "Belo Horizonte", text: "Excelente atendimento. Documento com validade e muito profissional.", rating: 5 },
];

const PixIcon = () => (
  <svg viewBox="0 0 512 512" className="w-5 h-5" fill="currentColor">
    <path d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 372.6 391.5 392.6 391.5H407.7L293.6 505.6C275.2 524 245.7 524 227.3 505.6L112.8 391.1H126.4C146.4 391.1 165.3 383.3 179.5 369.1L242.4 292.5ZM ## Entrega Imediata badge */}
        262.5 219.5C257.1 224.9 247.8 224.9 242.4 219.5L179.5 142.9C165.3 128.7 146.4 120.9 126.4 120.9H112.8L227.3 6.4C245.7-12 275.2-12 293.6 6.4L407.7 120.5H392.6C372.6 120.5 353.7 128.3 339.5 142.5L262.5 219.5Z" />
    <path d="M505.6 227.3L446.2 167.9C443.3 171.9 439.8 175.6 435.7 178.8L392.6 135.7C383.8 126.9 372.1 122 359.8 122H332.5L262.5 192C252.3 202.2 238.8 207.3 225.3 207.3C211.8 207.3 198.3 202.2 188.1 192L118.1 122H126.4C113.4 122 101 126.9 92.2 135.7L49.1 178.8C45 175.6 41.5 171.9 38.6 167.9L6.4 227.3C-12 245.7-12 275.2 6.4 293.6L38.6 344.1C41.5 340.1 45 336.4 49.1 333.2L92.2 376.3C101 385.1 113.4 390 126.4 390H118.1L188.1 320C198.3 309.8 211.8 304.7 225.3 304.7C238.8 304.7 252.3 309.8 262.5 320L332.5 390H359.8C372.1 390 383.8 385.1 392.6 376.3L435.7 333.2C439.8 336.4 443.3 340.1 446.2 344.1L505.6 293.6C524 275.2 524 245.7 505.6 227.3Z" />
  </svg>
);

export const EntregaImediataBadge = () => (
  <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4">
    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <Zap className="w-6 h-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-bold text-primary flex items-center gap-1.5">
          ⚡ Entrega Imediata
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Seu documento é liberado automaticamente após a confirmação do pagamento
        </p>
      </div>
    </div>
  </div>
);

export const PaymentTrustBadges = () => (
  <div className="grid grid-cols-2 gap-2">
    {[
      { icon: ShieldCheck, label: "Pagamento Seguro", sub: "Criptografia SSL" },
      { icon: CheckCircle2, label: "Confirmação Automática", sub: "Via PIX" },
      { icon: Users, label: "+12.000 Clientes", sub: "Atendidos" },
      { icon: Star, label: "4.9 de Avaliação", sub: "Google Reviews" },
    ].map((item) => (
      <div key={item.label} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2.5 border border-border/50">
        <item.icon className="w-4 h-4 text-primary shrink-0" />
        <div>
          <p className="text-[11px] font-semibold text-foreground leading-tight">{item.label}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{item.sub}</p>
        </div>
      </div>
    ))}
  </div>
);

export const PaymentReviews = () => (
  <div className="space-y-2">
    <p className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wider">
      O que nossos clientes dizem
    </p>
    <div className="space-y-2">
      {reviews.map((r) => (
        <div key={r.name} className="bg-muted/30 border border-border/50 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: r.rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-xs text-foreground leading-relaxed">"{r.text}"</p>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">{r.name} — {r.city}</p>
        </div>
      ))}
    </div>
  </div>
);

export const PixPaymentHeader = ({ label }: { label: string }) => (
  <div className="text-center">
    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#32BCAD]/10 flex items-center justify-center">
      <PixIcon />
    </div>
    <h2 className="text-xl font-bold text-foreground">Pagamento via PIX</h2>
    <p className="text-sm text-muted-foreground mt-1">{label}</p>
  </div>
);

export const WhatsAppButton = () => (
  <a
    href="https://wa.me/5500000000000?text=Olá,%20preciso%20de%20ajuda%20com%20meu%20pedido"
    target="_blank"
    rel="noopener noreferrer"
    className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-3 rounded-xl font-semibold text-sm transition-colors"
  >
    <MessageCircle className="w-4 h-4" />
    Precisa de ajuda? Fale no WhatsApp
  </a>
);

export const PixBrandFooter = () => (
  <div className="flex flex-col items-center gap-3 pt-2">
    <div className="flex items-center justify-center gap-6">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-primary" />
        Pagamento 100% Seguro
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Zap className="w-4 h-4 text-primary" />
        Liberação Imediata
      </div>
    </div>
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
      <span className="text-muted-foreground/40">
        <PixIcon />
      </span>
      Pagamento processado pelo Banco Central do Brasil
    </div>
  </div>
);
