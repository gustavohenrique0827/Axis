import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";
import {
  Building2, Eye, DollarSign, TrendingUp, MapPin, Star,
  Calendar, ArrowUpRight, ArrowDownRight, Target, Columns3,
} from "lucide-react";

const VGV_MENSAL = [
  { mes: "Jan", vgv: 2.1, vendas: 2 },
  { mes: "Fev", vgv: 1.8, vendas: 1 },
  { mes: "Mar", vgv: 3.2, vendas: 3 },
  { mes: "Abr", vgv: 2.7, vendas: 2 },
  { mes: "Mai", vgv: 4.1, vendas: 4 },
  { mes: "Jun", vgv: 4.5, vendas: 3 },
];

const PORTFOLIO_TIPO = [
  { name: "Apartamento", value: 12, color: "#3b82f6" },
  { name: "Casa", value: 5, color: "#8b5cf6" },
  { name: "Cobertura", value: 3, color: "#06b6d4" },
  { name: "Comercial", value: 4, color: "#f59e0b" },
  { name: "Kitnet", value: 2, color: "#10b981" },
  { name: "Terreno", value: 2, color: "#f97316" },
];

const VISITAS_SEMANA = [
  { dia: "Seg", visitas: 3 },
  { dia: "Ter", visitas: 5 },
  { dia: "Qua", visitas: 2 },
  { dia: "Qui", visitas: 7 },
  { dia: "Sex", visitas: 4 },
  { dia: "Sáb", visitas: 8 },
  { dia: "Dom", visitas: 1 },
];

const FUNIL = [
  { etapa: "Novos Leads", count: 24, pct: 100, cor: "bg-slate-400" },
  { etapa: "Em Contato", count: 18, pct: 75, cor: "bg-blue-400" },
  { etapa: "Visita Agendada", count: 12, pct: 50, cor: "bg-amber-400" },
  { etapa: "Proposta Enviada", count: 7, pct: 29, cor: "bg-violet-400" },
  { etapa: "Negociação", count: 4, pct: 17, cor: "bg-cyan-400" },
  { etapa: "Fechado", count: 3, pct: 12.5, cor: "bg-emerald-400" },
];

const CORRETORES = [
  { nome: "Ana Lima", vendas: 8, vgv: 6.8, meta: 10, avaliacao: 4.9 },
  { nome: "Carlos Matos", vendas: 5, vgv: 4.2, meta: 7, avaliacao: 4.7 },
  { nome: "Fernanda Rocha", vendas: 3, vgv: 7.0, meta: 5, avaliacao: 4.8 },
];

const PROXIMAS_VISITAS = [
  { data: "Hoje, 14:00", imovel: "Apto 3q - Moema", cliente: "Roberto Silva", corretor: "Ana Lima", status: "Confirmada" },
  { data: "Amanhã, 10:00", imovel: "Casa - Alphaville", cliente: "Patrícia Costa", corretor: "Carlos Matos", status: "Agendada" },
  { data: "19/06, 11:00", imovel: "Cobertura - Vila Olímpia", cliente: "Marcos Alves", corretor: "Fernanda Rocha", status: "Confirmada" },
];

