import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Eye, Loader2, RefreshCw, LogOut, MousePointerClick, Key, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface ClickEvent {
  id: string;
  page: string;
  city: string | null;
  element_text: string | null;
  created_at: string;
}

const Admin = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [clicksLoading, setClicksLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("gerados");
  const [pixKey, setPixKey] = useState("");
  const [pixKeyInput, setPixKeyInput] = useState("");
  const [pixSaving, setPixSaving] = useState(false);
  const [pixSaved, setPixSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      const { data: roleData } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
      if (!roleData) { await supabase.auth.signOut(); navigate("/admin/login"); return; }
      setAuthChecking(false);
    };
    checkAuth();
  }, [navigate]);

  const fetchPedidos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("pedidos")
      .select("id, nome_completo, cpf, email, telefone, valor_total, status, comprovante_url, created_at, dias_afastamento, hospital_preferencia")
      .order("created_at", { ascending: false });
    if (data) setPedidos(data as Pedido[]);
    setLoading(false);
  };

  const fetchClicks = async () => {
    setClicksLoading(true);
    const { data } = await supabase
      .from("click_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setClicks(data as ClickEvent[]);
    setClicksLoading(false);
  };

  const fetchPixKey = async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "pix_key")
      .maybeSingle();
    if (data) {
      setPixKey(data.value);
      setPixKeyInput(data.value);
    }
  };

  useEffect(() => {
    if (!authChecking) fetchPedidos();
  }, [authChecking]);

  useEffect(() => {
    if (!authChecking && activeTab === "clicks") fetchClicks();
    if (!authChecking && activeTab === "config") fetchPixKey();
  }, [authChecking, activeTab]);

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

  const handleSavePixKey = async () => {
    if (!pixKeyInput.trim()) return;
    setPixSaving(true);
    setPixSaved(false);
    const { error } = await supabase
      .from("app_settings")
      .update({ value: pixKeyInput.trim(), updated_at: new Date().toISOString() })
      .eq("key", "pix_key");
    if (!error) {
      setPixKey(pixKeyInput.trim());
      setPixSaved(true);
      setTimeout(() => setPixSaved(false), 3000);
    }
    setPixSaving(false);
  };

  const generateRandomPixKey = () => {
    const uuid = crypto.randomUUID();
    setPixKeyInput(uuid);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pendente: "bg-yellow-100 text-yellow-800",
      aprovado: "bg-green-100 text-green-800",
      rejeitado: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  const pedidosGerados = pedidos.filter(p => p.status === "pendente");
  const pedidosPagos = pedidos.filter(p => p.status === "aprovado");
  const pedidosRejeitados = pedidos.filter(p => p.status === "rejeitado");

  const renderPedidoCard = (p: Pedido) => (
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
            <Eye className="w-4 h-4" /> Comprovante
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
              <XCircle className="w-4 h-4" /> Rejeitar
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderEmptyState = (msg: string) => (
    <p className="text-center text-muted-foreground py-20">{msg}</p>
  );

  const renderLoading = () => (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const clicksByCity = clicks.reduce<Record<string, number>>((acc, c) => {
    const city = c.city || "Desconhecida";
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

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
          <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => { fetchPedidos(); if (activeTab === "clicks") fetchClicks(); }} className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
              <RefreshCw className="w-4 h-4" /> Atualizar
            </button>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 text-sm text-muted-foreground font-semibold hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{pedidosGerados.length}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{pedidosPagos.length}</p>
            <p className="text-xs text-muted-foreground">Aprovados</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{pedidosRejeitados.length}</p>
            <p className="text-xs text-muted-foreground">Rejeitados</p>
          </div>
          <div className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{pedidos.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5 mb-6">
            <TabsTrigger value="gerados">Pendentes ({pedidosGerados.length})</TabsTrigger>
            <TabsTrigger value="pagos">Aprovados ({pedidosPagos.length})</TabsTrigger>
            <TabsTrigger value="rejeitados">Rejeitados ({pedidosRejeitados.length})</TabsTrigger>
            <TabsTrigger value="clicks" className="gap-1.5">
              <MousePointerClick className="w-4 h-4" /> Clicks
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-1.5">
              <Key className="w-4 h-4" /> PIX
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gerados">
            {loading ? renderLoading() : pedidosGerados.length === 0
              ? renderEmptyState("Nenhum pedido pendente.")
              : <div className="space-y-4">{pedidosGerados.map(renderPedidoCard)}</div>}
          </TabsContent>

          <TabsContent value="pagos">
            {loading ? renderLoading() : pedidosPagos.length === 0
              ? renderEmptyState("Nenhum pedido aprovado.")
              : <div className="space-y-4">{pedidosPagos.map(renderPedidoCard)}</div>}
          </TabsContent>

          <TabsContent value="rejeitados">
            {loading ? renderLoading() : pedidosRejeitados.length === 0
              ? renderEmptyState("Nenhum pedido rejeitado.")
              : <div className="space-y-4">{pedidosRejeitados.map(renderPedidoCard)}</div>}
          </TabsContent>

          <TabsContent value="clicks">
            {clicksLoading ? renderLoading() : clicks.length === 0
              ? renderEmptyState("Nenhum click registrado ainda.")
              : (
                <div className="space-y-6">
                  <div className="bg-card border rounded-xl p-5">
                    <h3 className="font-bold text-foreground mb-3">Clicks por Cidade</h3>
                    <div className="space-y-2">
                      {Object.entries(clicksByCity).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
                        <div key={city} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{city}</span>
                          <span className="font-bold text-primary">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card border rounded-xl overflow-hidden">
                    <div className="p-4 border-b">
                      <h3 className="font-bold text-foreground">Últimos Clicks ({clicks.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-semibold text-muted-foreground">Página</th>
                            <th className="text-left p-3 font-semibold text-muted-foreground">Cidade</th>
                            <th className="text-left p-3 font-semibold text-muted-foreground">Data/Hora</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clicks.map(c => (
                            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                              <td className="p-3 font-mono text-xs">{c.page}</td>
                              <td className="p-3 text-xs">{c.city || "—"}</td>
                              <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(c.created_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
          </TabsContent>

          <TabsContent value="config">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-card border rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    Chave PIX
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Altere a chave PIX usada para receber pagamentos.
                  </p>
                </div>

                {pixKey && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Chave atual:</p>
                    <p className="font-mono text-sm text-foreground break-all">{pixKey}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nova chave PIX</label>
                  <input
                    type="text"
                    value={pixKeyInput}
                    onChange={(e) => setPixKeyInput(e.target.value)}
                    placeholder="Cole a nova chave PIX aqui..."
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={generateRandomPixKey}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Gerar Aleatória
                  </button>
                  <button
                    onClick={handleSavePixKey}
                    disabled={pixSaving || !pixKeyInput.trim() || pixKeyInput.trim() === pixKey}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {pixSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : pixSaved ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {pixSaved ? "Salvo!" : "Salvar"}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
