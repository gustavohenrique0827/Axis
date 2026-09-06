import { useState } from "react";
import {
  Database, Headset, LayoutDashboard, Sparkles, Workflow,
  FileCheck, Calendar, Globe, CheckCircle2, ArrowRight, Shield
} from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, FadeIn, ThemedCTAButton, FONT_DISPLAY, FONT_MONO } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

interface Module {
  icon: typeof Database;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  highlights: string[];
  capabilities: { title: string; desc: string }[];
}

const MODULES: Module[] = [
  {
    icon: Database,
    name: "CRM & Pipeline",
    badge: "Visão 360°",
    tagline: "Pipeline visual com múltiplos funis e automação.",
    description: "Esqueça cadastros manuais e leads esquecidos. Cada oportunidade carrega histórico completo, transcrição de áudios e próxima ação sugerida pela Aurora IA.",
    highlights: ["Múltiplos funis de vendas", "Campos customizados ilimitados", "Histórico cronológico de WhatsApp e e-mails"],
    capabilities: [
      { title: "Kanban Interativo", desc: "Arraste cards entre etapas com gatilhos que disparam mensagens automáticas e atualizam status." },
      { title: "Lead Scoring", desc: "A IA pontua o lead conforme o engajamento, ticket e probabilidade de fechamento." },
      { title: "Filtros Avançados", desc: "Segmente por vendedor, tag, canal de entrada, valor de proposta e data da última interação." },
    ],
  },
  {
    icon: Headset,
    name: "SDR & WhatsApp IA",
    badge: "24/7 Sem Fila",
    tagline: "Atendimento imediato e qualificação autônoma no WhatsApp.",
    description: "Seu lead é respondido em menos de 20 segundos a qualquer hora do dia ou da noite. A IA tira dúvidas, qualifica o perfil e entrega o lead pronto para o closer.",
    highlights: ["Atendimento humano + IA", "Transcrição automática de áudios", "Rodízio round-robin entre vendedores"],
    capabilities: [
      { title: "Qualificação em Etapas", desc: "Faz perguntas estratégicas (orçamento, interesse, urgência) antes de direcionar para um humano." },
      { title: "Multi-atendentes", desc: "Toda a sua equipe comercial atende no mesmo número oficial do WhatsApp sem conflitos." },
      { title: "Recuperação de Oportunidades", desc: "Detecta clientes que sumiram da conversa e reengaja no momento propício com mensagens naturais." },
    ],
  },
  {
    icon: Sparkles,
    name: "Aurora IA & Radar",
    badge: "Inteligência Preditiva",
    tagline: "O cérebro que escuta conversas e aponta onde está o dinheiro.",
    description: "A Aurora não é apenas um chatbot genérico. Ela analisa o contexto de cada conversa em tempo real, identifica objeções, sentimento e sinaliza quando um lead está pronto para assinar.",
    highlights: ["Alerta de risco de perda", "Próxima melhor ação sugerida", "Respostas com base no histórico do cliente"],
    capabilities: [
      { title: "Radar de Fechamento", desc: "Avisa o gestor no exato instante em que um cliente pediu dados para pagamento ou aceitou proposta." },
      { title: "Análise de Objeções", desc: "Detecta se o cliente achou caro, precisa de parcelamento ou quer aprovar com sócio e sugere o argumento certo." },
      { title: "Resumos Executivos", desc: "Gera resumos de conversas longas de 50 mensagens em 3 tópicos claros para o vendedor economizar tempo." },
    ],
  },
  {
    icon: Calendar,
    name: "Agenda & Google Meet",
    badge: "Zero No-show",
    tagline: "Agendamento inteligente com bloqueio de calendário sincronizado.",
    description: "Agende reuniões e visitas presenciais sem trocar de tela. Bloqueia a agenda dos convidados no Google Calendar, gera link de videoconferência e envia lembrete no WhatsApp.",
    highlights: ["Integração Google Calendar", "Links Google Meet automáticos", "Lembretes no WhatsApp com 24h e 1h de antecedência"],
    capabilities: [
      { title: "Bloqueio Compartilhado", desc: "Vincule membros da equipe e parceiros à mesma tarefa/reunião bloqueando na agenda de todos." },
      { title: "Lembretes Anti-falta", desc: "Reduz o no-show em até 70% enviando confirmação pelo WhatsApp com botão de confirmação." },
      { title: "Histórico no CRM", desc: "O compromisso fica gravado na linha do tempo do cliente com o link da reunião." },
    ],
  },
  {
    icon: FileCheck,
    name: "Contratos & Propostas",
    badge: "Fechamento Rápido",
    tagline: "Geração de propostas e contratos em PDF em 1 clique.",
    description: "Elimine a demora burocrática no momento mais crítico da venda. Preencha os dados do cliente automaticamente no modelo oficial e envie pronto pra assinatura.",
    highlights: ["Geração instantânea em PDF", "Envio direto no WhatsApp do cliente", "Assinatura eletrônica com validade jurídica (roadmap)"],
    capabilities: [
      { title: "Modelos Customizáveis", desc: "Templates pré-formatados para vendas de produtos, prestações de serviços e matrículas." },
      { title: "Assinatura Eletrônica", desc: "Cliente assina na tela do smartphone com registro de IP, data e hora com valor probatório." },
      { title: "Disparo Financeiro", desc: "Ao assinar o contrato, o sistema já provisiona a fatura e o lançamento no módulo financeiro." },
    ],
  },
  {
    icon: LayoutDashboard,
    name: "Gestão Financeira",
    badge: "DRE & Comissões",
    tagline: "Contas a pagar, receber, fluxo de caixa e comissão por vendedor.",
    description: "O financeiro conectado diretamente às vendas. Veja o faturamento real, custos da operação, DRE em tempo real e cálculo automático de comissões por vendedor e squad.",
    highlights: ["DRE gerencial em tempo real", "Contas a pagar e receber", "Cálculo automático de comissões"],
    capabilities: [
      { title: "Comissão Automatizada", desc: "Regras por vendedor, meta batida e split entre SDR e Closer calculados sem planilha manual." },
      { title: "Previsibilidade de Caixa", desc: "Gráficos de recebimentos futuros com base nas parcelas de contratos fechados." },
      { title: "Categorias Personalizadas", desc: "Classificação por centro de custo, unidades e linhas de produto." },
    ],
  },
  {
    icon: Globe,
    name: "Landing Pages & Forms",
    badge: "Captação Ativa",
    tagline: "Formulários interativos em etapas e landing pages integradas.",
    description: "Crie formulários de alta conversão (como a inscrição da E-EMPREENDA+) com rastreamento de pixels (Meta, Google Ads), rodízio automático de SDRs e entrada direta de leads no CRM.",
    highlights: ["Formulários em etapas interativas", "Rastreamento com Meta Pixel & GTag", "Distribuição round-robin de leads"],
    capabilities: [
      { title: "Editor de Perguntas", desc: "Personalize os 5 passos de qualificação para filtrar quem realmente tem poder de compra." },
      { title: "Atribuição de Campanhas", desc: "Saiba exatamente qual anúncio gerou a venda no final do funil via parâmetros UTM e tags." },
      { title: "Preview em Tempo Real", desc: "Acompanhe a página funcionando dentro do painel com métricas de conversão e taxa de cliques." },
    ],
  },
  {
    icon: Shield,
    name: "Multi-tenant & White-label",
    badge: "Corporativo",
    tagline: "Gestão de múltiplas empresas, filiais e marcas no mesmo sistema.",
    description: "Ideal para grupos empresariais, agências e redes de franquias. Cada tenant possui seu próprio ambiente isolado com personalização de cores, logotipo, tema e permissões.",
    highlights: ["Isolamento completo de dados", "Personalização de cor primária e tema", "Níveis de permissão (Admin, Gestor, Vendedor)"],
    capabilities: [
      { title: "Login Customizado", desc: "A tela de login e o Favicon adaptam-se à identidade visual da empresa de forma silenciosa e segura." },
      { title: "Gestão de Equipe", desc: "Defina quem pode ver quais leads, aprovar descontos ou acessar dados financeiros." },
      { title: "Logs de Auditoria", desc: "Rastreie quem editou status, exportou relatórios ou alterou valores de propostas." },
    ],
  },
];

