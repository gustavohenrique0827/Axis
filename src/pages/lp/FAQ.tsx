import { useState } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

const FAQS = [
  {
    q: "O S.P.Y. substitui um CRM comum ou funciona em conjunto?",
    a: "O S.P.Y. substitui completamente seu CRM tradicional, ferramentas isoladas de WhatsApp, planilhas de controle e gerenciadores de tarefas. Ele centraliza em um único ambiente: CRM visual Kanban, múltiplos atendentes no mesmo WhatsApp, qualificação por IA, agenda sincronizada, geração de contratos e gestão financeira com DRE.",
  },
  {
    q: "Existe risco de ter o WhatsApp bloqueado ao usar automação?",
    a: "Não. O S.P.Y. utiliza conexão segura e arquitetura homologada (Cloud API e Evolution API) com distribuição multi-instância e regras humanas de delay e cadência. As mensagens de qualificação e follow-up soam naturais e só são enviadas para leads que iniciaram contato ou interagiram com suas campanhas, eliminando o risco de denúncias de spam.",
  },
  {
    q: "Como funciona o rodízio de leads entre a equipe comercial?",
    a: "O sistema opera com distribuição round-robin inteligente. Quando um lead é qualificado pelo formulário ou pelo WhatsApp, o sistema atribui automaticamente ao próximo vendedor ativo da fila, bloqueia o horário na agenda dele e notifica no smartphone para que o contato ou reunião aconteça de imediato.",
  },
  {
    q: "Posso utilizar minha própria chave de API da OpenAI, Gemini ou Groq?",
    a: "Sim. O sistema já vem com a inteligência Aurora nativa e configurada, mas clientes com necessidades avançadas de volume ou modelos específicos podem plugar suas próprias chaves de API do Google Gemini, OpenAI ou Groq diretamente nas configurações da empresa.",
  },
  {
    q: "Como funciona a integração com Google Calendar e Google Meet?",
    a: "Ao agendar uma visita ou reunião, o S.P.Y. sincroniza diretamente com o Google Calendar da sua conta e dos convidados selecionados. O link do Google Meet é criado automaticamente e incluído no convite, e o sistema dispara um lembrete anti-no-show para o cliente via WhatsApp 24 horas e 1 hora antes do encontro.",
  },
  {
    q: "Como a Aurora IA sabe os detalhes dos meus produtos e preços?",
    a: "Durante a implantação assistida, criamos a base de conhecimento da sua empresa com seu catálogo, tabela de preços, políticas de garantia, condições de pagamento e respostas para as principais dúvidas frequentes. A IA nunca inventa informações — ela responde estritamente de acordo com o manual da sua empresa.",
  },
  {
    q: "Posso importar meus contatos e histórico de planilhas ou outro CRM?",
    a: "Sim. O S.P.Y. possui assistente de importação via arquivos CSV/Excel e integração com webhooks. Você pode importar seus leads, clientes da carteira, tags e etapas do funil em poucos minutos sem perder nenhum histórico.",
  },
  {
    q: "Os contratos gerados com assinatura digital têm validade jurídica?",
    a: "Sim. A assinatura digital do S.P.Y. segue a legislação brasileira (MP 2.200-2/2001 e Lei 14.063/2020), registrando endereço IP, carimbo de data/hora (timestamp), dados do dispositivo e integridade do documento assinado em PDF, com plena eficácia probatória em juízo.",
  },
  {
    q: "Como funciona a implantação assistida?",
    a: "Você não fica sozinho tentando adivinhar como configurar. Nosso time de especialistas técnicos faz reuniões ao vivo com você para conectar seu WhatsApp, configurar seus funis de vendas, treinar a Aurora com os dados do seu negócio e capacitar seus vendedores.",
  },
  {
    q: "Minha equipe precisa ter conhecimento técnico para operar?",
    a: "Não. A interface foi desenhada para ser limpa, intuitiva e rápida como usar o próprio WhatsApp ou um aplicativo comum de smartphone. Vendedores aprendem a usar em menos de 30 minutos.",
  },
  {
    q: "O S.P.Y. atende grupos com mais de uma empresa ou franquia (Multi-tenant)?",
    a: "Sim. A plataforma possui arquitetura multi-tenant nativa de nível corporativo. Você pode gerenciar diferentes empresas ou filiais com bancos de dados isolados, logotipos próprios, temas independentes e permissões restritas por usuário.",
  },
  {
    q: "Existe período de fidelidade ou contrato de longo prazo?",
    a: "No plano mensal, você não possui fidelidade e pode cancelar a qualquer momento sem multas. Além disso, todos os planos contam com a nossa garantia incondicional de 14 dias: se não ficar satisfeito, devolvemos seu valor investido.",
  },
];

export function FAQSection() {
  const { theme, glow } = useLpTheme();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" className="bg-slate-50/60" glow>
      <div className="text-center mb-14">
        <Kicker>Dúvidas Comuns</Kicker>
        <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-4">
          Perguntas Frequentes.
        </SectionTitle>
        <Lede className="max-w-xl mx-auto text-base sm:text-lg">
          Tudo o que você precisa saber antes de transformar a operação comercial da sua empresa.
        </Lede>
      </div>

      <div className="max-w-3xl mx-auto space-y-3.5">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.q}
              className={`rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${
                isOpen
                  ? "shadow-md"
                  : "border-slate-200/80 shadow-2xs hover:border-slate-300"
              }`}
              style={{
                borderColor: isOpen ? theme.primary : undefined,
                boxShadow: isOpen ? `0 4px 20px -2px ${glow(0.12)}` : undefined,
              }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 sm:py-5 text-left transition-colors hover:bg-slate-50/70"
              >
                <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {f.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-slate-900" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-1">
                  <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {f.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
