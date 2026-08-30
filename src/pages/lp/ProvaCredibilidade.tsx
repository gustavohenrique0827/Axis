import { Building2, Quote } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn } from "./shared";

export function ProvaCredibilidadeSection() {
  return (
    <Section id="prova" className="bg-slate-50/70">
      <div className="text-center mb-12">
        <Kicker>Confiança</Kicker>
        <SectionTitle className="text-2xl sm:text-3xl lg:text-4xl mb-5">
          Estamos construindo essa página junto com os primeiros clientes Axis.
        </SectionTitle>
        <Lede className="max-w-xl mx-auto text-sm sm:text-base">
          Preferimos deixar este espaço reservado a preenchê-lo com números ou depoimentos fictícios.
          Aqui entrarão empresas reais, resultados reais e casos reais assim que estiverem prontos.
        </Lede>
      </div>

      <FadeIn>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 max-w-3xl mx-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-28 h-14 rounded-lg border border-dashed border-slate-300 bg-white/60 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-slate-300" />
            </div>
          ))}
        </div>
      </FadeIn>

      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <FadeIn key={i} delay={i * 0.06}>
            <div className="h-full p-5 rounded-xl border border-dashed border-slate-300 bg-white/60 flex flex-col items-center text-center gap-2">
              <Quote className="w-4 h-4 text-slate-300" />
              <p className="text-[12px] text-slate-400 leading-relaxed">Depoimento em breve</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
