import { useState, useEffect, useRef, useMemo } from "react";
import {
  CheckCircle2, XCircle, Eye, Loader2, RefreshCw, LogOut, MousePointerClick,
  Key, Save, Trash2, Sun, Moon, Download, Code, LayoutDashboard, FileText,
  FileEdit, MessageCircle, Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import DashboardView from "@/components/admin/DashboardView";
import EditDocumentoDialog from "@/components/admin/EditDocumentoDialog";
import NewOrderDialog from "@/components/admin/NewOrderDialog";
import { regenerateAtestadoPDF, type PedidoLike } from "@/lib/regenerateAtestadoPDF";

interface Pedido extends PedidoLike {
  valor_total: number;
  status: string;
  comprovante_url: string | null;
  created_at: string;
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

type View =
  | "dashboard" | "pendentes" | "aprovados" | "rejeitados" | "documentos"
  | "clicks" | "iframe" | "pix";

const NAV: Array<{ id: View; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pendentes", label: "Pendentes", icon: Loader2 },
  { id: "aprovados", label: "Aprovados", icon: CheckCircle2 },
  { id: "rejeitados", label: "Rejeitados", icon: XCircle },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "clicks", label: "Visitantes", icon: MousePointerClick },
  { id: "iframe", label: "Iframe", icon: Code },
  { id: "pix", label: "Chave PIX", icon: Key },
];

const PEDIDO_COLS =
  "id, nome_completo, cpf, email, telefone, valor_total, status, comprovante_url, created_at, dias_afastamento, hospital_preferencia, pdf_url, tipo, data_nascimento, cidade, estado, sintomas, outros_sintomas, inicio_sintomas, inicio_sintomas_data, observacoes, addon_cid, addon_qr_code, addon_pacote3";

const Admin = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [clicksLoading, setClicksLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pixKey, setPixKey] = useState("");
  const [pixKeyInput, setPixKeyInput] = useState("");
  const [pixSaving, setPixSaving] = useState(false);
  const [pixSaved, setPixSaved] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [iframeUrlInput, setIframeUrlInput] = useState("");
  const [iframeEnabled, setIframeEnabled] = useState(false);
  const [iframeSaving, setIframeSaving] = useState(false);
  const [iframeSaved, setIframeSaved] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [newOrderPopup, setNewOrderPopup] = useState<Pedido | null>(null);
  const navigate = useNavigate();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
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
      .from("pedidos").select(PEDIDO_COLS)
      .order("created_at", { ascending: false });
    if (data) setPedidos(data as Pedido[]);
    if (showLoading) setLoading(false);
  };

  const fetchClicks = async () => {
    setClicksLoading(true);
    const { data } = await supabase
      .from("click_events").select("*")
      .order("created_at", { ascending: false }).limit(200);
    if (data) setClicks(data as ClickEvent[]);
    setClicksLoading(false);
  };

  const fetchPixKey = async () => {
    const { data } = await supabase.from("app_settings")
      .select("value").eq("key", "pix_key").maybeSingle();
    if (data) { setPixKey(data.value); setPixKeyInput(data.value); }
  };

  const fetchIframeSettings = async () => {
    const { data } = await supabase.from("app_settings")
      .select("key, value").in("key", ["iframe_url", "iframe_enabled"]);
    if (data) data.forEach((row) => {
      if (row.key === "iframe_url") { setIframeUrl(row.value); setIframeUrlInput(row.value); }
      if (row.key === "iframe_enabled") setIframeEnabled(row.value === "true");
    });
  };

  useEffect(() => {
    if (!authChecking) {
      fetchPedidos().then(() => { initialLoadDone.current = true; });
    }
  }, [authChecking]);

  useEffect(() => {
    if (authChecking) return;
    const channel = supabase.channel("admin-pedidos-realtime")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "pedidos" },
        (payload) => {
          const novo = payload.new as Pedido;
          setPedidos((prev) => [novo, ...prev]);
          if (initialLoadDone.current) {
            setNewOrderPopup(novo);
            toast.success(`🔔 Novo pedido: ${novo.nome_completo}`);
          }
        }
      )
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "pedidos" },
        (payload) => {
          const updated = payload.new as Pedido;
          setPedidos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }
      )
      .on("postgres_changes",
        { event: "DELETE", schema: "public", table: "pedidos" },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setPedidos((prev) => prev.filter((p) => p.id !== deletedId));
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authChecking]);

  useEffect(() => {
    if (authChecking) return;
    if (view === "clicks") fetchClicks();
    if (view === "pix") fetchPixKey();
    if (view === "iframe") fetchIframeSettings();
  }, [authChecking, view]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    await supabase.from("pedidos").update({ status }).eq("id", id);
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

  const sendWhatsApp = async (p: Pedido) => {
    if (!p.telefone) { toast.error("Cliente sem telefone."); return; }
    setActionLoading(p.id);
    let pdfLink = "";
    if (p.pdf_url) {
      const { data } = await supabase.storage.from("atestados").createSignedUrl(p.pdf_url, 60 * 60 * 24 * 7);
      if (data?.signedUrl) pdfLink = data.signedUrl;
    }
    const phone = p.telefone.replace(/\D/g, "");
    const fullPhone = phone.length <= 11 ? `55${phone}` : phone;
    const msg =
      `Olá ${p.nome_completo.split(" ")[0]}! 👋\n\n` +
      `Seu atestado médico está pronto.\n\n` +
      (pdfLink ? `📎 Acesse: ${pdfLink}\n\n(O link é válido por 7 dias)` : `Em breve enviaremos o documento.`);
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setActionLoading(null);
  };

  const handleRegenerate = async (p: Pedido) => {
    setActionLoading(p.id);
    try {
      await regenerateAtestadoPDF(p);
      await fetchPedidos(false);
      toast.success("PDF regenerado!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao regenerar PDF.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSavePixKey = async () => {
    if (!pixKeyInput.trim()) return;
    setPixSaving(true); setPixSaved(false);
    const { error } = await supabase.from("app_settings")
      .update({ value: pixKeyInput.trim(), updated_at: new Date().toISOString() })
      .eq("key", "pix_key");
    if (!error) {
      setPixKey(pixKeyInput.trim()); setPixSaved(true);
      setTimeout(() => setPixSaved(false), 3000);
    }
    setPixSaving(false);
  };

  const handleSaveIframe = async () => {
    setIframeSaving(true); setIframeSaved(false);
    await supabase.from("app_settings").update({ value: iframeUrlInput.trim(), updated_at: new Date().toISOString() }).eq("key", "iframe_url");
    await supabase.from("app_settings").update({ value: iframeEnabled ? "true" : "false", updated_at: new Date().toISOString() }).eq("key", "iframe_enabled");
    setIframeUrl(iframeUrlInput.trim()); setIframeSaved(true);
    setTimeout(() => setIframeSaved(false), 3000);
    setIframeSaving(false);
  };

  const handleToggleIframe = async (val: boolean) => {
    setIframeEnabled(val);
    await supabase.from("app_settings").update({ value: val ? "true" : "false", updated_at: new Date().toISOString() }).eq("key", "iframe_enabled");
  };

  const handleDeletePedido = async (id: string) => {
    if (!confirm("Apagar este pedido?")) return;
    setActionLoading(id);
    await supabase.from("pedidos").delete().eq("id", id);
    setActionLoading(null);
  };

  const handleDeleteAllPedidos = async () => {
    if (!confirm("Tem certeza? Apagar TODOS os pedidos é irreversível.")) return;
    setLoading(true);
    await supabase.from("pedidos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setPedidos([]); setLoading(false);
  };

  const handleDeleteAllPendentes = async () => {
    if (!confirm("Apagar todos os pendentes?")) return;
    setLoading(true);
    await supabase.from("pedidos").delete().eq("status", "pendente");
    setPedidos((prev) => prev.filter((p) => p.status !== "pendente"));
    setLoading(false);
  };

  const handleDeleteAllClicks = async () => {
    if (!confirm("Apagar todos os clicks?")) return;
    setClicksLoading(true);
    await supabase.from("click_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setClicks([]); setClicksLoading(false);
  };

  const handleDownloadEmails = async () => {
    let all: string[] = [];
    let from = 0; const batch = 1000;
    while (true) {
      const { data } = await supabase.from("pedidos").select("email")
        .order("created_at", { ascending: false }).range(from, from + batch - 1);
      if (!data || data.length === 0) break;
      all = all.concat(data.map((d: { email: string }) => d.email).filter(Boolean));
      if (data.length < batch) break;
      from += batch;
    }
    const unique = [...new Set(all)];
    if (!unique.length) { toast.error("Nenhum email encontrado"); return; }
    const blob = new Blob([unique.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `emails-${format(new Date(), "dd-MM-yyyy")}.txt`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`${unique.length} emails exportados!`);
  };

  const statusBadge = (status: string) => ({
    pendente: "bg-yellow-100 text-yellow-800",
    aprovado: "bg-green-100 text-green-800",
    rejeitado: "bg-red-100 text-red-800",
  }[status] || "bg-muted text-muted-foreground");

  const pendentes = useMemo(() => pedidos.filter(p => p.status === "pendente"), [pedidos]);
  const aprovados = useMemo(() => pedidos.filter(p => p.status === "aprovado"), [pedidos]);
  const rejeitados = useMemo(() => pedidos.filter(p => p.status === "rejeitado"), [pedidos]);

  const PedidoCard = ({ p }: { p: Pedido }) => (
    <div className="bg-card border rounded-xl p-5 flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h3 className="font-bold text-foreground truncate">{p.nome_completo}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(p.status)}`}>{p.status}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.tipo === 'consulta' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {p.tipo === 'consulta' ? 'CONSULTA' : 'ATESTADO'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>CPF: {p.cpf} | Tel: {p.telefone} | {p.estado || "—"}</p>
          <p>Email: {p.email}</p>
          <p>
            {p.dias_afastamento && <>{p.dias_afastamento} — </>}
            {p.hospital_preferencia && <>{p.hospital_preferencia} — </>}
            <span className="font-bold text-primary">R$ {Number(p.valor_total).toFixed(2).replace(".", ",")}</span>
          </p>
          <p className="text-[10px]">
            {format(new Date(p.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} — ID: {p.id.slice(0, 8)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {p.pdf_url && (
          <button onClick={() => downloadPdf(p.pdf_url!, p.nome_completo)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        )}
        {p.telefone && (
          <button onClick={() => sendWhatsApp(p)} disabled={actionLoading === p.id}
            title="Enviar pelo WhatsApp"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50">
            {actionLoading === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
            WhatsApp
          </button>
        )}
        <button onClick={() => setEditingPedido(p)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold hover:bg-muted">
          <FileEdit className="w-3.5 h-3.5" /> Editar
        </button>
        <button onClick={() => handleRegenerate(p)} disabled={actionLoading === p.id}
          title="Regenerar PDF com dados atuais"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold hover:bg-muted disabled:opacity-50">
          {actionLoading === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Regenerar
        </button>
        {p.comprovante_url && (
          <button onClick={() => viewComprovante(p.comprovante_url!)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold hover:bg-muted">
            <Eye className="w-3.5 h-3.5" /> Comp.
          </button>
        )}
        {p.status === "pendente" && (
          <>
            <button onClick={() => updateStatus(p.id, "aprovado")} disabled={actionLoading === p.id}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50">
              <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
            </button>
            <button onClick={() => updateStatus(p.id, "rejeitado")} disabled={actionLoading === p.id}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50">
              <XCircle className="w-3.5 h-3.5" /> Rejeitar
            </button>
          </>
        )}
        <button onClick={() => handleDeletePedido(p.id)} disabled={actionLoading === p.id}
          className="inline-flex items-center gap-1.5 px-2 py-2 rounded-lg border border-destructive/30 text-destructive text-xs hover:bg-destructive/10 disabled:opacity-50"
          title="Apagar">
          {actionLoading === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );

  const renderEmptyState = (msg: string) => (
    <div className="text-center py-20 text-muted-foreground">{msg}</div>
  );

  const renderLoading = () => (
    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  );

  const PedidoList = ({ list, emptyMsg, showDeleteAll, onDeleteAll }: { list: Pedido[]; emptyMsg: string; showDeleteAll?: boolean; onDeleteAll?: () => void }) => (
    loading ? renderLoading() : list.length === 0 ? renderEmptyState(emptyMsg) : (
      <div className="space-y-4">
        {list.map(p => <PedidoCard key={p.id} p={p} />)}
        {showDeleteAll && onDeleteAll && (
          <div className="flex justify-end pt-2">
            <button onClick={onDeleteAll} disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">
              <Trash2 className="w-4 h-4" /> Apagar todos
            </button>
          </div>
        )}
      </div>
    )
  );

  if (authChecking) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>;
  }

  const currentTitle = NAV.find(n => n.id === view)?.label ?? "";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-card border-r flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b">
          <h1 className="text-lg font-bold text-foreground">Painel Admin</h1>
          <p className="text-xs text-muted-foreground">Gestão completa</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = view === n.id;
            const count =
              n.id === "pendentes" ? pendentes.length :
              n.id === "aprovados" ? aprovados.length :
              n.id === "rejeitados" ? rejeitados.length :
              n.id === "documentos" ? pedidos.length :
              undefined;
            return (
              <button key={n.id} onClick={() => { setView(n.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-muted"}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{n.label}</span>
                {count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${active ? "bg-white/20" : "bg-muted-foreground/10"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-2">
          <button onClick={() => {
            const html = document.documentElement;
            html.classList.toggle("dark");
            localStorage.setItem("theme", html.classList.contains("dark") ? "dark" : "light");
          }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted">
            <Sun className="w-4 h-4 hidden dark:block" />
            <Moon className="w-4 h-4 block dark:hidden" />
            <span>Alternar tema</span>
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-foreground">{currentTitle}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadEmails}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold hover:bg-muted">
                <Download className="w-3.5 h-3.5" /> Emails
              </button>
              <button onClick={() => { fetchPedidos(); if (view === "clicks") fetchClicks(); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-primary text-xs font-semibold hover:bg-primary/10">
                <RefreshCw className="w-3.5 h-3.5" /> Atualizar
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-7xl">
          {view === "dashboard" && <DashboardView pedidos={pedidos} />}

          {view === "pendentes" && (
            <PedidoList list={pendentes} emptyMsg="Nenhum pedido pendente."
              showDeleteAll={pendentes.length > 0} onDeleteAll={handleDeleteAllPendentes} />
          )}
          {view === "aprovados" && (
            <PedidoList list={aprovados} emptyMsg="Nenhum pedido aprovado." />
          )}
          {view === "rejeitados" && (
            <PedidoList list={rejeitados} emptyMsg="Nenhum pedido rejeitado." />
          )}

          {view === "documentos" && (
            <div className="space-y-4">
              <div className="bg-card border rounded-xl p-5">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Editor de documentos
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Edite o nome do médico, CRM, hospital, dias de afastamento, datas e regenere o PDF de cada pedido.
                </p>
              </div>
              {loading ? renderLoading() : pedidos.length === 0
                ? renderEmptyState("Nenhum documento.")
                : <div className="space-y-4">{pedidos.map(p => <PedidoCard key={p.id} p={p} />)}</div>}
              {pedidos.length > 0 && (
                <div className="flex justify-end pt-2">
                  <button onClick={handleDeleteAllPedidos} disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                    <Trash2 className="w-4 h-4" /> Apagar todos
                  </button>
                </div>
              )}
            </div>
          )}

          {view === "clicks" && (
            <>{clicksLoading ? renderLoading() : clicks.length === 0
              ? renderEmptyState("Nenhum click registrado ainda.")
              : (
                <div className="space-y-4">
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
                    <button onClick={handleDeleteAllClicks} disabled={clicksLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                      <Trash2 className="w-4 h-4" /> Apagar todos
                    </button>
                  </div>
                </div>
              )}</>
          )}

          {view === "iframe" && (
            <div className="max-w-xl space-y-6">
              <div className="bg-card border rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" /> Iframe Global
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Configure uma URL para exibir em todas as páginas.</p>
                </div>
                <div className="flex items-center justify-between bg-muted rounded-lg p-4">
                  <div>
                    <p className="text-sm font-medium">Iframe ativo</p>
                    <p className="text-xs text-muted-foreground">Liga/desliga em todas as páginas</p>
                  </div>
                  <button onClick={() => handleToggleIframe(!iframeEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${iframeEnabled ? 'bg-primary' : 'bg-border'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform ${iframeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL do Iframe</label>
                  <input type="text" value={iframeUrlInput} onChange={(e) => setIframeUrlInput(e.target.value)}
                    placeholder="https://exemplo.com" className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm font-mono" />
                </div>
                <button onClick={handleSaveIframe} disabled={iframeSaving || !iframeUrlInput.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                  {iframeSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : iframeSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {iframeSaved ? "Salvo!" : "Salvar URL"}
                </button>
                {iframeUrl && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">URL atual:</p>
                    <p className="font-mono text-sm break-all">{iframeUrl}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "pix" && (
            <div className="max-w-xl space-y-6">
              <div className="bg-card border rounded-xl p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" /> Chave PIX
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Altere a chave PIX usada para receber pagamentos.</p>
                </div>
                {pixKey && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Chave atual:</p>
                    <p className="font-mono text-sm break-all">{pixKey}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nova chave PIX</label>
                  <input type="text" value={pixKeyInput} onChange={(e) => setPixKeyInput(e.target.value)}
                    placeholder="Cole a nova chave PIX..." className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm font-mono" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPixKeyInput(crypto.randomUUID())}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted">
                    <RefreshCw className="w-4 h-4" /> Gerar Aleatória
                  </button>
                  <button onClick={handleSavePixKey} disabled={pixSaving || !pixKeyInput.trim() || pixKeyInput.trim() === pixKey}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                    {pixSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : pixSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {pixSaved ? "Salvo!" : "Salvar"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <EditDocumentoDialog
        pedido={editingPedido}
        open={!!editingPedido}
        onClose={() => setEditingPedido(null)}
        onSaved={() => fetchPedidos(false)}
      />

      <NewOrderDialog
        open={!!newOrderPopup}
        pedido={newOrderPopup}
        onClose={() => setNewOrderPopup(null)}
        onView={() => { setView("pendentes"); setNewOrderPopup(null); }}
      />
    </div>
  );
};

export default Admin;
