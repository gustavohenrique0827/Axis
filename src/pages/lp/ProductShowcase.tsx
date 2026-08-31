import { useState } from "react";
import {
  Kanban, Users, Sparkles, LayoutDashboard,
  Target, CalendarCheck, RefreshCcw, TrendingUp, Percent, Bot,
  Phone, Mail, MoreHorizontal, ArrowRight,
} from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, AnimatedCounter, FONT_MONO } from "./shared";

type TabId = "pipeline" | "leads" | "aurora" | "indicadores";

const TABS: { id: TabId; label: string; icon: typeof Kanban }[] = [
  { id: "pipeline", label: "Pipeline", icon: Kanban },
  { id: "leads", label: "Leads & Clientes", icon: Users },
  { id: "aurora", label: "Aurora", icon: Sparkles },
  { id: "indicadores", label: "Indicadores", icon: LayoutDashboard },
];

const PIPELINE_COLUMNS = [
  { name: "Novo lead", dot: "bg-slate-400", cards: [{ name: "Rafael Souza", value: "R$ 4.200" }, { name: "Bianca Alves", value: "R$ 1.900" }] },
  { name: "Qualificando", dot: "bg-info", cards: [{ name: "Marcos Lima", value: "R$ 8.700" }, { name: "Studio Nova", value: "R$ 3.100" }] },
  { name: "Proposta", dot: "bg-violet-500", cards: [{ name: "Grupo Hexa", value: "R$ 15.400" }] },
  { name: "Fechado", dot: "bg-success", cards: [{ name: "Clínica Vitta", value: "R$ 6.800" }] },
];

const LEADS_ROWS = [
  { name: "Rafael Souza", origem: "WhatsApp", status: "Quente", tone: "bg-success/10 text-success border-success/25", valor: "R$ 4.200" },
  { name: "Marcos Lima", origem: "Indicação", status: "Em negociação", tone: "bg-warning/10 text-warning border-warning/25", valor: "R$ 8.700" },
  { name: "Studio Nova", origem: "Formulário", status: "Follow-up", tone: "bg-info/10 text-info border-info/25", valor: "R$ 3.100" },
  { name: "Grupo Hexa", origem: "Anúncio", status: "Proposta enviada", tone: "bg-violet-500/10 text-violet-600 border-violet-500/25", valor: "R$ 15.400" },
];

const AURORA_EXCHANGES = [
  { q: "Quais leads estão parados há mais de 3 dias?", a: "7 leads sem resposta. 3 têm intenção de compra alta — priorizei no topo do seu pipeline." },
  { q: "Quanto vendemos este mês?", a: "R$ 84.300 fechados. Faltam R$ 15.700 para bater a meta, com 6 propostas em aberto." },
  { q: "Crie uma tarefa para o vendedor entrar em contato com a Studio Nova.", a: "Tarefa criada para Marcos, com prioridade alta e prazo para hoje às 17h." },
];

interface Metric {
  icon: typeof Target;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const METRICS: Metric[] = [
  { icon: Target, label: "Oportunidades identificadas", value: 247 },
  { icon: CalendarCheck, label: "Reuniões agendadas", value: 38 },
  { icon: RefreshCcw, label: "Follow-ups ativos", value: 62 },
  { icon: TrendingUp, label: "Pipeline", value: 284500, prefix: "R$ " },
  { icon: Percent, label: "Conversões", value: 18.4, suffix: "%", decimals: 1 },
  { icon: Bot, label: "Atividades dos agentes", value: 1204 },
];

/** Moldura de janela ao redor do conteúdo — o conteúdo em si usa as mesmas variáveis de tema
 * (--color-surface-elevated, --color-border-default etc.) e a font-sans real do produto (Arial),
 * já que isso precisa ser a interface real do Axis, não uma reinvenção estilizada em tema escuro. */
function ChromeWindow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-transparent blur-3xl" />
      <div className="relative rounded-2xl border border-white/[0.1] bg-[#07080c] overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
          </div>
          <span className="ml-3 text-[11px] font-medium text-slate-500 tracking-tight" style={{ fontFamily: FONT_MONO }}>
            {title}
          </span>
        </div>
        <div className="font-sans p-5 sm:p-7 min-h-[340px] sm:min-h-[380px] bg-[var(--color-surface)]">{children}</div>
      </div>
    </div>
  );
}

