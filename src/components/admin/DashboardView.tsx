import { useMemo } from "react";
import { TrendingUp, DollarSign, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import heroImg from "@/assets/admin-dashboard-hero.jpg";

interface PedidoLite {
  id: string;
  status: string;
  valor_total: number;
  created_at: string;
  tipo: string;
  hospital_preferencia: string | null;
  estado: string | null;
}

interface Props {
  pedidos: PedidoLite[];
}

const COLORS = ["#10b981", "#22c55e", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];

const DashboardView = ({ pedidos }: Props) => {
  const stats = useMemo(() => {
    const total = pedidos.length;
    const aprovados = pedidos.filter(p => p.status === "aprovado");
    const pendentes = pedidos.filter(p => p.status === "pendente");
    const rejeitados = pedidos.filter(p => p.status === "rejeitado");
    const receita = aprovados.reduce((s, p) => s + Number(p.valor_total || 0), 0);
    const ticketMedio = aprovados.length ? receita / aprovados.length : 0;
    const conversao = total ? (aprovados.length / total) * 100 : 0;
    return { total, aprovados, pendentes, rejeitados, receita, ticketMedio, conversao };
  }, [pedidos]);

  // Last 14 days area chart
  const serieDias = useMemo(() => {
    const days: Array<{ data: string; pedidos: number; receita: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i));
      const label = format(d, "dd/MM", { locale: ptBR });
      const dayPedidos = pedidos.filter(p => {
        const pd = startOfDay(new Date(p.created_at));
        return pd.getTime() === d.getTime();
      });
      const receita = dayPedidos
        .filter(p => p.status === "aprovado")
        .reduce((s, p) => s + Number(p.valor_total || 0), 0);
      days.push({ data: label, pedidos: dayPedidos.length, receita: Number(receita.toFixed(2)) });
    }
    return days;
  }, [pedidos]);

  const porHospital = useMemo(() => {
    const map = new Map<string, number>();
    pedidos.forEach(p => {
      const k = p.hospital_preferencia || "—";
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([nome, qtd]) => ({ nome, qtd }))
      .sort((a, b) => b.qtd - a.qtd).slice(0, 6);
  }, [pedidos]);

  const statusPie = [
    { name: "Aprovados", value: stats.aprovados.length, color: "#10b981" },
    { name: "Pendentes", value: stats.pendentes.length, color: "#f59e0b" },
    { name: "Rejeitados", value: stats.rejeitados.length, color: "#ef4444" },
  ];

  const porEstado = useMemo(() => {
    const map = new Map<string, number>();
    pedidos.forEach(p => {
      const k = p.estado || "—";
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([uf, qtd]) => ({ uf, qtd }))
      .sort((a, b) => b.qtd - a.qtd).slice(0, 8);
  }, [pedidos]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border h-48 md:h-56">
        <img
          src={heroImg}
          alt="Dashboard"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-emerald-900/60 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
          <p className="text-emerald-300/90 text-xs font-semibold uppercase tracking-widest">Painel Executivo</p>
          <h2 className="text-white text-2xl md:text-4xl font-bold mt-1">Bem-vindo de volta</h2>
          <p className="text-white/80 text-sm mt-1">Visão completa dos seus pedidos, receita e operação em tempo real.</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Receita aprovada"
          value={`R$ ${stats.receita.toFixed(2).replace(".", ",")}`}
          accent="from-emerald-500 to-emerald-700"
        />
        <KpiCard
          icon={<FileText className="w-5 h-5" />}
          label="Pedidos totais"
          value={String(stats.total)}
          accent="from-sky-500 to-sky-700"
        />
        <KpiCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Taxa de aprovação"
          value={`${stats.conversao.toFixed(1)}%`}
          accent="from-violet-500 to-violet-700"
        />
        <KpiCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Ticket médio"
          value={`R$ ${stats.ticketMedio.toFixed(2).replace(".", ",")}`}
          accent="from-amber-500 to-amber-700"
        />
      </div>

      {/* Area chart receita */}
      <div className="bg-card border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground">Receita & Pedidos (14 dias)</h3>
            <p className="text-xs text-muted-foreground">Volume diário aprovado</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={serieDias} margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="grdReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grdPedidos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="data" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="receita" name="Receita (R$)" stroke="#10b981" strokeWidth={2.5} fill="url(#grdReceita)" />
              <Area type="monotone" dataKey="pedidos" name="Pedidos" stroke="#0ea5e9" strokeWidth={2} fill="url(#grdPedidos)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie status */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-foreground mb-1">Status dos pedidos</h3>
          <p className="text-xs text-muted-foreground mb-3">Distribuição geral</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {statusPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar hospital */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-foreground mb-1">Top hospitais</h3>
          <p className="text-xs text-muted-foreground mb-3">Mais escolhidos pelos clientes</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porHospital} margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="nome" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="qtd" radius={[8, 8, 0, 0]}>
                  {porHospital.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Estados */}
      <div className="bg-card border rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-foreground mb-1">Pedidos por estado</h3>
        <p className="text-xs text-muted-foreground mb-3">Top 8 UFs</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porEstado} margin={{ left: -10, right: 10, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="uf" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="qtd" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) => (
  <div className="relative overflow-hidden bg-card border rounded-2xl p-5 shadow-sm">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${accent} text-white shadow-md mb-3`}>
      {icon}
    </div>
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
    <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
  </div>
);

export default DashboardView;
