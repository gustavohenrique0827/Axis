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
import { FONT_DISPLAY, FONT_MONO } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

interface PlanFeature {
  text: string;
}

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
  ctaVariant: "outline-blue" | "primary-violet" | "solid-cyan";
  icon: typeof Terminal;
  accentColor: "blue" | "violet" | "cyan";
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
    ctaVariant: "outline-blue",
    icon: Terminal,
    accentColor: "blue",
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
    ctaVariant: "primary-violet",
    icon: Send,
    accentColor: "violet",
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
    ctaVariant: "solid-cyan",
    icon: Zap,
    accentColor: "cyan",
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
    <section
      id="planos"
      className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#060A14] text-white"
    >
      {/* Background glow radiais com cores vivas e dinâmicas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 transition-all duration-700"
          style={{ background: theme.glowColor }}
        />
        <div
          className="absolute top-[35%] right-[15%] w-[450px] h-[450px] rounded-full blur-[140px] opacity-15 transition-all duration-700"
          style={{ background: theme.glowColorAlt }}
        />
      </div>

      <div className="max-w-[1360px] mx-auto relative z-10">
        {/* Header superior idêntico ao design original */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 pb-6 border-b border-white/[0.08]">
          {/* Logo S.P.Y. à esquerda */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-md"
              style={{
                background: theme.id === "green"
                  ? "linear-gradient(135deg, #15803D 0%, #22C55E 100%)"
                  : "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                boxShadow: `0 4px 15px ${theme.glowColor}40`,
              }}
            >
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider text-white" style={{ fontFamily: FONT_DISPLAY }}>
                  S.P.Y.
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Sistema Operacional de Oportunidades Comerciais
              </p>
            </div>
          </div>

          {/* Título e Subtítulo central */}
          <div className="text-center max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Escolha o nível de autonomia da sua operação.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-normal">
              Tecnologia que encontra, entende e age sobre oportunidades de vendas.
            </p>
          </div>

          {/* Badge Cliente Fundador — 50% OFF à direita */}
          <div className="shrink-0">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              style={{
                borderColor: `${theme.primary}66`,
                background: `${theme.primary}1A`,
                color: theme.id === "green" ? "#86EFAC" : theme.primaryLight,
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
                className={`relative rounded-2xl flex flex-col justify-between p-6 sm:p-7 transition-all duration-300 ${
                  isHighlight
                    ? "bg-[#0B1226]/95 border-2 shadow-2xl backdrop-blur-md"
                    : "bg-[#090F1C]/90 border border-white/[0.08] hover:border-white/20 shadow-lg backdrop-blur-sm"
                }`}
                style={{
                  borderColor: isHighlight
                    ? theme.id === "green"
                      ? theme.primary
                      : "#8B5CF6"
                    : undefined,
                  boxShadow: isHighlight
                    ? `0 20px 50px -15px ${theme.id === "green" ? `${theme.primary}33` : "rgba(139, 92, 246, 0.25)"}`
                    : undefined,
                }}
              >
                {/* Badge Topo se destacado */}
                {p.badgeTop && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span
                      className="inline-flex items-center gap-1 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
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
                        background:
                          p.accentColor === "violet"
                            ? `${theme.primary}22`
                            : p.accentColor === "cyan"
                            ? "rgba(6, 182, 212, 0.15)"
                            : "rgba(59, 130, 246, 0.15)",
                        borderColor:
                          p.accentColor === "violet"
                            ? `${theme.primary}44`
                            : p.accentColor === "cyan"
                            ? "rgba(6, 182, 212, 0.3)"
                            : "rgba(59, 130, 246, 0.3)",
                        color:
                          p.accentColor === "violet"
                            ? theme.primary
                            : p.accentColor === "cyan"
                            ? "#22D3EE"
                            : "#60A5FA",
                      }}
                    >
                      <p.icon className="w-4 h-4" />
                    </div>
                    <h3
                      className="text-lg font-black text-white tracking-wider uppercase"
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      {p.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[38px] mb-5">
                    {p.description}
                  </p>

                  {/* Bloco de Preços */}
                  <div className="mb-4 pb-4 border-b border-white/[0.08]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs text-slate-500 line-through font-medium">
                        {p.originalMonthly}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        50% OFF FUNDADOR
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-slate-400">R$</span>
                      <span
                        className="text-3xl sm:text-4xl font-black text-white tracking-tight"
                        style={{ fontFamily: FONT_DISPLAY }}
                      >
                        {p.founderMonthly}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">/mês</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                      <span>
                        Implantação:{" "}
                        <span className="line-through text-slate-500">{p.originalSetup}</span>
                      </span>
                      <span
                        className="font-bold ml-1"
                        style={{
                          color:
                            p.accentColor === "violet"
                              ? theme.primary
                              : p.accentColor === "cyan"
                              ? "#22D3EE"
                              : "#60A5FA",
                        }}
                      >
                        {p.founderSetup}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Recursos */}
                  <div className="space-y-2.5 mb-6">
                    <p
                      className="text-[10px] font-black uppercase tracking-widest mb-3"
                      style={{
                        color:
                          p.accentColor === "violet"
                            ? theme.primary
                            : p.accentColor === "cyan"
                            ? "#22D3EE"
                            : "#94A3B8",
                      }}
                    >
                      {p.featuresHeader}
                    </p>
                    {p.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            background:
                              p.accentColor === "violet"
                                ? `${theme.primary}22`
                                : p.accentColor === "cyan"
                                ? "rgba(6, 182, 212, 0.15)"
                                : "rgba(59, 130, 246, 0.15)",
                            color:
                              p.accentColor === "violet"
                                ? theme.primary
                                : p.accentColor === "cyan"
                                ? "#22D3EE"
                                : "#60A5FA",
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
                  {p.ctaVariant === "primary-violet" ? (
                    <button
                      onClick={onCta}
                      className="w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                      style={{
                        background:
                          theme.id === "green"
                            ? theme.primary
                            : "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)",
                        color: theme.id === "green" ? "#061A0C" : "#FFFFFF",
                        boxShadow: `0 10px 25px -5px ${theme.id === "green" ? `${theme.primary}55` : "rgba(124, 58, 237, 0.5)"}`,
                      }}
                    >
                      <span>{p.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : p.ctaVariant === "solid-cyan" ? (
                    <button
                      onClick={onCta}
                      className="w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
                    >
                      <span>{p.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onCta}
                      className="w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 border border-blue-500/40 hover:border-blue-400 bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 flex items-center justify-center gap-2"
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
          <div className="relative rounded-2xl flex flex-col justify-between p-6 sm:p-7 bg-[#090F1C]/90 border border-white/[0.08] hover:border-white/20 shadow-lg backdrop-blur-sm">
            <div>
              {/* Header do Card */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Coins className="w-4 h-4" />
                </div>
                <h3
                  className="text-xs sm:text-sm font-black text-cyan-400 tracking-wider uppercase"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  CRÉDITOS DE INTELIGÊNCIA
                </h3>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Consumo utilizado pelos agentes do S.P.Y.
              </p>

              {/* Tabela de Valores de Créditos */}
              <div className="space-y-2 mb-4 bg-black/40 p-3.5 rounded-xl border border-white/[0.05]">
                {TOKEN_TIERS.map((tier) => (
                  <div
                    key={tier.credits}
                    className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04] last:border-0"
                  >
                    <span className="text-slate-300 font-medium">{tier.credits}</span>
                    <span className="font-bold text-white font-mono">{tier.price}</span>
                  </div>
                ))}
              </div>

              {/* Subtexto explicativo */}
              <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed mb-6">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Consumo adicional conforme uso. Conecte sua chave ou recarregue quando precisar.
                </span>
              </div>

              {/* Linha Divisória */}
              <div className="border-t border-white/[0.08] pt-5 mb-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white mb-4">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  <span>VOCÊ TEM CONTROLE TOTAL</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Item 1 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <Key className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 leading-snug">Use sua própria API</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Conecte sua conta OpenAI, Gemini ou outro provedor compatível.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Scale className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 leading-snug">Defina suas regras</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Decida como e quando a IA age na sua operação.
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 leading-snug">Pague pelo que utiliza</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
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
                className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 border border-white/10 hover:border-cyan-500/40 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center gap-2"
              >
                <span>Falar com especialista</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Barra Inferior com Garantias e Slogan Oficial */}
        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* 4 Pilares de Garantia */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 shrink-0">
                <InfinityIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Sem fidelidade</h4>
                <p className="text-[11px] text-slate-400">Cancele quando quiser</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Segurança & privacidade</h4>
                <p className="text-[11px] text-slate-400">Dados criptografados</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Suporte especializado</h4>
                <p className="text-[11px] text-slate-400">Acompanhamento próximo</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Evolução constante</h4>
                <p className="text-[11px] text-slate-400">Novos agentes contínuos</p>
              </div>
            </div>
          </div>

          {/* Slogan à direita */}
          <div className="text-center lg:text-right shrink-0">
            <p
              className="text-xs sm:text-sm font-black tracking-widest text-slate-200 uppercase"
              style={{ fontFamily: FONT_MONO }}
            >
              ENCONTRA. ENTENDE. AGE. CONVERTE.
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              S.P.Y.: O sistema operacional de oportunidades comerciais.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
