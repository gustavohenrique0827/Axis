import { Database, Workflow, Sparkles, LayoutDashboard, Headset, BarChart3, Plug } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, FONT_DISPLAY } from "./shared";

const CATEGORIES = [
  {
    icon: Database,
    name: "CRM",
    text: "Leads, clientes, oportunidades e pipeline comercial organizados em um só lugar.",
  },
  {
    icon: Workflow,
    name: "Automação",
    text: "Processos automáticos que eliminam tarefas manuais e repetitivas da operação.",
  },
  {
    icon: Sparkles,
    name: "Inteligência Artificial",
    text: "A Aurora analisa dados, responde perguntas e ajuda a equipe a agir mais rápido.",
    featured: true,
  },
  {
    icon: LayoutDashboard,
    name: "Gestão",
    text: "Indicadores, equipes, tarefas e acompanhamento da operação comercial.",
  },
  {
    icon: Headset,
    name: "Atendimento",
    text: "Centralização e organização dos contatos e conversas com clientes.",
  },
  {
    icon: BarChart3,
    name: "Dados",
    text: "Informações organizadas e acessíveis para uma tomada de decisão melhor.",
  },
  {
    icon: Plug,
    name: "Integrações",
    text: "Conexão com as ferramentas que a sua empresa já utiliza no dia a dia.",
  },
];

export function FuncionalidadesSection() {
  return (
    <Section id="funcionalidades" className="bg-slate-50/70" glow>
      <div className="text-center mb-14">
        <Kicker>O que o Axis reúne</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">
          Tudo o que a sua operação comercial precisa, conectado.
        </SectionTitle>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((c, i) => (
          <FadeIn key={c.name} delay={i * 0.05} className={i === CATEGORIES.length - 1 ? "sm:col-span-2 lg:col-span-1 lg:col-start-2" : ""}>
            <div
              className={`h-full p-6 rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                c.featured
                  ? "border-blue-300 bg-gradient-to-br from-blue-50 to-violet-50/60 hover:shadow-blue-500/10"
                  : "border-slate-200 bg-white hover:border-blue-200"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 shadow-sm ${
                  c.featured ? "bg-gradient-to-br from-blue-500 to-violet-600 shadow-blue-500/20" : "bg-blue-50 border border-blue-200"
                }`}
              >
                <c.icon className={`w-5 h-5 ${c.featured ? "text-white" : "text-blue-600"}`} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2" style={{ fontFamily: FONT_DISPLAY }}>{c.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{c.text}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
