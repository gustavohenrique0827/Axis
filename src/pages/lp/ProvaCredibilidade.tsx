import { Award, ShieldCheck, Zap } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, GlassCard, FONT_DISPLAY } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

// Removidos números de "resultado comprovado" (+340%, R$ 18.5M+, 99.8% uptime)
// e os 3 depoimentos de clientes fictícios que existiam aqui — nenhum dado
// real de uso agregado entre clientes é coletado hoje, e nenhum desses
// depoimentos corresponde a um cliente real. Não faz sentido prometer
// "resultados comprovados" sem números reais por trás; os cards abaixo
// descrevem capacidades que de fato existem no produto, sem métricas de
// resultado inventadas.
const METRICS = [
  { value: "24/7", label: "Atendimento via WhatsApp", desc: "Bot e IA respondem mensagens a qualquer hora, todos os dias." },
  { value: "Auto", label: "Rodízio entre Closers", desc: "Distribuição automática de leads novos entre vendedores ativos." },
  { value: "IA", label: "Qualificação de Leads", desc: "Score e temperatura calculados automaticamente a cada novo lead." },
  { value: "RLS", label: "Isolamento por Tenant", desc: "Row-Level Security no banco garante que cada empresa só acessa seus próprios dados." },
];

const TRUST_PILLARS = [
  { icon: ShieldCheck, title: "Isolamento por Tenant", desc: "Row-Level Security no banco de dados e conexões via HTTPS/TLS — cada empresa só acessa os próprios registros." },
  { icon: Zap, title: "Arquitetura Multi-Provedor", desc: "Suporte a múltiplos provedores de WhatsApp, com simulador isolado para ambiente de testes." },
  { icon: Award, title: "Implantação Acompanhada", desc: "Nossa equipe configura seus funis, regras de qualificação e treina seu time ao vivo." },
];

export function ProvaCredibilidadeSection() {
  const { theme, glow } = useLpTheme();

  return (
    <Section id="prova" className="bg-slate-50/80 relative overflow-hidden" glow>
      {/* ── Métricas de impacto ── */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="text-center mb-12">
          <Kicker>O que o S.P.Y. faz por você</Kicker>
          <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-4">
            Pare de perder clientes por falta de resposta.
          </SectionTitle>
          <Lede className="max-w-2xl mx-auto text-base sm:text-lg">
            Substitua planilhas e CRMs passivos por um ecossistema que atende, qualifica e distribui
            leads automaticamente.
          </Lede>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {METRICS.map((m, i) => (
            <FadeIn key={m.label} delay={i * 0.08}>
              <div
                className="rounded-2xl bg-white border border-slate-200/80 p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                style={{
                  borderTop: `3px solid ${theme.primary}`,
                }}
              >
                <div
                  className="text-3xl sm:text-4xl font-extrabold mb-1 tracking-tight"
                  style={{ color: theme.primaryDark, fontFamily: FONT_DISPLAY }}
                >
                  {m.value}
                </div>
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  {m.label}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{m.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ── Pilares de Segurança e Confiança ── */}
      <div className="max-w-5xl mx-auto">
        <GlassCard className="p-8 sm:p-10 border-slate-200 bg-white/90 shadow-md">
          <div className="grid md:grid-cols-3 gap-8">
            {TRUST_PILLARS.map((p, idx) => (
              <div key={p.title} className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-500"
                  style={{
                    background: glow(0.12),
                    color: theme.primaryDark,
                    border: `1px solid ${glow(0.25)}`,
                  }}
                >
                  <p.icon className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-bold text-slate-900 mb-2" style={{ fontFamily: FONT_DISPLAY }}>
                  {p.title}
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </Section>
  );
}
