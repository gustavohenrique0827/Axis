import {
  Rocket,
  Send,
  Zap,
  Check,
  Star,
  Coins,
  SlidersHorizontal,
  Info,
  Infinity as InfinityIcon,
  ShieldCheck,
  Headphones,
  RefreshCw,
  Key,
  Scale,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Section, FONT_DISPLAY, FONT_MONO } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

interface PlanItem {
  id: string;
  name: string;
  badgeTop?: string;
  description: string;
  monthlyPrice: string;
  setupPrice: string;
  featuresHeader: string;
  features: string[];
  ctaText: string;
  icon: typeof Rocket;
  highlight?: boolean;
}

const PLANS: PlanItem[] = [
  {
    id: "start",
    name: "START",
    description: "Para empresas que querem organizar e enxergar melhor sua operação comercial.",
    monthlyPrice: "997",
    setupPrice: "R$ 2.997",
    featuresHeader: "Inclui:",
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
    ctaText: "COMEÇAR AGORA",
    icon: Rocket,
  },
  {
    id: "autopilot",
    name: "AUTOPILOT",
    badgeTop: "☆ MAIS ESCOLHIDO",
    description: "Para empresas que querem que a inteligência comece a trabalhar as oportunidades.",
    monthlyPrice: "1.997",
    setupPrice: "R$ 4.997",
    featuresHeader: "Tudo do START +",
    features: [
      "Agentes de IA",
      "Qualificação automática",
      "Follow-up automático",
      "Recuperação de oportunidades",
      "Agendamento automático",
      "Distribuição de leads",
      "Ações comerciais automatizadas",
    ],
    ctaText: "QUERO O AUTOPILOT",
    icon: Send,
    highlight: true,
  },
  {
    id: "autonomous",
    name: "AUTONOMOUS",
    description: "Para empresas que querem transformar o S.P.Y. em parte ativa da sua operação comercial.",
    monthlyPrice: "3.997",
    setupPrice: "R$ 9.997",
    featuresHeader: "Tudo do AUTOPILOT +",
    features: [
      "Múltiplos agentes especializados",
      "Propostas comerciais",
      "Negociação com regras",
      "Reativação de clientes",
      "Expansão de carteira",
      "Operação comercial autônoma",
      "Maior capacidade de processamento",
      "Configurações avançadas",
    ],
    ctaText: "QUERO CONHECER",
    icon: Zap,
  },
];

const TOKEN_TIERS = [
  { credits: "10.000 créditos", price: "R$ 199" },
  { credits: "30.000 créditos", price: "R$ 497" },
  { credits: "75.000 créditos", price: "R$ 997" },
  { credits: "150.000 créditos", price: "R$ 1.797" },
  { credits: "300.000 créditos", price: "R$ 2.997" },
];

