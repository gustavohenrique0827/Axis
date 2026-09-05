import { Inbox, Filter, Shuffle, MessageSquare, RefreshCcw, Database, ListChecks, BellRing } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, usePrefersReducedMotion, FONT_MONO } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

const STEPS = [
  { icon: Inbox, label: "Lead recebido" },
  { icon: Filter, label: "Qualificação" },
  { icon: Shuffle, label: "Distribuição" },
  { icon: MessageSquare, label: "WhatsApp" },
  { icon: RefreshCcw, label: "Follow-up" },
  { icon: Database, label: "CRM" },
  { icon: ListChecks, label: "Tarefa" },
  { icon: BellRing, label: "Notificação" },
];

export function AutomacaoWorkflowSection() {
  const { theme } = useLpTheme();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Section id="automacao" glow>
      <div className="text-center mb-14">
        <Kicker>Automação</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">
          Você vê o processo acontecendo, não apenas o resultado.
        </SectionTitle>
        <Lede className="max-w-xl mx-auto text-base sm:text-lg">
          Cada etapa do fluxo comercial pode rodar sozinha, sem depender de alguém lembrar de fazer o
          próximo passo.
        </Lede>
      </div>

      <FadeIn>
        <div className="max-w-5xl mx-auto overflow-x-auto pb-2">
          <div className="flex items-center gap-0 min-w-[720px] sm:min-w-0 sm:flex-wrap sm:justify-center">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center">
                <div className="flex flex-col items-center gap-2 shrink-0 w-[84px]">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                    <s.icon className="w-5 h-5" style={{ color: theme.primaryDark }} />
                  </div>
                  <span className="text-[10.5px] font-semibold text-slate-600 text-center leading-tight">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="relative w-8 sm:w-6 h-px bg-slate-200 shrink-0 mb-6 overflow-visible">
                    {!reducedMotion && (
                      <span
                        className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                        style={{
                          background: theme.primary,
                          animation: `workflow-pulse 1.6s ${i * 0.2}s linear infinite`,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      <p className="text-center text-[11px] text-slate-400 mt-8 uppercase tracking-wider font-medium" style={{ fontFamily: FONT_MONO }}>
        Fluxo ilustrativo — as etapas variam conforme a configuração da sua operação
      </p>
    </Section>
  );
}
