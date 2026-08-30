import { AuroraCore } from "../../components/ui/auroraCore/AuroraCore";
import { Section, Kicker, SectionTitle, Lede, FadeIn, AuroraStage } from "./shared";

export function InteligenciaSection() {
  return (
    <Section id="inteligencia" glow>
      <div className="grid lg:grid-cols-[1fr_auto] gap-14 items-center">
        <div>
          <Kicker>Inteligência comercial</Kicker>
          <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-6">
            Uma inteligência comercial<br />trabalhando 24 horas.
          </SectionTitle>
          <div className="space-y-2 mb-7 text-slate-700 text-base sm:text-lg font-medium leading-relaxed">
            <p>Enquanto sua equipe vende, o Axis observa.</p>
            <p>Enquanto sua equipe atende, o Axis analisa.</p>
            <p>Enquanto sua equipe descansa, ele continua trabalhando.</p>
          </div>
          <Lede className="text-sm sm:text-base max-w-xl">
            A inteligência identifica sinais, relaciona informações, encontra oportunidades e pode executar
            ações de acordo com as regras definidas pela empresa.
          </Lede>
        </div>

        <FadeIn delay={0.15} className="justify-self-center flex flex-col items-center gap-5">
          <AuroraStage size={240}>
            <AuroraCore mode="thinking" size={140} />
          </AuroraStage>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ativo agora
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
