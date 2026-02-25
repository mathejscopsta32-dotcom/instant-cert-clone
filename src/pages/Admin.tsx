import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Eye, Loader2, RefreshCw, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Pedido {
  id: string;
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  valor_total: number;
  status: string;
  comprovante_url: string | null;
  created_at: string;
  dias_afastamento: string | null;
  hospital_preferencia: string | null;
}

const Admin = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("pendente");
  const navigate = useNavigate();

  // Check auth + admin role on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      setAuthChecking(false);
    };
    checkAuth();
  }, [navigate]);

  const fetchPedidos = async () => {
    setLoading(true);
    const query = supabase
      .from("pedidos")
      .select("id, nome_completo, cpf, email, telefone, valor_total, status, comprovante_url, created_at, dias_afastamento, hospital_preferencia")
      .order("created_at", { ascending: false });

    if (filter !== "todos") {
      query.eq("status", filter);
    }

    const { data, error } = await query;
    if (!error && data) setPedidos(data as Pedido[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!authChecking) fetchPedidos();
  }, [filter, authChecking]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    await supabase.from("pedidos").update({ status }).eq("id", id);
    await fetchPedidos();
    setActionLoading(null);
  };

  const viewComprovante = async (path: string) => {
    const { data } = await supabase.storage.from("comprovantes").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pendente: "bg-yellow-100 text-yellow-800",
      aprovado: "bg-green-100 text-green-800",
      rejeitado: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Painel Admin — Pedidos</h1>
          <div className="flex items-center gap-3">
            <button onClick={fetchPedidos} className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground font-semibold hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {["pendente", "aprovado", "rejeitado", "todos"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pedidos.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">Nenhum pedido encontrado.</p>
        ) : (
          <div className="space-y-4">
            {pedidos.map((p) => (
              <div key={p.id} className="bg-card border rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-foreground truncate">{p.nome_completo}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>CPF: {p.cpf} | Tel: {p.telefone}</p>
                    <p>Email: {p.email}</p>
                    <p>
                      {p.dias_afastamento} — {p.hospital_preferencia} —{" "}
                      <span className="font-bold text-primary">R$ {Number(p.valor_total).toFixed(2).replace(".", ",")}</span>
                    </p>
                    <p className="text-[10px]">
                      {format(new Date(p.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} — ID: {p.id.slice(0, 8)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.comprovante_url && (
                    <button
                      onClick={() => viewComprovante(p.comprovante_url!)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Comprovante
                    </button>
                  )}

                  {p.status === "pendente" && (
                    <>
                      <button
                        onClick={() => updateStatus(p.id, "aprovado")}
                        disabled={actionLoading === p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Aprovar
                      </button>
                      <button
                        onClick={() => updateStatus(p.id, "rejeitado")}
                        disabled={actionLoading === p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeitar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
