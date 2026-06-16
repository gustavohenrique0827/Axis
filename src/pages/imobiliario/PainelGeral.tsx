import { useState, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";
import {
  Building2, Eye, DollarSign, TrendingUp, MapPin, Star,
  Calendar, ArrowUpRight, Target, Columns3,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

type ImovelRow = {
  id: string; titulo: string; tipo: string; status: string;
  valor: number; bairro: string; cidade: string;
  visitas: number; created_at: string; operacao: string;
};
type CorretorRow = {
  nome: string; vendas_mes: number; vgv_mes: number; meta: number; avaliacao: number;
};
type VisitaRow = {
  data: string; hora: string; imovel: string; cliente: string; corretor: string; status: string;
};
type LeadRow = { etapa: string; orcamento: number; status: string; };

const TIPO_COLORS: Record<string, string> = {
  Apartamento: "#3b82f6", Casa: "#8b5cf6", Cobertura: "#06b6d4",
  Comercial: "#f59e0b", Kitnet: "#10b981", Terreno: "#f97316",
};
const ETAPA_COLORS: Record<string, string> = {
  Prospecção: "bg-blue-400", Qualificação: "bg-amber-400",
  Apresentação: "bg-violet-400", Negociação: "bg-cyan-400", Fechamento: "bg-emerald-400",
};
const ETAPAS = ["Prospecção", "Qualificação", "Apresentação", "Negociação", "Fechamento"];
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function KPICard({ icon: Icon, label, value, sub, color, trend, trendVal }: {
  icon: any; label: string; value: string; sub?: string; color: string;
  trend?: "up" | "down"; trendVal?: string;
}) {
  return (
    <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trendVal && (
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${trend === "up" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            <ArrowUpRight className="w-3 h-3" />
            {trendVal}
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{label}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F1929] border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black text-white">
          {p.dataKey === "vgv" ? `R$ ${p.value}M` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function ImobiliarioPainel() {
  const [imoveis, setImoveis] = useState<ImovelRow[]>([]);
  const [corretores, setCorretores] = useState<CorretorRow[]>([]);
  const [visitas, setVisitas] = useState<VisitaRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [activePie, setActivePie] = useState<number | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      supabase.from("imobiliario_imoveis").select("id,titulo,tipo,status,valor,bairro,cidade,visitas,created_at,operacao"),
      supabase.from("imobiliario_corretores").select("nome,vendas_mes,vgv_mes,meta,avaliacao").order("vendas_mes", { ascending: false }),
      supabase.from("imobiliario_visitas").select("data,hora,imovel,cliente,corretor,status").gte("data", today).order("data").limit(5),
      supabase.from("imobiliario_leads").select("etapa,orcamento,status"),
    ]).then(([im, cor, vis, lea]) => {
      setImoveis(im.data ?? []);
      setCorretores(cor.data ?? []);
      setVisitas(vis.data ?? []);
      setLeads(lea.data ?? []);
    });
  }, []);

  // KPIs
  const disponiveis = imoveis.filter(i => i.status === "Disponível").length;
  const vendidosMes = (() => {
    const now = new Date();
    return imoveis.filter(i => {
      if (i.status !== "Vendido") return false;
      const d = new Date(i.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  })();
  const vgvMes = (() => {
    const now = new Date();
    return imoveis.filter(i => {
      if (i.status !== "Vendido" || i.operacao !== "Venda") return false;
      const d = new Date(i.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, i) => s + i.valor, 0);
  })();
  const leadsAtivos = leads.filter(l => l.status === "Ativo").length;
  const leadsGanhos = leads.filter(l => l.status === "Ganho").length;
  const conversao = leads.length > 0 ? ((leadsGanhos / leads.length) * 100).toFixed(1) : "0.0";

  // VGV por mês (últimos 6 meses)
  const vgvMensal = Array.from({ length: 6 }, (_, i) => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const vendidos = imoveis.filter(im => {
      if (im.status !== "Vendido") return false;
      const dt = new Date(im.created_at);
      return dt.getMonth() === m && dt.getFullYear() === y;
    });
    return {
      mes: MESES[m],
      vgv: Number((vendidos.reduce((s, im) => s + im.valor, 0) / 1e6).toFixed(1)),
      vendas: vendidos.length,
    };
  });

  // Portfolio por tipo
  const portfolioTipo = Object.entries(
    imoveis.reduce((acc, im) => { acc[im.tipo] = (acc[im.tipo] ?? 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value, color: TIPO_COLORS[name] ?? "#64748b" }));

  // Funil
  const leadsAtivosAll = leads.filter(l => l.status === "Ativo");
  const maxFunil = leadsAtivosAll.length || 1;
  const funil = ETAPAS.map(etapa => {
    const count = leadsAtivosAll.filter(l => l.etapa === etapa).length;
    return { etapa, count, pct: Math.round((count / maxFunil) * 100), cor: ETAPA_COLORS[etapa] };
  });

  // Visitas por dia da semana
  const DIAS = ["Seg","Ter","Qua","Qui","Sex","Sáb"];
  const visitasSemana = DIAS.map((dia, i) => ({
    dia,
    visitas: visitas.filter(v => new Date(v.data + "T12:00:00").getDay() === i + 1).length,
  }));

  // Imóveis por bairro
  const imoveisBairro = Object.entries(
    imoveis.reduce((acc, im) => {
      if (!im.bairro) return acc;
      acc[im.bairro] = acc[im.bairro] ?? { count: 0, vgv: 0 };
      acc[im.bairro].count++;
      acc[im.bairro].vgv += im.valor;
      return acc;
    }, {} as Record<string, { count: number; vgv: number }>)
  )
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([bairro, d], _, arr) => ({
      bairro,
      count: d.count,
      vgv: d.vgv >= 1e6 ? `R$ ${(d.vgv / 1e6).toFixed(1)}M` : `R$ ${(d.vgv / 1e3).toFixed(0)}k`,
      pct: Math.round((d.count / (arr[0]?.[1]?.count ?? 1)) * 100),
    }));

  // Destaques
  const destaques = imoveis.filter(i => i.status === "Disponível").slice(0, 4);

  const fmtVgv = (v: number) =>
    v >= 1e6 ? `R$ ${(v / 1e6).toFixed(1)}M` : v > 0 ? `R$ ${(v / 1e3).toFixed(0)}k` : "—";

  return (
    <PageContainer
      title="Painel Imobiliário"
      description="Visão 360° do portfólio, performance de corretores e funil de vendas."
    >
      <div className="space-y-6 max-w-[1700px] mx-auto pb-10">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard icon={Building2} label="Disponíveis" value={String(disponiveis)} sub="no portfólio ativo" color="bg-blue-500/10 text-blue-400" />
          <KPICard icon={TrendingUp} label="Vendidos Mês" value={String(vendidosMes)} sub="negócios fechados" color="bg-emerald-500/10 text-emerald-400" />
          <KPICard icon={DollarSign} label="VGV Mês" value={fmtVgv(vgvMes)} sub="volume geral de vendas" color="bg-violet-500/10 text-violet-400" />
          <KPICard icon={Columns3} label="Leads Ativos" value={String(leadsAtivos)} sub="no funil de vendas" color="bg-cyan-500/10 text-cyan-400" />
          <KPICard icon={Eye} label="Próximas Visitas" value={String(visitas.length)} sub="agendadas" color="bg-amber-500/10 text-amber-400" />
          <KPICard icon={Target} label="Conversão" value={`${conversao}%`} sub="leads → fechamento" color="bg-pink-500/10 text-pink-400" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* VGV por Mês */}
          <div className="lg:col-span-2 bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">VGV por Mês</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Volume geral de vendas em R$ milhões</p>
              </div>
            </div>
            {vgvMensal.every(m => m.vgv === 0) ? (
              <div className="flex items-center justify-center h-[210px] text-slate-600 text-sm">Nenhuma venda registrada</div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={vgvMensal} barSize={36} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.025)", radius: 6 }} />
                  <Bar dataKey="vgv" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Portfólio por Tipo */}
          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-0.5">Portfólio por Tipo</h3>
            <p className="text-[10px] text-slate-500 mb-2">{imoveis.length} imóveis cadastrados</p>
            {portfolioTipo.length === 0 ? (
              <div className="flex items-center justify-center h-[180px] text-slate-600 text-sm">Sem imóveis cadastrados</div>
            ) : (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={portfolioTipo}
                      cx="50%" cy="50%"
                      innerRadius={52} outerRadius={78}
                      dataKey="value" strokeWidth={0}
                      onMouseEnter={(_, idx) => setActivePie(idx)}
                      onMouseLeave={() => setActivePie(null)}
                    >
                      {portfolioTipo.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={activePie === null || activePie === i ? 1 : 0.35} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0F1929", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} itemStyle={{ fontWeight: 700, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="space-y-2">
              {portfolioTipo.map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                    <span className="text-[11px] text-slate-400">{t.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-white">{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Funil de Vendas */}
          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1">Funil de Vendas</h3>
            <p className="text-[10px] text-slate-500 mb-5">Taxa de conversão por etapa</p>
            {leadsAtivosAll.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-slate-600 text-sm">Nenhum lead ativo</div>
            ) : (
              <div className="space-y-3.5">
                {funil.map((f, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-slate-400">{f.etapa}</span>
                      <span className="text-[11px] font-black text-white">{f.count}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${f.cor} transition-all duration-700`} style={{ width: `${f.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-[10px] text-slate-500">Taxa de fechamento</p>
              <p className="text-xl font-black text-emerald-400">{conversao}%</p>
            </div>
          </div>

          {/* Ranking Corretores */}
          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1">Ranking Corretores</h3>
            <p className="text-[10px] text-slate-500 mb-5">Performance acumulada no mês</p>
            {corretores.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-slate-600 text-sm">Nenhum corretor cadastrado</div>
            ) : (
              <div className="space-y-5">
                {corretores.slice(0, 3).map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-500" : "bg-orange-800"}`}>
                        #{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-black text-white truncate">{c.nome}</span>
                          <div className="flex items-center gap-1 text-amber-400 shrink-0 ml-2">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-[11px] font-black">{Number(c.avaliacao ?? 0).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span>{c.vendas_mes ?? 0} vendas</span>
                          <span>·</span>
                          <span>VGV R$ {Number(c.vgv_mes ?? 0).toFixed(1)}M</span>
                          <span>·</span>
                          <span>Meta: {c.meta ?? 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-10">
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${i === 0 ? "bg-amber-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min(((c.vendas_mes ?? 0) / (c.meta || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-slate-600">{Math.round(((c.vendas_mes ?? 0) / (c.meta || 1)) * 100)}% da meta mensal</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Próximas Visitas */}
          <div className="space-y-4">
            <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3">Próximas Visitas</h3>
              {visitas.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-slate-600 text-sm">Nenhuma visita agendada</div>
              ) : (
                <div className="space-y-2.5">
                  {visitas.map((v, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-white truncate">{v.imovel}</p>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${v.status === "Confirmada" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                            {v.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{v.data} {v.hora} · {v.cliente}</p>
                        <p className="text-[10px] text-slate-600">{v.corretor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visitas por semana */}
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Visitas por Dia da Semana</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Distribuição das próximas visitas agendadas</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Visitas</span>
            </div>
          </div>
          {visitasSemana.every(v => v.visitas === 0) ? (
            <div className="flex items-center justify-center h-[160px] text-slate-600 text-sm">Nenhuma visita agendada</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={visitasSemana}>
                <defs>
                  <linearGradient id="visitasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="dia" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
                <Area type="monotone" dataKey="visitas" stroke="#3b82f6" strokeWidth={2.5} fill="url(#visitasGrad)" dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Imóveis em Destaque + por Bairro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Imóveis em Destaque</h3>
            {destaques.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-slate-600 text-sm">Nenhum imóvel disponível</div>
            ) : (
              <div className="space-y-3">
                {destaques.map((im, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900/40 to-violet-900/40 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{im.titulo}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{im.bairro} · {im.tipo}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-white">{fmtVgv(im.valor)}</p>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                        {im.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Imóveis por Bairro</h3>
            {imoveisBairro.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-slate-600 text-sm">Nenhum imóvel cadastrado</div>
            ) : (
              <div className="space-y-3">
                {imoveisBairro.map((b, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="text-[11px] text-slate-300 font-bold">{b.bairro}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>{b.count} imóveis</span>
                        <span className="font-black text-white">{b.vgv}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700" style={{ width: `${b.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
