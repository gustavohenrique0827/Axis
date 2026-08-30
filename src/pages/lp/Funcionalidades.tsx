import { useState } from "react";
import {
  Database, Headset, LayoutDashboard, Sparkles, Workflow, BarChart3, FolderKanban, Plug,
} from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, FONT_DISPLAY } from "./shared";

const MODULES = [
  {
    icon: Database,
    name: "Comercial",
    tagline: "CRM, leads, oportunidades e pipeline.",
    highlights: ["Pipeline visual por etapa", "Histórico completo de cada lead", "Gestão de clientes e propostas"],
  },
  {
    icon: Headset,
    name: "Atendimento",
    tagline: "Conversas, contatos e acompanhamento.",
    highlights: ["Contatos centralizados", "Histórico de conversas por cliente", "Acompanhamento sem perder contexto"],
  },
  {
    icon: LayoutDashboard,
    name: "Gestão",
    tagline: "Equipe, tarefas, metas e indicadores.",
    highlights: ["Indicadores da operação", "Metas por vendedor e squad", "Tarefas e acompanhamento de equipe"],
  },
  {
    icon: Sparkles,
    name: "Inteligência",
    tagline: "Aurora, análises e insights.",
    highlights: ["Análise de conversas e contexto", "Insights proativos sobre a operação", "Respostas em linguagem natural"],
    featured: true,
  },
  {
    icon: Workflow,
    name: "Automação",
    tagline: "Workflows e processos automáticos.",
    highlights: ["Distribuição automática de leads", "Follow-up sem depender de lembrete", "Notificações no momento certo"],
  },
  {
    icon: BarChart3,
    name: "Dados",
    tagline: "Indicadores e informações estratégicas.",
    highlights: ["Informação organizada e acessível", "Base para decisões com contexto", "Menos planilha, mais visão real"],
  },
  {
    icon: FolderKanban,
    name: "Projetos",
    tagline: "Projetos, tarefas e execução.",
    highlights: ["Acompanhamento de entregas", "Tarefas ligadas à operação comercial", "Visão de execução por time"],
  },
  {
    icon: Plug,
    name: "Integrações",
    tagline: "Conexão com sistemas externos.",
    highlights: ["WhatsApp e canais de atendimento", "Ferramentas que sua empresa já usa", "Dados entrando sem retrabalho"],
  },
];

export function FuncionalidadesSection() {
  const [active, setActive] = useState(3);
  const mod = MODULES[active];

  return (
    <Section id="funcionalidades" className="bg-slate-50/70" glow>
      <div className="text-center mb-12">
        <Kicker>Módulos do Axis</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">
          Tudo o que a sua operação comercial precisa, conectado.
        </SectionTitle>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,280px)_1fr] gap-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2">
          {MODULES.map((m, i) => (
            <button
              key={m.name}
              onClick={() => setActive(i)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                active === i
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-slate-900"
              }`}
            >
              <m.icon className={`w-4 h-4 shrink-0 ${active === i ? "text-blue-300" : "text-blue-600"}`} />
              <span className="text-[13px] font-bold" style={{ fontFamily: FONT_DISPLAY }}>{m.name}</span>
            </button>
          ))}
        </div>

        <FadeIn key={active}>
          <div
            className={`h-full p-7 sm:p-8 rounded-2xl border shadow-sm ${
              mod.featured ? "border-blue-300 bg-gradient-to-br from-blue-50 to-violet-50/60" : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm ${
                mod.featured ? "bg-gradient-to-br from-teal-400 via-blue-500 to-violet-600 shadow-blue-500/20" : "bg-blue-50 border border-blue-200"
              }`}
            >
              <mod.icon className={`w-5.5 h-5.5 ${mod.featured ? "text-white" : "text-blue-600"}`} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1.5" style={{ fontFamily: FONT_DISPLAY }}>{mod.name}</h3>
            <p className="text-sm text-slate-500 mb-6">{mod.tagline}</p>
            <div className="space-y-2.5">
              {mod.highlights.map((h) => (
                <div key={h} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span className="text-sm text-slate-600">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
