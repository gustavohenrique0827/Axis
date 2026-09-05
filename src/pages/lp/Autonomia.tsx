import { CheckCircle2, Settings2 } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, BrandLine, GlassCard, FONT_MONO } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

const RULES = [
  "O que pode oferecer",
  "O que não pode oferecer",
  "Quando chamar um vendedor",
  "Quando fazer follow-up",
  "Limites de desconto",
  "Quais perguntas fazer",
  "Quais oportunidades priorizar",
  "Quando encaminhar para humano",
];

export function AutonomiaSection() {
  const { theme } = useLpTheme();

  return (
    <Section id="autonomia">
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-14 items-center">
        <div>
          <Kicker>Regras, não adivinhação</Kicker>
          <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-6">
            Você define as regras.<br />A inteligência executa dentro delas.
          </SectionTitle>
          <Lede className="text-base sm:text-lg max-w-md mb-8">
            Nada é decidido no escuro. Cada ação da inteligência acontece dentro de limites configurados
            pela própria empresa.
          </Lede>
          <div className="hidden lg:block">
            <BrandLine>"Autonomia não significa perder controle.<br />Significa ganhar capacidade de execução."</BrandLine>
          </div>
        </div>

        <FadeIn delay={0.1}>
          <GlassCard className="p-6 sm:p-7">
            <div className="flex items-center gap-2.5 mb-5 pb-5 border-b border-slate-100">
              <div
                className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
                style={{ background: `${theme.primary}18`, borderColor: `${theme.primary}40`, color: theme.primaryDark }}
              >
                <Settings2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400" style={{ fontFamily: FONT_MONO }}>
                Configuração de regras
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {RULES.map((r) => (
                <div
                  key={r}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm transition-all duration-300"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: theme.primaryDark }} />
                  <span className="text-sm font-medium text-slate-700">{r}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </FadeIn>

        <div className="lg:hidden text-center max-w-xl mx-auto">
          <BrandLine>"Autonomia não significa perder controle. Significa ganhar capacidade de execução."</BrandLine>
        </div>
      </div>
    </Section>
  );
}
