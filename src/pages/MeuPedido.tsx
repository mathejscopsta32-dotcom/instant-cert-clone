import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, XCircle, Download, ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { generateAtestadoPDF } from "@/lib/generateAtestadoPDF";
import type { FormData } from "@/pages/Solicitar";

type PedidoStatus = "pendente" | "aprovado" | "rejeitado";

interface PedidoPublic {
  id: string;
  nome_completo: string;
  valor_total: number;
  status: PedidoStatus;
  created_at: string;
}

const statusConfig = {
  pendente: {
    icon: Clock,
    label: "Aguardando Confirmação",
    description: "Seu comprovante está sendo analisado. Em breve seu atestado será liberado.",
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
  },
  aprovado: {
    icon: CheckCircle2,
    label: "Pagamento Aprovado!",
    description: "Seu atestado está pronto para download.",
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20",
  },
  rejeitado: {
    icon: XCircle,
    label: "Pagamento Não Confirmado",
    description: "Não foi possível confirmar seu pagamento. Entre em contato conosco.",
    color: "text-destructive",
    bg: "bg-destructive/5 border-destructive/20",
  },
};

const MeuPedido = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pedidoId = searchParams.get("id");
  const [pedido, setPedido] = useState<PedidoPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pedidoId) return;

    const fetchPedido = async () => {
      // Query the public view (only exposes name, value, status)
      const { data, error } = await supabase
        .from("pedidos_public" as any)
        .select("*")
        .eq("id", pedidoId)
        .single();
      if (!error && data) setPedido(data as unknown as PedidoPublic);
      setLoading(false);
    };

    fetchPedido();
    const interval = setInterval(fetchPedido, 10000);
    return () => clearInterval(interval);
  }, [pedidoId]);

  const handleDownloadPDF = () => {
    if (!pedido || !pedidoId) return;
    // Retrieve form data stored locally during order creation
    const stored = localStorage.getItem(`pedido_form_${pedidoId}`);
    if (!stored) {
      alert("Dados do formulário não encontrados. Por favor, entre em contato conosco.");
      return;
    }
    const formData: FormData = JSON.parse(stored);
    const doc = generateAtestadoPDF(formData);
    doc.save(`atestado-${pedido.nome_completo.replace(/\s+/g, "_").toLowerCase()}.pdf`);
  };

  if (!pedidoId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">ID do pedido não encontrado.</p>
          <button onClick={() => navigate("/")} className="mt-4 text-primary font-semibold hover:underline">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Pedido não encontrado.</p>
          <button onClick={() => navigate("/")} className="mt-4 text-primary font-semibold hover:underline">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const config = statusConfig[pedido.status];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          {/* Status */}
          <div className={`rounded-xl border p-6 text-center mb-6 ${config.bg}`}>
            <StatusIcon className={`w-12 h-12 mx-auto mb-3 ${config.color}`} />
            <h1 className={`text-xl font-bold ${config.color}`}>{config.label}</h1>
            <p className="text-sm text-muted-foreground mt-2">{config.description}</p>
          </div>

          {/* Order details - only name and value */}
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome</span>
              <span className="font-medium text-foreground">{pedido.nome_completo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor</span>
              <span className="font-bold text-primary">R$ {Number(pedido.valor_total).toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pedido</span>
              <span className="font-mono text-xs text-muted-foreground">{pedido.id.slice(0, 8)}</span>
            </div>
          </div>

          {/* Download button (only if approved) */}
          {pedido.status === "aprovado" && (
            <button
              onClick={handleDownloadPDF}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity mb-4"
            >
              <Download className="w-5 h-5" />
              Baixar Atestado em PDF
            </button>
          )}

          {pedido.status === "pendente" && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Atualizando automaticamente...
            </div>
          )}

          <button
            onClick={() => navigate("/")}
            className="w-full inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-muted transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeuPedido;
