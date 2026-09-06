import { useState } from "react";
import { Building2, Sun, Stethoscope, Briefcase, GraduationCap, ShoppingBag, Car, Check } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, FONT_DISPLAY } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

const SEGMENTS = [
  {
    icon: ShoppingBag,
    label: "Varejo & Lojas",
    tagline: "Para comércios físicos, e-commerce e venda consultiva de produtos.",
    example: "Catálogo ágil no WhatsApp, controle de pedidos e recuperação de vendas.",
    features: [
      "Catálogo de produtos dinâmico enviado em segundos no WhatsApp",
      "Follow-up rápido para clientes que pediram cotação ou orçamento",
      "Histórico de compras e preferências de cada cliente para recompra",
      "Integração de pedidos e controle simplificado de saída",
    ],
  },
  {
    icon: Car,
    label: "Concessionárias",
    tagline: "Test drives agendados, avaliação de seminovos e financiamento.",
    example: "Atendimento imediato ao lead de anúncio e triagem de interesse em veículo.",
    features: [
      "Agendamento automático de test drive com lembrete no WhatsApp",
      "Captação de dados do veículo na troca para pré-avaliação",
      "Acompanhamento das etapas de proposta e aprovação de crédito",
      "Distribuição por equipe de veículos novos, seminovos e pós-venda",
    ],
  },
  {
    icon: Briefcase,
    label: "Venda Consultiva",
    tagline: "Ciclos de venda consultivos sem perder o histórico com decisores.",
    example: "Múltiplos contatos por empresa, propostas formais e acompanhamento de SLA.",
    features: [
      "Múltiplos contatos e decisores vinculados ao mesmo CNPJ",
      "Radar de fechamento quando a proposta é visualizada pelo cliente",
      "Controle de propostas e previsão de faturamento mensal",
      "DRE integrado com faturas e fluxo de caixa da operação",
    ],
  },
  {
    icon: GraduationCap,
    label: "Educação & Cursos",
    tagline: "O modelo oficial utilizado pela E-EMPREENDA+.",
    example: "Inscrição interativa em etapas, rodízio entre consultores e fechamento.",
    features: [
      "Formulário de qualificação em 5 passos integrado",
      "Rodízio round-robin imediato entre os consultores de matrícula",
      "Recuperação de alunos que pararam na etapa de pagamento",
      "Controle de matrículas, turmas e cobrança recorrente",
    ],
  },
  {
    icon: Building2,
    label: "Imobiliárias",
    tagline: "Do primeiro interesse à chave na mão com visitas agendadas.",
    example: "Organiza lançamentos, visitas com bloqueio de agenda e comissões.",
    features: [
      "Portfólio com link personalizado por corretor",
      "Agendamento de visitas com lembrete no WhatsApp",
      "Gestão de propostas e aprovação de crédito imobiliário",
      "Contratos de locação e compra gerados em PDF",
    ],
  },
  {
    icon: Stethoscope,
    label: "Clínicas & Saúde",
    tagline: "Redução de até 70% no no-show de consultas e exames.",
    example: "Confirmação automática de consultas e acolhimento imediato de pacientes.",
    features: [
      "Confirmação automática via WhatsApp com botão Sim/Não",
      "Fila de espera para encaixes de horários cancelados",
      "Histórico de procedimentos e orçamento de tratamentos",
      "Bloqueio sincronizado na agenda médica",
    ],
  },
  {
    icon: Sun,
    label: "Energia Solar",
    tagline: "Orçamentos técnicos rápidos e acompanhamento de projetos.",
    example: "Do recebimento da conta de luz até a instalação e homologação.",
    features: [
      "Recebimento de foto da fatura de energia no WhatsApp",
      "Cálculo automático da média de consumo e economia estimada",
      "Etapas do funil: visita técnica, proposta, homologação e instalação",
      "Contratos com valor jurídico e parcelamento",
    ],
  },
];

export function SegmentacaoSection() {
  const { theme, glow } = useLpTheme();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeSegment = SEGMENTS[selectedIdx];

  return (
    <Section id="segmentos" className="bg-white" glow>
      <div className="text-center mb-12">
        <Kicker>Verticalização Inteligente</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-4">
          O S.P.Y. adapta-se à realidade do seu mercado.
        </SectionTitle>
        <Lede className="max-w-2xl mx-auto text-base sm:text-lg">
          A base é robusta — CRM, WhatsApp e IA —, mas os campos, funis e regras de automação
          são configurados sob medida para o seu nicho.
        </Lede>
      </div>

      {/* Seletor de segmentos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 max-w-6xl mx-auto mb-8">
        {SEGMENTS.map((s, i) => {
          const isSelected = selectedIdx === i;
          return (
            <button
              key={s.label}
              onClick={() => setSelectedIdx(i)}
              style={
                isSelected
                  ? { background: theme.primary, color: "#0F172A", borderColor: theme.primary }
                  : undefined
              }
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border text-center transition-all duration-200 ${
                isSelected
                  ? "shadow-md -translate-y-1"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <s.icon
                className={`w-5 h-5 transition-colors ${
                  isSelected ? "text-slate-900" : "text-slate-500"
                }`}
              />
              <span className="text-[11px] font-bold leading-tight" style={{ fontFamily: FONT_DISPLAY }}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detalhe do nicho selecionado */}
      <FadeIn key={activeSegment.label}>
        <div className="max-w-4xl mx-auto rounded-3xl bg-slate-50 border border-slate-200/80 p-7 sm:p-9 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <activeSegment.icon className="w-5 h-5" style={{ color: theme.primaryDark }} />
                <h3 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: FONT_DISPLAY }}>
                  {activeSegment.label}
                </h3>
              </div>
              <p className="text-sm text-slate-600 font-medium">{activeSegment.tagline}</p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold self-start md:self-auto"
              style={{
                background: glow(0.12),
                color: theme.primaryDark,
                border: `1px solid ${glow(0.25)}`,
              }}
            >
              {activeSegment.example}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3.5">
            {activeSegment.features.map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: glow(0.15) }}
                >
                  <Check className="w-3 h-3" style={{ color: theme.primaryDark }} />
                </div>
                <span className="text-xs font-medium text-slate-800">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}
