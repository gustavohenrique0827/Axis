import { CheckCircle2 } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, BrandLine } from "./shared";

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
  return (
    <Section id="autonomia">
      <div className="text-center mb-12">
        <Kicker>Regras, não adivinhação</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-5">
          Você define as regras.<br />A inteligência executa dentro delas.
        </SectionTitle>
      </div>

      <FadeIn>
        <div className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto mb-12">
          {RULES.map((r) => (
            <div key={r} className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-sm font-medium text-slate-700">{r}</span>
            </div>
          ))}
        </div>
      </FadeIn>

      <div className="text-center max-w-xl mx-auto">
        <BrandLine>"Autonomia não significa perder controle. Significa ganhar capacidade de execução."</BrandLine>
      </div>
    </Section>
  );
}