const ATIVIDADES = [
  { cor: "emerald", msg: "Eduardo Pinto fechou compra do Apto Brooklin", tempo: "2h atrás" },
  { cor: "blue", msg: "Novo lead: Juliana Mendes via Instagram", tempo: "4h atrás" },
  { cor: "amber", msg: "Visita realizada: Casa Alphaville com Patrícia", tempo: "6h atrás" },
  { cor: "violet", msg: "Proposta enviada: Sala Comercial Faria Lima", tempo: "1d atrás" },
  { cor: "cyan", msg: "Ricardo Nunes avançou para Negociação", tempo: "2d atrás" },
];

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
            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
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
  const [activePie, setActivePie] = useState<number | null>(null);

  return (
    <PageContainer
      title="Painel Imobiliário"
      description="Visão 360° do portfólio, performance de corretores e funil de vendas."
    >
      <div className="space-y-6 max-w-[1700px] mx-auto pb-10">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard icon={Building2} label="Disponíveis" value="28" sub="no portfólio ativo" color="bg-blue-500/10 text-blue-400" trend="up" trendVal="+2" />
          <KPICard icon={TrendingUp} label="Vendidos Mês" value="3" sub="negócios fechados" color="bg-emerald-500/10 text-emerald-400" trend="up" trendVal="+1" />
          <KPICard icon={DollarSign} label="VGV Mês" value="R$ 4.5M" sub="volume geral de vendas" color="bg-violet-500/10 text-violet-400" trend="up" trendVal="+18%" />
          <KPICard icon={Columns3} label="Leads Ativos" value="24" sub="no funil de vendas" color="bg-cyan-500/10 text-cyan-400" trend="up" trendVal="+5" />
          <KPICard icon={Eye} label="Visitas Semana" value="30" sub="agendadas + realizadas" color="bg-amber-500/10 text-amber-400" trend="down" trendVal="-2" />
          <KPICard icon={Target} label="Conversão" value="18.5%" sub="leads → fechamento" color="bg-pink-500/10 text-pink-400" trend="up" trendVal="+2.3pp" />
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
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                +18% vs maio
              </span>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={VGV_MENSAL} barSize={36} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}M`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.025)", radius: 6 }} />
                <Bar dataKey="vgv" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Portfólio por Tipo */}
          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-0.5">Portfólio por Tipo</h3>
            <p className="text-[10px] text-slate-500 mb-2">28 imóveis cadastrados</p>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={PORTFOLIO_TIPO}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    dataKey="value"
                    strokeWidth={0}
                    onMouseEnter={(_, idx) => setActivePie(idx)}
                    onMouseLeave={() => setActivePie(null)}
                  >
                    {PORTFOLIO_TIPO.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                        opacity={activePie === null || activePie === i ? 1 : 0.35}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0F1929",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      color: "#fff",
                    }}
                    itemStyle={{ fontWeight: 700, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {PORTFOLIO_TIPO.map((t, i) => (
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
            <div className="space-y-3.5">
              {FUNIL.map((f, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-slate-400">{f.etapa}</span>
                    <span className="text-[11px] font-black text-white">{f.count}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${f.cor} transition-all duration-700`}
                      style={{ width: `${f.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-[10px] text-slate-500">Taxa de fechamento</p>
              <p className="text-xl font-black text-emerald-400">12.5%</p>
            </div>
          </div>

          {/* Ranking Corretores */}
          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1">Ranking Corretores</h3>
            <p className="text-[10px] text-slate-500 mb-5">Performance acumulada no mês</p>
            <div className="space-y-5">
              {CORRETORES.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 ${
                        i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-500" : "bg-orange-800"
                      }`}
                    >
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-black text-white truncate">{c.nome}</span>
                        <div className="flex items-center gap-1 text-amber-400 shrink-0 ml-2">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-[11px] font-black">{c.avaliacao}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>{c.vendas} vendas</span>
                        <span>·</span>
                        <span>VGV R$ {c.vgv}M</span>
                        <span>·</span>
                        <span>Meta: {c.meta}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-10">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${i === 0 ? "bg-amber-500" : "bg-blue-500"}`}
                        style={{ width: `${Math.min((c.vendas / c.meta) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-600">{Math.round((c.vendas / c.meta) * 100)}% da meta mensal</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próximas Visitas + Atividade */}
          <div className="space-y-4">
            <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3">Próximas Visitas</h3>
              <div className="space-y-2.5">
                {PROXIMAS_VISITAS.map((v, i) => (
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
                      <p className="text-[10px] text-slate-500 mt-0.5">{v.data} · {v.cliente}</p>
                      <p className="text-[10px] text-slate-600">{v.corretor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3">Atividade Recente</h3>
              <div className="space-y-3">
                {ATIVIDADES.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      a.cor === "emerald" ? "bg-emerald-400" :
                      a.cor === "blue" ? "bg-blue-400" :
                      a.cor === "amber" ? "bg-amber-400" :
                      a.cor === "violet" ? "bg-violet-400" : "bg-cyan-400"
                    }`} />
                    <div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{a.msg}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{a.tempo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visitas por semana */}
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Visitas por Dia da Semana</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Total de visitas realizadas e agendadas nos últimos 7 dias</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Visitas</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={VISITAS_SEMANA}>
              <defs>
                <linearGradient id="visitasGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="dia"
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
              <Area
                type="monotone"
                dataKey="visitas"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#visitasGrad)"
                dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Portfólio recente + mini mapa por bairro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Imóveis em Destaque</h3>
            <div className="space-y-3">
              {[
                { titulo: "Cobertura Duplex - Vila Olímpia", bairro: "Vila Olímpia", valor: "R$ 2.2M", tipo: "Cobertura", status: "Disponível", visitas: 5 },
                { titulo: "Apto 3 quartos - Moema", bairro: "Moema", valor: "R$ 850k", tipo: "Apartamento", status: "Disponível", visitas: 12 },
                { titulo: "Casa 4q - Alphaville", bairro: "Alphaville", valor: "R$ 1.5M", tipo: "Casa", status: "Vendido", visitas: 8 },
                { titulo: "Sala Comercial - Faria Lima", bairro: "Itaim Bibi", valor: "R$ 950k", tipo: "Comercial", status: "Disponível", visitas: 3 },
              ].map((im, i) => (
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
                    <p className="text-sm font-black text-white">{im.valor}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${im.status === "Disponível" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>
                      {im.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Imóveis por Bairro</h3>
            <div className="space-y-3">
              {[
                { bairro: "Moema", count: 6, vgv: "R$ 4.8M", pct: 100 },
                { bairro: "Vila Olímpia", count: 4, vgv: "R$ 6.2M", pct: 80 },
                { bairro: "Alphaville", count: 4, vgv: "R$ 5.4M", pct: 75 },
                { bairro: "Itaim Bibi", count: 5, vgv: "R$ 3.9M", pct: 65 },
                { bairro: "Centro", count: 3, vgv: "R$ 1.2M", pct: 40 },
                { bairro: "Brooklin", count: 2, vgv: "R$ 2.1M", pct: 30 },
              ].map((b, i) => (
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
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
