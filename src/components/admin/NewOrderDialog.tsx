import { useEffect } from "react";
import { Bell, X, Eye } from "lucide-react";

interface Props {
  open: boolean;
  pedido: { nome_completo: string; valor_total: number; tipo: string; id: string } | null;
  onClose: () => void;
  onView: () => void;
}

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = 880;
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start();
    o.stop(ctx.currentTime + 0.45);
    setTimeout(() => {
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.connect(g2); g2.connect(ctx.destination);
      o2.type = "sine"; o2.frequency.value = 1320;
      g2.gain.setValueAtTime(0.001, ctx.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o2.start();
      o2.stop(ctx.currentTime + 0.45);
    }, 220);
  } catch {/* ignore */}
};

const NewOrderDialog = ({ open, pedido, onClose, onView }: Props) => {
  useEffect(() => {
    if (open) playBeep();
  }, [open]);

  if (!open || !pedido) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border-2 border-primary rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold opacity-90">Novo pedido!</p>
              <p className="text-lg font-bold">Acabou de chegar</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="font-bold text-foreground">{pedido.nome_completo}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 ${pedido.tipo === 'consulta' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {pedido.tipo === 'consulta' ? 'CONSULTA' : 'ATESTADO'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="text-2xl font-bold text-primary">
                R$ {Number(pedido.valor_total).toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-semibold hover:bg-muted transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={onView}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Eye className="w-4 h-4" /> Ver pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewOrderDialog;
