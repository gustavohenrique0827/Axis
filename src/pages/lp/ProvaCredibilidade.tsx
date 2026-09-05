import { Award, CheckCircle2, Star, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, GlassCard, FONT_DISPLAY, FONT_MONO } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

const METRICS = [
  { value: "+340%", label: "Velocidade no 1º contato", desc: "Leads atendidos em menos de 20s via WhatsApp 24/7" },
  { value: "R$ 18.5M+", label: "Em pipeline monitorado", desc: "Negócios rastreados com IA sem perda de follow-up" },
  { value: "+42%", label: "Aumento médio em conversão", desc: "Com qualificação em etapas e rodízio entre closers" },
  { value: "99.8%", label: "Taxa de disponibilidade", desc: "Infraestrutura em nuvem segura e compliance LGPD" },
];

const SUCCESS_CASES = [
  {
    company: "E-EMPREENDA+",
    segment: "Educação & Negócios",
    quote:
      "O formulário de inscrição em 5 passos integrado ao rodízio automático de SDRs aumentou nossas matrículas em 48% no primeiro mês. Nenhum aluno fica sem contato imediato.",
    author: "Diretoria de Operações",
    role: "E-EMPREENDA+ Educação Executiva",
    metric: "+48% matrículas",
    tag: "Educação",
  },
  {
    company: "G-Tech Master",
    segment: "Varejo Apple & Eletrônicos",
    quote:
      "Controlar estoque de iPhones e atender mais de 120 mensagens diárias no WhatsApp era caótico. O S.P.Y. classifica quem tem aparelho para troca e entrega o lead pronto para o vendedor fechar.",
    author: "Gerência Comercial",
    role: "G-Tech Master Palmas",
    metric: "3.2x mais vendas na troca",
    tag: "Varejo Tech",
  },
  {
    company: "Luxe Higienização",
    segment: "Estética & Serviços",
    quote:
      "A recuperação automática de orçamentos parados transformou nossos domingos e noites. A IA responde orçamentos em segundos e agenda as visitas direto no Google Calendar.",
    author: "Frederico Silva",
    role: "Fundador & Diretor Geral",
    metric: "R$ 38k recuperados/mês",
    tag: "Serviços",
  },
];

const TRUST_PILLARS = [
  { icon: ShieldCheck, title: "LGPD & Segurança Bancária", desc: "Dados criptografados de ponta a ponta com servidores auditados e isolamento por tenant." },
  { icon: Zap, title: "WhatsApp Cloud & Evolution", desc: "Arquitetura multi-instância resiliente sem risco de bloqueio acidental da operação." },
  { icon: Award, title: "Implantação Acompanhada", desc: "Nossa equipe configura seus funis, regras de qualificação e treina seu time ao vivo." },
];

export function ProvaCredibilidadeSection() {
  const { theme, glow } = useLpTheme();

  return (
    <Section id="prova" className="bg-slate-50/80 relative overflow-hidden" glow>
      {/* ── Métricas de impacto ── */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="text-center mb-12">
          <Kicker>Resultados Comprovados</Kicker>
          <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-4">
            Operações que pararam de perder clientes.
          </SectionTitle>
          <Lede className="max-w-2xl mx-auto text-base sm:text-lg">
            Empresas que trocaram planilhas e CRMs passivos pelo ecossistema inteligente S.P.Y.
            sentiram a diferença já nas primeiras semanas.
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

      {/* ── Casos de Sucesso Reais ── */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {SUCCESS_CASES.map((item, i) => (
            <FadeIn key={item.company} delay={i * 0.1}>
              <div className="h-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                      style={{
                        background: glow(0.12),
                        color: theme.primaryDark,
                        border: `1px solid ${glow(0.25)}`,
                      }}
                    >
                      {item.tag}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                      style={{ fontFamily: FONT_MONO }}
                    >
                      {item.metric}
                    </span>
                  </div>

                  <div className="flex gap-1 text-amber-400 mb-3">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star key={starIdx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                    "{item.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900" style={{ fontFamily: FONT_DISPLAY }}>
                      {item.company}
                    </h4>
                    <p className="text-[11px] text-slate-500">{item.role}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
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
