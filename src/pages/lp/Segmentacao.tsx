import { useState } from "react";
import { Building2, Sun, Stethoscope, Briefcase, GraduationCap, Smartphone, Check, ArrowRight } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, FONT_DISPLAY, FONT_MONO } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

const SEGMENTS = [
  {
    icon: Smartphone,
    label: "Varejo Apple & Tech",
    tagline: "Especializado para lojistas e revendedores de iPhones.",
    example: "Classifica aparelhos na troca, calcula margem automática e gerencia fila de espera de clientes.",
    features: [
      "Avaliação de seminovos na base de troca",
      "Controle de estoque por modelo, cor e bateria",
      "Follow-up rápido para clientes que pediram cotação",
      "Catálogo dinâmico enviado em segundos no WhatsApp",
    ],
  },
  {
    icon: GraduationCap,
    label: "Educação & Cursos",
    tagline: "O modelo oficial utilizado pela E-EMPREENDA+.",
    example: "Inscrição interativa em etapas, rodízio entre consultores acadêmicos e fechamento de turmas.",
    features: [
      "Formulário de qualificação em 5 passos integrado",
      "Rodízio round-robin imediato entre os consultores",
      "Recuperação de alunos que pararam na etapa de pagamento",
      "Controle de matrículas, turmas e cobrança recorrente",
    ],
  },
  {
    icon: Building2,
    label: "Imobiliárias & Corretores",
    tagline: "Do primeiro interesse à chave na mão com visitas agendadas.",
    example: "Organiza lançamentos, visitas com bloqueio de agenda e cálculo de comissões por corretor.",
    features: [
      "Portfólio com link personalizado por corretor",
      "Agendamento de visitas com lembrete no WhatsApp",
      "Gestão de propostas e aprovação de crédito",
      "Contratos de locação e compra com assinatura digital",
    ],
  },
  {
    icon: Stethoscope,
    label: "Clínicas & Saúde",
    tagline: "Redução de até 70% no no-show de consultas.",
    example: "Confirmação automática de consultas e acolhimento imediato de novos pacientes.",
    features: [
      "Confirmação automática via WhatsApp com botão Sim/Não",
      "Fila de espera para encaixes de horários cancelados",
      "Histórico de procedimentos e orçamento de tratamentos",
      "Bloqueio sincronizado na agenda médica",
    ],
  },
  {
    icon: Sun,
    label: "Energia Solar & Engenharia",
    tagline: "Orçamentos técnicos rápidos e acompanhamento de projetos.",
    example: "Do recebimento da conta de luz até a instalação da usina fotovoltaica.",
    features: [
      "Recebimento de foto da fatura de energia no WhatsApp",
      "Cálculo automático da média de consumo e economia",
      "Etapas do funil: visita técnica, proposta, homologação e instalação",
      "Contratos com valor jurídico e parcelamento",
    ],
  },
  {
    icon: Briefcase,
    label: "Empresas B2B & Serviços",
    tagline: "Ciclos de venda consultivos sem perder o histórico com decisores.",
    example: "Múltiplos contatos por empresa, propostas formais e acompanhamento de SLA.",
    features: [
      "Múltiplos contatos e decisores vinculados ao mesmo CNPJ",
      "Radar de fechamento quando a proposta é aberta",
      "Controle de propostas e previsão de faturamento mensal",
      "DRE integrado com faturas e fluxo de caixa",
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl mx-auto mb-8">
        {SEGMENTS.map((s, i) => {
          const isSelected = selectedIdx === i;
          return (
            <button
              key={s.label}
              onClick={() => setSelectedIdx(i)}
              className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border text-center transition-all duration-200 ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md -translate-y-1"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <s.icon
                className={`w-5 h-5 transition-colors ${
                  isSelected ? "text-emerald-400" : "text-slate-500"
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
