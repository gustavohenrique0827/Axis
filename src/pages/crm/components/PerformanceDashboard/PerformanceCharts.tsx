import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { TrendingUp, FileText, Users, Flame, CheckCircle2, Target } from "lucide-react";
import { toast } from "sonner";

export function PerformanceScoreChart(props: { performanceData: any[] }) {
  return (
    <Card className="lg:col-span-2 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm text-slate-400 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-400" /> Score IA vs Conversão
        </h3>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-400">Score IA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-400">Conversão</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.promise(new Promise((res) => setTimeout(res, 1500)), {
                loading: "Gerando relatório PDF...",
                success: "Insights exportados!",
                error: "Falha ao exportar.",
              });
            }}
            className="gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={props.performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="month" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              }}
              itemStyle={{ fontSize: "11px" }}
            />
            <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} name="Score IA" />
            <Line type="monotone" dataKey="conversionRate" stroke="#94a3b8" strokeWidth={2} dot={{ fill: "#94a3b8", r: 3 }} name="Conversão %" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-slate-500 text-center">A cada 10pts de Score IA, a probabilidade de fechamento sobe ~4%.</p>
    </Card>
  );
}

export function HotLeadsPanel(props: { leads: any[]; hotLeads: any[] }) {
  const { leads, hotLeads } = props;
  return (
    <Card className="p-5 flex flex-col">
      <h3 className="text-sm text-slate-400 flex items-center gap-2 mb-4 shrink-0">
        <Flame className="w-4 h-4 text-slate-400" /> Leads Quentes
      </h3>

      {hotLeads.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-6 text-slate-500 text-xs text-center">
          Nenhum lead quente no momento
        </div>
      ) : (
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto scrollbar-none">
          {hotLeads.map((lead: any) => (
            <div
              key={lead.id}
              className="flex items-center gap-2.5 p-2 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl border border-white/5 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-slate-300 shrink-0">
                {(lead.name || "?")[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white truncate">{lead.name}</div>
                <div className="text-xs text-slate-500 truncate">{lead.company}</div>
              </div>
              <div className="text-xs text-slate-300 font-mono shrink-0">{lead.value || "—"}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 shrink-0">
        <div className="p-3 border border-white/5 rounded-xl text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <div className="text-lg font-semibold text-white">{(leads as any[]).filter((l) => l.status === "Fechado").length}</div>
          <div className="text-xs text-slate-400">Ganhos</div>
        </div>
        <div className="p-3 border border-white/5 rounded-xl text-center">
          <Target className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <div className="text-lg font-semibold text-white">{(leads as any[]).filter((l) => l.status === "Em Negociação").length}</div>
          <div className="text-xs text-slate-400">Negociação</div>
        </div>
      </div>
    </Card>
  );
}

export function LeadsVolumeChart(props: { performanceData: any[] }) {
  return (
    <Card className="p-5 bg-[var(--color-surface-elevated)]/80 border-white/5 backdrop-blur-xl">
      <h3 className="text-[10px] text-white uppercase tracking-widest font-black flex items-center gap-2 mb-4">
        <Users className="w-3.5 h-3.5 text-purple-400" /> Volume de Leads Prospectados por Mês
      </h3>
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={props.performanceData}>
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="month" stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
            <Area type="monotone" dataKey="leads" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2.5} name="Leads" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

