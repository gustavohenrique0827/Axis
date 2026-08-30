import { Building2, Sun, Stethoscope, Briefcase, GraduationCap, Wrench } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn } from "./shared";

const SEGMENTS = [
  { icon: Building2, label: "Imobiliárias" },
  { icon: Sun, label: "Energia solar" },
  { icon: Stethoscope, label: "Clínicas" },
  { icon: Briefcase, label: "Empresas B2B" },
  { icon: GraduationCap, label: "Educação" },
  { icon: Wrench, label: "Empresas de serviços" },
];

export function SegmentacaoSection() {
  return (
    <Section id="segmentos">
      <div className="text-center mb-10">
        <Kicker>Para diferentes operações</Kicker>
        <SectionTitle className="text-2xl sm:text-3xl lg:text-4xl mb-5">O Axis se adapta à operação da sua empresa.</SectionTitle>
        <Lede className="max-w-xl mx-auto text-sm sm:text-base">
          A estrutura é a mesma — CRM, inteligência e automação — mas os campos, funis e regras se
          ajustam ao seu tipo de negócio.
        </Lede>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
        {SEGMENTS.map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.05}>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-blue-200 transition-all duration-300">
              <s.icon className="w-5 h-5 text-blue-600" />
              <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight">{s.label}</span>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
