import { useState } from "react";
import { Check, Star, Zap, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, ThemedCTAButton, ThemedOutlineButton, FONT_DISPLAY, FONT_MONO } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
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
    monthlyPrice: 997,
    annualPrice: 797,
    setup: "Implantação assistida inclusa",
    description: "Para empresas que querem organizar e enxergar a operação comercial sem planilhas soltas.",
    features: [
      "CRM & Pipeline Comercial visual ilimitado",
      "Conexão oficial com WhatsApp",
      "Histórico completo de conversas por lead",
      "Gestão de contatos, tarefas e notas internas",
      "Transcrição automática de áudios com IA",
      "Painel de métricas e conversão em tempo real",
      "Suporte técnico via chamados e base de conhecimento",
    ],
    cta: "Começar com o Start",
  },
  {
    name: "Autopilot",
    monthlyPrice: 1997,
    annualPrice: 1597,
    setup: "Implantação e treinamento ao vivo inclusos",
    description: "Para operações que querem a Aurora IA qualificando e distribuindo leads 24 horas por dia.",
    features: [
      "Tudo do plano Start, mais:",
      "Aurora IA integrada 24/7 sem fila",
      "Qualificação automática de leads em etapas",
      "Rodízio inteligente de SDRs e Closers",
      "Follow-up automático de leads que esfriaram",
      "Agendamento direto no Google Calendar & Google Meet",
      "Radar de Oportunidades & Análise de Sentimento",
      "Lembretes automáticos via WhatsApp anti-no-show",
      "Suporte prioritário via WhatsApp corporativo",
    ],
    cta: "Quero o Autopilot",
    badge: "Mais Escolhido",
    highlight: true,
  },
  {
    name: "Autonomous",
    monthlyPrice: 3997,
    annualPrice: 3197,
    setup: "Consultoria de implantação personalizada",
    description: "Para empresas de alta performance que buscam automação ponta a ponta e escala comercial.",
    features: [
      "Tudo do plano Autopilot, mais:",
      "Múltiplos agentes com regras e instruções customizadas",
      "Geração de contratos com assinatura digital em 1 clique",
      "Módulo Financeiro completo: DRE, contas e fluxo de caixa",
      "Cálculo automático de comissões por vendedor e squad",
      "Multi-tenant & White-Label com marca e cores da empresa",
      "Construtor de Formulários e Landing Pages ilimitadas",
      "API aberta e webhooks para integração com ERPs",
      "Gerente de conta dedicado e reuniões mensais de alinhamento",
    ],
    cta: "Contratar o Autonomous",
  },
];

export function PlanosSection({ onCta }: { onCta: () => void }) {
  const { theme, glow } = useLpTheme();
  const [isAnnual, setIsAnnual] = useState(true);

  const formatPrice = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <Section id="planos" className="bg-slate-50/70 relative" glow>
      <div className="text-center mb-10">
        <Kicker>Investimento Transparente</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-4">
          Escolha o nível de autonomia da sua operação.
        </SectionTitle>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Sem taxas ocultas. Escolha o plano ideal para a sua equipe e comece a recuperar oportunidades perdidas.
        </p>

        {/* Toggle Mensal / Anual */}
        <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
              !isAnnual ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Faturamento Mensal
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              isAnnual ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Faturamento Anual
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ background: glow(0.2), color: theme.primaryDark }}
            >
              20% OFF
            </span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-12 items-stretch max-w-6xl mx-auto">
        {PLANS.map((plan, i) => {
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          return (
            <FadeIn key={plan.name} delay={i * 0.08} className={`h-full ${plan.highlight ? "lg:-mt-3" : ""}`}>
              <div
                className={`relative h-full flex flex-col justify-between rounded-3xl p-7 sm:p-8 bg-white border transition-all duration-300 ${
                  plan.highlight
                    ? "border-2 shadow-xl ring-4 ring-emerald-500/10"
                    : "border-slate-200 shadow-sm hover:shadow-md"
                }`}
                style={{
                  borderColor: plan.highlight ? theme.primary : undefined,
                }}
              >
                {/* Badge destaque */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-md"
                      style={{ background: theme.primary }}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-black text-slate-900" style={{ fontFamily: FONT_DISPLAY }}>
                      {plan.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-6 min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Preço */}
                  <div className="mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: FONT_DISPLAY }}>
                        {formatPrice(price)}
                      </span>
                      <span className="text-xs font-bold text-slate-400">/mês</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">{plan.setup}</p>
                  </div>

                  {/* Lista de Recursos */}
                  <div className="space-y-3 mb-8">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      O que está incluso:
                    </p>
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {plan.highlight ? (
                    <ThemedCTAButton onClick={onCta} className="w-full py-3.5 text-sm font-bold shadow-md">
                      {plan.cta} <ArrowRight className="w-4 h-4 ml-1" />
                    </ThemedCTAButton>
                  ) : (
                    <ThemedOutlineButton onClick={onCta} className="w-full py-3.5 text-sm font-bold">
                      {plan.cta}
                    </ThemedOutlineButton>
                  )}
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>

      {/* Garantia incondicional */}
      <div className="max-w-3xl mx-auto text-center p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: glow(0.15) }}
        >
          <ShieldCheck className="w-6 h-6" style={{ color: theme.primaryDark }} />
        </div>
        <div className="text-left flex-1">
          <h4 className="text-sm font-bold text-slate-900" style={{ fontFamily: FONT_DISPLAY }}>
            Garantia Incondicional de 14 Dias
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Se a sua equipe não constatar um aumento perceptível na velocidade de atendimento e recuperação de leads nos primeiros 14 dias, cancelamos sua assinatura sem complicações.
          </p>
        </div>
      </div>
    </Section>
  );
}
