import { useState } from "react";
import { Building2, Sun, Stethoscope, Briefcase, GraduationCap, Wrench } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, FONT_DISPLAY } from "./shared";

const SEGMENTS = [
  { icon: Building2, label: "Imobiliárias", example: "Imóveis, visitas e corretores organizados em um só funil." },
  { icon: Sun, label: "Energia solar", example: "Do lead ao projeto instalado, sem perder etapa no caminho." },
  { icon: Stethoscope, label: "Clínicas", example: "Agenda, pacientes e acompanhamento centralizados." },
  { icon: Briefcase, label: "Empresas B2B", example: "Ciclos de venda longos com contexto que não se perde." },
  { icon: GraduationCap, label: "Educação", example: "Matrículas, turmas e alunos em um fluxo só." },
  { icon: Wrench, label: "Empresas de serviços", example: "Do orçamento ao serviço entregue, tudo rastreável." },
];

export function SegmentacaoSection() {
  const [open, setOpen] = useState<number | null>(null);

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
        {SEGMENTS.map((s, i) => {
          const isOpen = open === i;
          return (
            <FadeIn key={s.label} delay={i * 0.05}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                onMouseEnter={() => setOpen(i)}
                onMouseLeave={() => setOpen((v) => (v === i ? null : v))}
                className={`w-full h-[104px] flex flex-col items-center justify-center gap-2 p-3 rounded-xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md text-center ${
                  isOpen ? "border-blue-300 bg-blue-50" : "bg-white border-slate-200 hover:border-blue-200"
                }`}
              >
                {isOpen ? (
                  <span className="text-[11px] text-blue-700 leading-snug font-medium" style={{ fontFamily: FONT_DISPLAY }}>{s.example}</span>
                ) : (
                  <>
                    <s.icon className="w-5 h-5 text-blue-600" />
                    <span className="text-[11px] font-semibold text-slate-600 leading-tight">{s.label}</span>
                  </>
                )}
              </button>
            </FadeIn>
          );
        })}
      </div>
    </Section>
  );
}
