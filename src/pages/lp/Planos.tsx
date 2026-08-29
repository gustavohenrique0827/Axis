import { Check, Star } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, FONT_DISPLAY } from "./shared";

interface Plan {
  name: string;
  price: string;
  setup: string;
  description: string;
  features: string[];
  cta: string;
  badge?: string;
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Start",
    price: "R$ 997/mês",
    setup: "Implantação: R$ 2.997",
    description: "Para empresas que querem organizar e enxergar melhor sua operação comercial.",
    features: [
      "CRM",
      "Gestão de leads",
      "Pipeline comercial",
      "Gestão de clientes",
      "Histórico de interações",
      "Integração WhatsApp",
      "Inteligência sobre leads",
      "Identificação de oportunidades",
      "Análise de conversas",
      "Score de oportunidade",
      "Próxima melhor ação",
    ],
    cta: "Começar agora",
  },
  {
    name: "Autopilot",
    price: "R$ 1.997/mês",
    setup: "Implantação: R$ 4.997",
    description: "Para empresas que querem que a inteligência comece a trabalhar as oportunidades.",
    features: [
      "Tudo do Start, mais:",
      "Agentes de IA",
      "Qualificação automática",
      "Follow-up automático",
      "Recuperação de oportunidades",
      "Agendamento automático",
      "Distribuição de leads",
      "Ações comerciais automatizadas",
    ],
    cta: "Quero o Autopilot",
    badge: "Mais escolhido",
    highlight: true,
  },
  {
    name: "Autonomous",
    price: "R$ 3.997/mês",
    setup: "Implantação: R$ 9.997",
    description: "Para empresas que querem transformar o Axis em parte ativa da sua operação comercial.",
    features: [
      "Tudo do Autopilot, mais:",
      "Múltiplos agentes especializados",
      "Propostas comerciais",
      "Negociação com regras",
      "Reativação de clientes",
      "Expansão de carteira",
      "Operação comercial autônoma",
      "Maior capacidade de processamento",
      "Configurações avançadas",
    ],
    cta: "Quero conhecer",
  },
];

const CREDIT_TIERS = [
  { credits: "10.000 créditos", price: "R$ 199" },
  { credits: "30.000 créditos", price: "R$ 497" },
  { credits: "75.000 créditos", price: "R$ 997" },
  { credits: "150.000 créditos", price: "R$ 1.797" },
  { credits: "300.000 créditos", price: "R$ 2.997" },
];

export function PlanosSection({ onCta }: { onCta: () => void }) {
  return (
    <Section id="planos" className="bg-white/[0.015]">
      <div className="text-center mb-14">
        <Kicker>Planos</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl">Escolha o nível de autonomia da sua operação.</SectionTitle>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-16 items-stretch">
        {PLANS.map((plan, i) => (
          <FadeIn key={plan.name} delay={i * 0.08} className="h-full">
            <div
              className={`relative h-full flex flex-col rounded-2xl p-6 sm:p-7 border ${
                plan.highlight
                  ? "border-blue-400/40 bg-gradient-to-b from-blue-500/[0.08] to-violet-500/[0.03] shadow-[0_0_70px_-20px_rgba(59,130,246,0.4)]"
                  : "border-white/[0.09] bg-white/[0.025]"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider">
                  <Star className="w-3 h-3 fill-white" /> {plan.badge}
                </span>
              )}
              <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: FONT_DISPLAY }}>{plan.name}</h3>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1" style={{ fontFamily: FONT_DISPLAY }}>{plan.price}</div>
              <p className="text-[11px] text-slate-500 mb-4">{plan.setup}</p>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{plan.description}</p>

              <div className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f, fi) => (
                  f.endsWith(":") ? (
                    <p key={fi} className="text-[11px] font-bold uppercase tracking-wider text-blue-400 pt-1">{f}</p>
                  ) : (
                    <div key={fi} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-300">{f}</span>
                    </div>
                  )
                ))}
              </div>

              <button
                onClick={onCta}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
                  plan.highlight
                    ? "bg-white text-black hover:bg-slate-100 shadow-[0_0_30px_-8px_rgba(255,255,255,0.4)]"
                    : "bg-white/[0.06] text-white border border-white/[0.12] hover:bg-white/[0.1]"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          </FadeIn>
        ))}
      </div>

      <p className="text-center text-[11px] text-slate-600 mb-20 max-w-xl mx-auto">
        Uso de inteligência e canais segue franquia/consumo conforme configuração.
      </p>

      {/* Consumo de inteligência */}
      <div className="text-center mb-10">
        <Kicker>Consumo de inteligência</Kicker>
        <SectionTitle className="text-2xl sm:text-3xl lg:text-4xl mb-5">Você controla o consumo de inteligência.</SectionTitle>
        <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
          O Axis utiliza modelos de inteligência artificial para analisar dados, conversas e executar ações.
          Cada operação pode utilizar sua própria API de inteligência ou uma estrutura disponibilizada pelo
          Axis, conforme a configuração contratada.
        </p>
      </div>

      <FadeIn>
        <div className="max-w-3xl mx-auto rounded-2xl border border-white/[0.09] bg-white/[0.02] overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-white/[0.06]">
            {CREDIT_TIERS.map((t) => (
              <div key={t.credits} className="p-4 sm:p-5 text-center">
                <div className="text-sm sm:text-base font-bold text-white mb-1" style={{ fontFamily: FONT_DISPLAY }}>{t.price}</div>
                <div className="text-[10px] text-slate-500 font-medium leading-snug">{t.credits}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-[11px] text-slate-500 mt-5">Consumo adicional conforme utilização.</p>
        <p className="text-center text-[10px] text-slate-600 mt-2 max-w-xl mx-auto">
          Os créditos representam uma unidade comercial de consumo de inteligência. O processamento real
          pode utilizar diferentes modelos e provedores.
        </p>
      </FadeIn>
    </Section>
  );
}