export function FuncionalidadesSection() {
  const { theme, glow } = useLpTheme();
  const [active, setActive] = useState(0);
  const mod = MODULES[active];

  return (
    <Section id="funcionalidades" className="bg-slate-50/70" glow>
      <div className="text-center mb-14">
        <Kicker>Ecossistema Modular Completo</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-4">
          Tudo o que a sua operação precisa, em um único painel.
        </SectionTitle>
        <Lede className="max-w-2xl mx-auto text-base sm:text-lg">
          Pare de pagar 6 assinaturas separadas para CRM, WhatsApp, agenda, financeiro e automações.
          O S.P.Y. integra cada ponta da sua empresa em uma única ferramenta.
        </Lede>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,290px)_1fr] gap-6 max-w-5xl mx-auto">
        {/* Lista de Módulos (Botões Laterais) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2">
          {MODULES.map((m, i) => {
            const isSelected = active === i;
            return (
              <button
                key={m.name}
                onClick={() => setActive(i)}
                style={
                  isSelected
                    ? { background: theme.primary, color: "#0F172A", borderColor: theme.primary }
                    : undefined
                }
                className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 border ${
                  isSelected
                    ? "shadow-md"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <m.icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isSelected ? "text-slate-900" : "text-slate-500"
                    }`}
                  />
                  <span className="text-[13px] font-bold truncate" style={{ fontFamily: FONT_DISPLAY }}>
                    {m.name}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 hidden sm:inline-block ${
                    isSelected
                      ? "bg-black/10 text-slate-900 border border-black/10"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {m.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detalhe do Módulo Selecionado */}
        <FadeIn key={active}>
          <div className="h-full p-7 sm:p-9 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-500"
                    style={{
                      background: glow(0.12),
                      color: theme.primaryDark,
                      border: `1px solid ${glow(0.25)}`,
                    }}
                  >
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900" style={{ fontFamily: FONT_DISPLAY }}>
                      {mod.name}
                    </h3>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {mod.badge}
                    </span>
                  </div>
                </div>

                <div
                  className="px-3 py-1 rounded-full text-[11px] font-bold border"
                  style={{
                    background: glow(0.08),
                    color: theme.primaryDark,
                    borderColor: glow(0.2),
                  }}
                >
                  {mod.tagline}
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {mod.description}
              </p>

              {/* Destaques rápidos */}
              <div className="flex flex-wrap gap-2 mb-8">
                {mod.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: theme.primaryDark }} />
                    {h}
                  </span>
                ))}
              </div>

              {/* 3 Capacidades detalhadas */}
              <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                {mod.capabilities.map((c) => (
                  <div key={c.title} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                    <h5 className="text-xs font-bold text-slate-900 mb-1" style={{ fontFamily: FONT_DISPLAY }}>
                      {c.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