export function ProductShowcaseSection({ onCta }: { onCta: () => void }) {
  const [tab, setTab] = useState<TabId>("pipeline");

  return (
    <Section id="produto" glow>
      <div className="text-center mb-10">
        <Kicker>O Axis na prática</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">Veja o Axis funcionando.</SectionTitle>
        <Lede className="max-w-2xl mx-auto text-base sm:text-lg">
          Pipeline, leads, clientes, inteligência e indicadores — tudo dentro do mesmo produto, sem
          precisar alternar entre planilhas, WhatsApp e ferramentas soltas.
        </Lede>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 ${
              tab === t.id
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <FadeIn key={tab} className="max-w-4xl mx-auto">
        {tab === "pipeline" && (
          <ChromeWindow title="Axis · Pipeline Comercial">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {PIPELINE_COLUMNS.map((col) => (
                <div key={col.name} className="rounded-[var(--radius-panel)] border border-[var(--color-border-default)] bg-[var(--color-surface-sunken)] p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3 px-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                    {col.name}
                  </p>
                  <div className="space-y-2">
                    {col.cards.map((c) => (
                      <div key={c.name} className="rounded-[var(--radius-control)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] p-3 shadow-[var(--shadow-panel)]">
                        <p className="text-[12px] font-semibold text-[var(--color-text-primary)] mb-1 truncate">{c.name}</p>
                        <p className="text-[11px] font-mono font-bold text-success">{c.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ChromeWindow>
        )}

        {tab === "leads" && (
          <ChromeWindow title="Axis · Leads & Clientes">
            <div className="space-y-2">
              {LEADS_ROWS.map((r) => (
                <div key={r.name} className="flex items-center gap-3 sm:gap-4 rounded-[var(--radius-panel)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] px-4 py-3 shadow-[var(--shadow-panel)]">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary-blue)]/10 border border-[var(--color-primary-blue)]/20 flex items-center justify-center text-[10px] font-black text-[var(--color-primary-blue)] shrink-0">
                    {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{r.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{r.origem}</p>
                  </div>
                  <span className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${r.tone}`}>{r.status}</span>
                  <span className="text-[12px] font-mono font-bold text-success shrink-0">{r.valor}</span>
                  <div className="hidden sm:flex items-center gap-1.5 text-[var(--color-text-faint)] shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                    <Mail className="w-3.5 h-3.5" />
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </ChromeWindow>
        )}

        {tab === "aurora" && (
          <ChromeWindow title="Axis · Aurora">
            <div className="space-y-4">
              {AURORA_EXCHANGES.map((ex) => (
                <div key={ex.q}>
                  <div className="flex justify-end mb-2">
                    <div className="max-w-[80%] bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13px] text-[var(--color-text-primary)]">
                      {ex.q}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 via-blue-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <div className="max-w-[80%] bg-[var(--color-primary-blue)]/5 border border-[var(--color-primary-blue)]/15 rounded-2xl rounded-tl-sm px-4 py-2.5 text-[13px] text-[var(--color-text-primary)] leading-relaxed">
                      {ex.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChromeWindow>
        )}

        {tab === "indicadores" && (
          <ChromeWindow title="Axis · Painel Comercial">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {METRICS.map((m) => (
                <div key={m.label} className="p-4 sm:p-5 rounded-[var(--radius-panel)] bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-[var(--shadow-panel)]">
                  <m.icon className="w-4 h-4 text-[var(--color-primary-blue)] mb-4" />
                  <div className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-1">
                    <AnimatedCounter value={m.value} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals} />
                  </div>
                  <div className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide leading-snug">{m.label}</div>
                </div>
              ))}
            </div>
          </ChromeWindow>
        )}
      </FadeIn>

      <p className="text-center text-[11px] text-slate-400 mt-5 uppercase tracking-wider font-medium" style={{ fontFamily: FONT_MONO }}>Representação ilustrativa da interface</p>

      <div className="text-center mt-10">
        <button
          onClick={onCta}
          className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20"
        >
          Solicitar demonstração
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </Section>
  );
}