export function PlanosSection({ onCta }: { onCta: () => void }) {
  const { theme, glow } = useLpTheme();

  return (
    <Section id="planos" className="bg-slate-50/70 border-t border-slate-200" glow>
      <div className="max-w-[1360px] mx-auto relative z-10">
        {/* Header superior 100% Claro */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 pb-6 border-b border-slate-200">
          {/* Logo S.P.Y. */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-slate-900 text-xl shadow-sm border border-slate-200"
              style={{ background: theme.primaryLight }}
            >
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xl font-black tracking-wider text-slate-900"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  S.P.Y.
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Sistema Operacional de Oportunidades Comerciais.
              </p>
            </div>
          </div>

          {/* Título e Subtítulo */}
          <div className="text-center max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Escolha o nível de{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: theme.heroGradient }}
              >
                autonomia
              </span>{" "}
              da sua operação.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-normal">
              Tecnologia que{" "}
              <strong className="font-semibold text-slate-900">encontra</strong>,{" "}
              <strong className="font-semibold text-slate-900">entende</strong> e{" "}
              <strong className="font-semibold text-slate-900">age</strong> sobre oportunidades de vendas.
            </p>
          </div>

          {/* Espaço de equilíbrio à direita */}
          <div className="hidden lg:block w-36" />
        </div>

        {/* Grid de 4 Colunas (3 Planos + 1 Créditos de Inteligência) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
          {PLANS.map((p) => {
            const isHighlight = p.highlight;

            return (
              <div
                key={p.id}
                className={`relative rounded-3xl flex flex-col justify-between p-6 sm:p-7 transition-all duration-300 bg-white ${
                  isHighlight
                    ? "border-2 shadow-xl ring-4"
                    : "border border-slate-200/90 shadow-sm hover:shadow-md"
                }`}
                style={{
                  borderColor: isHighlight ? theme.primary : undefined,
                  boxShadow: isHighlight
                    ? `0 20px 45px -15px ${glow(0.3)}`
                    : undefined,
                }}
              >
                {/* Badge Topo se destacado */}
                {p.badgeTop && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span
                      className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-950 shadow-md"
                      style={{ background: theme.primary }}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      {p.badgeTop}
                    </span>
                  </div>
                )}

                <div>
                  {/* Ícone e Nome do Plano */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
                      style={{
                        background: `${theme.primary}18`,
                        borderColor: `${theme.primary}33`,
                        color: theme.primaryDark,
                      }}
                    >
                      <p.icon className="w-5 h-5" />
                    </div>
                    <h3
                      className="text-lg font-black text-slate-900 tracking-wider uppercase"
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      {p.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[38px] mb-5">
                    {p.description}
                  </p>

                  {/* Bloco de Preços */}
                  <div className="mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-slate-400">R$</span>
                      <span
                        className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight"
                        style={{ fontFamily: FONT_DISPLAY }}
                      >
                        {p.monthlyPrice}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">/mês</span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-2 font-mono">
                      <span>Implantação: </span>
                      <span className="font-bold text-slate-900">{p.setupPrice}</span>
                    </div>
                  </div>

                  {/* Lista de Recursos */}
                  <div className="space-y-2.5 mb-6">
                    <p
                      className="text-[11px] font-black uppercase tracking-widest mb-3"
                      style={{ color: theme.primaryDark }}
                    >
                      {p.featuresHeader}
                    </p>
                    {p.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            background: `${theme.primary}25`,
                            color: theme.primaryDark,
                          }}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-tight font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão CTA */}
                <div className="mt-4 pt-2">
                  <button
                    onClick={onCta}
                    className="w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    style={{
                      background: isHighlight ? theme.primary : "#0F172A",
                      color: isHighlight ? "#0F172A" : "#FFFFFF",
                    }}
                  >
                    <span>{p.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* CARD 4: CRÉDITOS DE INTELIGÊNCIA S.P.Y. */}
          <div className="relative rounded-3xl flex flex-col justify-between p-6 sm:p-7 bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
            <div>
              {/* Header do Card */}
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border"
                  style={{
                    background: `${theme.primary}18`,
                    borderColor: `${theme.primary}33`,
                    color: theme.primaryDark,
                  }}
                >
                  <Coins className="w-4 h-4" />
                </div>
                <h3
                  className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  CRÉDITOS DE INTELIGÊNCIA S.P.Y.
                </h3>
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Unidade comercial de consumo de inteligência utilizada pelos agentes do S.P.Y.
              </p>

              {/* Tabela de Valores de Créditos */}
              <div className="space-y-2 mb-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                {TOKEN_TIERS.map((tier) => (
                  <div
                    key={tier.credits}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-200/40 last:border-0"
                  >
                    <span className="text-slate-700 font-medium">{tier.credits}</span>
                    <span className="font-bold text-slate-900 font-mono">{tier.price}</span>
                  </div>
                ))}
              </div>

              {/* Subtexto explicativo */}
              <div className="space-y-1 text-[11px] text-slate-500 leading-relaxed mb-6">
                <div className="flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: theme.primaryDark }} />
                  <span className="font-semibold text-slate-700">
                    Consumo adicional conforme utilização.
                  </span>
                </div>
                <p className="pl-5 text-[10px] text-slate-400">
                  Os créditos representam uma unidade comercial de consumo de inteligência. O processamento real pode utilizar diferentes modelos e provedores.
                </p>
              </div>

              {/* Linha Divisória */}
              <div className="border-t border-slate-200 pt-5 mb-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
                  <SlidersHorizontal className="w-4 h-4" style={{ color: theme.primaryDark }} />
                  <span>VOCÊ TEM CONTROLE TOTAL</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Item 1 */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${theme.primary}18`, color: theme.primaryDark }}
                    >
                      <Key className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 leading-snug">Use sua própria API</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Conecte sua conta da OpenAI, Google Gemini ou outro provedor compatível.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${theme.primary}18`, color: theme.primaryDark }}
                    >
                      <Scale className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 leading-snug">Defina suas regras</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Você decide como a inteligência deve agir dentro da sua operação.
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${theme.primary}18`, color: theme.primaryDark }}
                    >
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 leading-snug">Pague pelo que utiliza</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Mais transparência, previsibilidade e controle do seu investimento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ação final do card 4 */}
            <div className="mt-4 pt-2">
              <button
                onClick={onCta}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-center gap-2"
              >
                <span>Falar com especialista</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Barra Inferior com Garantias e Slogan Oficial */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* 4 Pilares de Garantia */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                style={{
                  background: `${theme.primary}15`,
                  borderColor: `${theme.primary}30`,
                  color: theme.primaryDark,
                }}
              >
                <InfinityIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Sem fidelidade</h4>
                <p className="text-[11px] text-slate-500">Cancele quando quiser.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                style={{
                  background: `${theme.primary}15`,
                  borderColor: `${theme.primary}30`,
                  color: theme.primaryDark,
                }}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Segurança e privacidade</h4>
                <p className="text-[11px] text-slate-500">Seus dados protegidos com criptografia e boas práticas.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                style={{
                  background: `${theme.primary}15`,
                  borderColor: `${theme.primary}30`,
                  color: theme.primaryDark,
                }}
              >
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Suporte especializado</h4>
                <p className="text-[11px] text-slate-500">Acompanhamento próximo para garantir o sucesso da operação.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
                style={{
                  background: `${theme.primary}15`,
                  borderColor: `${theme.primary}30`,
                  color: theme.primaryDark,
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Evolução constante</h4>
                <p className="text-[11px] text-slate-500">Novas funcionalidades e agentes são liberados continuamente.</p>
              </div>
            </div>
          </div>

          {/* Slogan à direita */}
          <div className="text-center lg:text-right shrink-0">
            <p
              className="text-xs sm:text-sm font-black tracking-widest text-slate-800 uppercase"
              style={{ fontFamily: FONT_MONO }}
            >
              ENCONTRA. ENTENDE. AGE. CONVERTE.
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              S.P.Y. O sistema operacional de oportunidades comerciais.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
