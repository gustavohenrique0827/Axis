import {
  Terminal,
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
import { Section, Kicker, FONT_DISPLAY, FONT_MONO } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

interface PlanItem {
  id: string;
  name: string;
  badgeTop?: string;
  description: string;
  originalMonthly: string;
  founderMonthly: string;
  originalSetup: string;
  founderSetup: string;
  featuresHeader: string;
  features: string[];
  ctaText: string;
  ctaVariant: "outline" | "highlight" | "solid";
  icon: typeof Terminal;
  highlight?: boolean;
}

const PLANS: PlanItem[] = [
  {
    id: "start",
    name: "START",
    description: "Para empresas que querem organizar e enxergar melhor sua operação comercial.",
    originalMonthly: "De R$ 997/mês",
    founderMonthly: "498,50",
    originalSetup: "R$ 2.997",
    founderSetup: "R$ 1.498,50",
    featuresHeader: "INCLUI:",
    features: [
      "CRM comercial integrado",
      "Gestão de leads & clientes",
      "Pipeline comercial unificado",
      "Histórico de interações",
      "Integração nativa WhatsApp",
      "Inteligência sobre leads",
      "Identificação de oportunidades",
      "Análise de conversas e score",
      "Próxima melhor ação sugerida",
    ],
    ctaText: "COMEÇAR AGORA",
    ctaVariant: "outline",
    icon: Terminal,
  },
  {
    id: "autopilot",
    name: "AUTOPILOT",
    badgeTop: "★ MAIS ESCOLHIDO",
    description: "Para empresas que querem que a inteligência comece a trabalhar as oportunidades.",
    originalMonthly: "De R$ 1.997/mês",
    founderMonthly: "998,50",
    originalSetup: "R$ 4.997",
    founderSetup: "R$ 2.498,50",
    featuresHeader: "TUDO DO START +",
    features: [
      "Agentes autônomos de IA",
      "Qualificação automática 24/7",
      "Follow-up automático humanizado",
      "Recuperação de oportunidades",
      "Agendamento automático",
      "Distribuição inteligente de leads",
      "Ações comerciais automatizadas",
    ],
    ctaText: "QUERO O AUTOPILOT",
    ctaVariant: "highlight",
    icon: Send,
    highlight: true,
  },
  {
    id: "autonomous",
    name: "AUTONOMOUS",
    description: "Para empresas que querem transformar o S.P.Y. em parte ativa da sua operação.",
    originalMonthly: "De R$ 3.997/mês",
    founderMonthly: "1.998,50",
    originalSetup: "R$ 9.997",
    founderSetup: "R$ 4.998,50",
    featuresHeader: "TUDO DO AUTOPILOT +",
    features: [
      "Múltiplos agentes especializados",
      "Envio autônomo de propostas",
      "Negociação guiada com regras",
      "Reativação proativa de clientes",
      "Expansão de carteira (Upsell)",
      "Operação comercial autônoma",
      "Alta capacidade de processamento",
      "Configurações & regras avançadas",
    ],
    ctaText: "QUERO CONHECER",
    ctaVariant: "solid",
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
    <Section id="planos" className="bg-slate-50/70" glow>
      <div className="max-w-[1360px] mx-auto relative z-10">
        {/* Header superior com fundo claro harmonizado */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 pb-6 border-b border-slate-200">
          {/* Logo S.P.Y. à esquerda */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-md"
              style={{
                background:
                  theme.id === "green"
                    ? "linear-gradient(135deg, #15803D 0%, #22C55E 100%)"
                    : "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                boxShadow: `0 4px 15px ${glow(0.35)}`,
              }}
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
                Sistema Operacional de Oportunidades Comerciais
              </p>
            </div>
          </div>

          {/* Título e Subtítulo central */}
          <div className="text-center max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Escolha o nível de autonomia da sua operação.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-normal">
              Tecnologia que encontra, entende e age sobre oportunidades de vendas.
            </p>
          </div>

          {/* Badge Cliente Fundador — 50% OFF à direita */}
          <div className="shrink-0">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              style={{
                borderColor: `${theme.primary}66`,
                background: `${theme.primary}18`,
                color: theme.primaryDark,
              }}
            >
              <span className="text-base">🤝</span>
              <span>CLIENTE FUNDADOR — 50% OFF</span>
            </div>
          </div>
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
                    ? `0 20px 45px -15px ${glow(0.25)}`
                    : undefined,
                }}
              >
                {/* Badge Topo se destacado */}
                {p.badgeTop && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span
                      className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-md"
                      style={{
                        background:
                          theme.id === "green"
                            ? "linear-gradient(135deg, #15803D 0%, #16A34A 50%, #22C55E 100%)"
                            : "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                      }}
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
                      className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0"
                      style={{
                        background: `${theme.primary}18`,
                        borderColor: `${theme.primary}33`,
                        color: theme.primaryDark,
                      }}
                    >
                      <p.icon className="w-4 h-4" />
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
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs text-slate-400 line-through font-medium">
                        {p.originalMonthly}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                        style={{
                          background: `${theme.primary}18`,
                          borderColor: `${theme.primary}40`,
                          color: theme.primaryDark,
                        }}
                      >
                        50% OFF FUNDADOR
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-slate-400">R$</span>
                      <span
                        className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight"
                        style={{ fontFamily: FONT_DISPLAY }}
                      >
                        {p.founderMonthly}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">/mês</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                      <span>
                        Implantação:{" "}
                        <span className="line-through text-slate-400">{p.originalSetup}</span>
                      </span>
                      <span className="font-bold ml-1" style={{ color: theme.primaryDark }}>
                        {p.founderSetup}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Recursos */}
                  <div className="space-y-2.5 mb-6">
                    <p
                      className="text-[10px] font-black uppercase tracking-widest mb-3"
                      style={{ color: theme.primaryDark }}
                    >
                      {p.featuresHeader}
                    </p>
                    {p.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            background: `${theme.primary}20`,
                            color: theme.primaryDark,
                          }}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão CTA do Card */}
                <div className="mt-4 pt-2">
                  {isHighlight ? (
                    <button
                      onClick={onCta}
                      className="w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-slate-950"
                      style={{
                        background: theme.primary,
                        boxShadow: `0 8px 20px -4px ${glow(0.4)}`,
                      }}
                    >
                      <span>{p.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onCta}
                      className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-800 flex items-center justify-center gap-2"
                    >
                      <span>{p.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* CARD 4: CRÉDITOS DE INTELIGÊNCIA & CONTROLE TOTAL */}
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
                  CRÉDITOS DE INTELIGÊNCIA
                </h3>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Consumo utilizado pelos agentes do S.P.Y.
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
              <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed mb-6">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: theme.primaryDark }} />
                <span>
                  Consumo adicional conforme uso. Conecte sua chave ou recarregue quando precisar.
                </span>
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
                        Conecte sua conta OpenAI, Gemini ou outro provedor compatível.
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
                        Decida como e quando a IA age na sua operação.
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
                        Mais previsibilidade, transparência e controle de custos.
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
                <p className="text-[11px] text-slate-500">Cancele quando quiser</p>
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
                <h4 className="text-xs font-bold text-slate-900">Segurança & privacidade</h4>
                <p className="text-[11px] text-slate-500">Dados criptografados</p>
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
                <p className="text-[11px] text-slate-500">Acompanhamento próximo</p>
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
                <p className="text-[11px] text-slate-500">Novos agentes contínuos</p>
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
              S.P.Y.: O sistema operacional de oportunidades comerciais.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
