import { useState, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, Eye, Loader2, RefreshCw, LogOut, MousePointerClick, Key, Save, Trash2, Sun, Moon, Facebook, Download, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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
  pdf_url: string | null;
  tipo: string;
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
  const [pixelId, setPixelId] = useState("");
  const [pixelIdInput, setPixelIdInput] = useState("");
  const [pixelSaving, setPixelSaving] = useState(false);
  const [pixelSaved, setPixelSaved] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [iframeUrlInput, setIframeUrlInput] = useState("");
  const [iframeEnabled, setIframeEnabled] = useState(false);
  const [iframeSaving, setIframeSaving] = useState(false);
  const [iframeSaved, setIframeSaved] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

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

  const fetchPedidos = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data } = await supabase
      .from("pedidos")
      .select("id, nome_completo, cpf, email, telefone, valor_total, status, comprovante_url, created_at, dias_afastamento, hospital_preferencia, pdf_url, tipo")
      .order("created_at", { ascending: false });
    if (data) setPedidos(data as Pedido[]);
    if (showLoading) setLoading(false);
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

  const fetchPixelId = async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "facebook_pixel_id")
      .maybeSingle();
    if (data) {
      setPixelId(data.value);
      setPixelIdInput(data.value);
    }
  };

  useEffect(() => {
    if (!authChecking) {
      fetchPedidos().then(() => {
        initialLoadDone.current = true;
      });
    }
  }, [authChecking]);

  // Realtime subscription for new orders
  useEffect(() => {
    if (authChecking) return;
    const channel = supabase
      .channel("admin-pedidos-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pedidos" },
        (payload) => {
          const novo = payload.new as Pedido;
          setPedidos((prev) => [novo, ...prev]);
          if (initialLoadDone.current) {
            toast({
              title: "🔔 Novo pedido recebido!",
              description: `${novo.nome_completo} — R$ ${Number(novo.valor_total).toFixed(2).replace(".", ",")}`,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pedidos" },
        (payload) => {
          const updated = payload.new as Pedido;
          setPedidos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "pedidos" },
        (payload) => {
          const deletedId = (payload.old as any).id;
          setPedidos((prev) => prev.filter((p) => p.id !== deletedId));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authChecking, toast]);

  useEffect(() => {
    if (!authChecking && activeTab === "clicks") fetchClicks();
    if (!authChecking && activeTab === "config") { fetchPixKey(); fetchPixelId(); }
    if (!authChecking && activeTab === "iframe") fetchIframeSettings();
  }, [authChecking, activeTab]);

  const fetchIframeSettings = async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["iframe_url", "iframe_enabled"]);
    if (data) {
      data.forEach((row) => {
        if (row.key === "iframe_url") { setIframeUrl(row.value); setIframeUrlInput(row.value); }
        if (row.key === "iframe_enabled") setIframeEnabled(row.value === "true");
      });
    }
  };

  const handleSaveIframe = async () => {
    setIframeSaving(true);
    setIframeSaved(false);
    await supabase.from("app_settings").update({ value: iframeUrlInput.trim(), updated_at: new Date().toISOString() }).eq("key", "iframe_url");
    await supabase.from("app_settings").update({ value: iframeEnabled ? "true" : "false", updated_at: new Date().toISOString() }).eq("key", "iframe_enabled");
    setIframeUrl(iframeUrlInput.trim());
    setIframeSaved(true);
    setTimeout(() => setIframeSaved(false), 3000);
    setIframeSaving(false);
  };

  const handleToggleIframe = async (val: boolean) => {
    setIframeEnabled(val);
    await supabase.from("app_settings").update({ value: val ? "true" : "false", updated_at: new Date().toISOString() }).eq("key", "iframe_enabled");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    await supabase.from("pedidos").update({ status }).eq("id", id);
    await fetchPedidos(false);
    setActionLoading(null);
  };

  const viewComprovante = async (path: string) => {
    const { data } = await supabase.storage.from("comprovantes").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const downloadPdf = async (path: string, nome: string) => {
    const { data } = await supabase.storage.from("atestados").createSignedUrl(path, 300);
    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = `atestado-${nome.replace(/\s+/g, "_").toLowerCase()}.pdf`;
      a.target = "_blank";
      a.click();
    }
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

  const handleDeletePedido = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar este pedido?")) return;
    setActionLoading(id);
    await supabase.from("pedidos").delete().eq("id", id);
    await fetchPedidos(false);
    setActionLoading(null);
  };

  const generateRandomPixKey = () => {
    const uuid = crypto.randomUUID();
    setPixKeyInput(uuid);
  };

  const handleDeleteAllClicks = async () => {
    if (!confirm("Tem certeza que deseja apagar TODOS os clicks?")) return;
    setClicksLoading(true);
    await supabase.from("click_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setClicks([]);
    setClicksLoading(false);
  };

  const handleDeleteAllPedidos = async () => {
    if (!confirm("Tem certeza que deseja apagar TODOS os pedidos? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    await supabase.from("pedidos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setPedidos([]);
    setLoading(false);
  };

  const handleDeleteAllPendentes = async () => {
    if (!confirm("Tem certeza que deseja apagar TODOS os pedidos pendentes?")) return;
    setLoading(true);
    await supabase.from("pedidos").delete().eq("status", "pendente");
    setPedidos((prev) => prev.filter((p) => p.status !== "pendente"));
    setLoading(false);
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
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mr-2 ${p.tipo === 'consulta' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {p.tipo === 'consulta' ? 'CONSULTA' : 'ATESTADO'}
            </span>
            {p.dias_afastamento && <>{p.dias_afastamento} — </>}{p.hospital_preferencia && <>{p.hospital_preferencia} — </>}
            <span className="font-bold text-primary">R$ {Number(p.valor_total).toFixed(2).replace(".", ",")}</span>
          </p>
          <p className="text-[10px]">
            {format(new Date(p.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} — ID: {p.id.slice(0, 8)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {p.pdf_url && (
          <button
            onClick={() => downloadPdf(p.pdf_url!, p.nome_completo)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        )}
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
        <button
          onClick={() => handleDeletePedido(p.id)}
          disabled={actionLoading === p.id}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/30 text-destructive text-sm font-semibold hover:bg-destructive/10 transition-colors disabled:opacity-50"
          title="Apagar pedido"
        >
          {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
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

  const handleSavePixelId = async () => {
    if (!pixelIdInput.trim()) return;
    setPixelSaving(true);
    setPixelSaved(false);
    const { error } = await supabase
      .from("app_settings")
      .update({ value: pixelIdInput.trim(), updated_at: new Date().toISOString() })
      .eq("key", "facebook_pixel_id");
    if (!error) {
      setPixelId(pixelIdInput.trim());
      setPixelSaved(true);
      setTimeout(() => setPixelSaved(false), 3000);
    }
    setPixelSaving(false);
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
          <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const html = document.documentElement;
                html.classList.toggle("dark");
                localStorage.setItem("theme", html.classList.contains("dark") ? "dark" : "light");
              }}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-muted transition-colors"
              title="Alternar tema"
            >
              <Sun className="w-4 h-4 hidden dark:block" />
              <Moon className="w-4 h-4 block dark:hidden" />
            </button>
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
           <TabsList className="w-full grid grid-cols-6 mb-6">
            <TabsTrigger value="gerados">Pendentes ({pedidosGerados.length})</TabsTrigger>
            <TabsTrigger value="pagos">Aprovados ({pedidosPagos.length})</TabsTrigger>
            <TabsTrigger value="rejeitados">Rejeitados ({pedidosRejeitados.length})</TabsTrigger>
            <TabsTrigger value="clicks" className="gap-1.5">
              <MousePointerClick className="w-4 h-4" /> Clicks
            </TabsTrigger>
            <TabsTrigger value="iframe" className="gap-1.5">
              <Code className="w-4 h-4" /> Iframe
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-1.5">
              <Key className="w-4 h-4" /> PIX
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gerados">
            {loading ? renderLoading() : pedidosGerados.length === 0
              ? renderEmptyState("Nenhum pedido pendente.")
              : <div className="space-y-4">{pedidosGerados.map(renderPedidoCard)}</div>}
            {pedidosGerados.length > 0 && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleDeleteAllPendentes}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> Apagar Todos Pendentes
                </button>
              </div>
            )}
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

          {/* Botão global de apagar todos */}
          {pedidos.length > 0 && (activeTab === "gerados" || activeTab === "pagos" || activeTab === "rejeitados") && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleDeleteAllPedidos}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Apagar Todos os Pedidos
              </button>
            </div>
          )}

          <TabsContent value="clicks">
            {clicksLoading ? renderLoading() : clicks.length === 0
              ? renderEmptyState("Nenhum click registrado ainda.")
              : (
                <div className="space-y-6">
                  <div className="bg-card border rounded-xl overflow-hidden">
                    <div className="p-4 border-b">
                      <h3 className="font-bold text-foreground">Visitantes ({clicks.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-semibold text-muted-foreground">Cidade</th>
                            <th className="text-left p-3 font-semibold text-muted-foreground">Data/Hora</th>
                            <th className="text-left p-3 font-semibold text-muted-foreground">IP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clicks.map(c => (
                            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                              <td className="p-3 text-xs">{c.city || "—"}</td>
                              <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(c.created_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                              </td>
                              <td className="p-3 font-mono text-xs text-muted-foreground">{c.element_text || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleDeleteAllClicks}
                      disabled={clicksLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" /> Apagar Todos
                    </button>
                  </div>
                </div>
              )}
          </TabsContent>

          <TabsContent value="iframe">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-card border rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    Iframe Global
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure uma URL de iframe para exibir em todas as páginas do site.
                  </p>
                </div>

                <div className="flex items-center justify-between bg-muted rounded-lg p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Iframe ativo</p>
                    <p className="text-xs text-muted-foreground">Liga/desliga a exibição do iframe em todas as páginas</p>
                  </div>
                  <button
                    onClick={() => handleToggleIframe(!iframeEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${iframeEnabled ? 'bg-primary' : 'bg-border'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-lg transition-transform ${iframeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">URL do Iframe</label>
                  <input
                    type="text"
                    value={iframeUrlInput}
                    onChange={(e) => setIframeUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/pagina"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  />
                </div>

                <button
                  onClick={handleSaveIframe}
                  disabled={iframeSaving || !iframeUrlInput.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {iframeSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : iframeSaved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {iframeSaved ? "Salvo!" : "Salvar URL"}
                </button>

                {iframeUrl && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">URL atual:</p>
                    <p className="font-mono text-sm text-foreground break-all">{iframeUrl}</p>
                  </div>
                )}
              </div>
            </div>
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

              {/* Facebook Pixel Card */}
              <div className="bg-card border rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                    <Facebook className="w-5 h-5 text-primary" />
                    Facebook Pixel
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure o ID do pixel do Facebook para rastreamento.
                  </p>
                </div>

                {pixelId && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Pixel ID atual:</p>
                    <p className="font-mono text-sm text-foreground break-all">{pixelId}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Pixel ID</label>
                  <input
                    type="text"
                    value={pixelIdInput}
                    onChange={(e) => setPixelIdInput(e.target.value)}
                    placeholder="Cole o ID do pixel aqui..."
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                  />
                </div>

                <button
                  onClick={handleSavePixelId}
                  disabled={pixelSaving || !pixelIdInput.trim() || pixelIdInput.trim() === pixelId}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {pixelSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : pixelSaved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {pixelSaved ? "Salvo!" : "Salvar"}
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
