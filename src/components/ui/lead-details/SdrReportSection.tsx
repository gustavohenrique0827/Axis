import React, { useState } from "react";
import { Card } from "../card";
import { Button } from "../button";
import { Brain, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

interface SdrReportSectionProps {
  lead: any;
}

export function SdrReportSection({ lead }: SdrReportSectionProps) {
  const [reportContextOverride, setReportContextOverride] = useState<'auto' | 'normal' | 'educacao' | 'posvenda'>('auto');

  const computedIsEdu = lead.company?.toLowerCase().includes("turma") || 
                        lead.company?.toLowerCase().includes("curso") || 
                        lead.company?.toLowerCase().includes("escola") || 
                        lead.company?.toLowerCase().includes("inscrição") || 
                        lead.company?.toLowerCase().includes("graduação") || 
                        lead.company?.toLowerCase().includes("educação") || 
                        lead.name?.toLowerCase().includes("educação") || 
                        (lead.id === 'sdr1' || lead.id === 'sdr2') || false;

  const computedIsCS = lead.company?.toLowerCase().includes("licença") || 
                      lead.company?.toLowerCase().includes("saas") || 
                      lead.company?.toLowerCase().includes("contrato") || 
                      lead.name?.toLowerCase().includes("suporte") || false;

  const activeMode = reportContextOverride === 'auto' 
    ? (computedIsEdu ? 'educacao' : computedIsCS ? 'posvenda' : 'normal')
    : reportContextOverride;

  const mockEducacao = {
    statusTurma: lead.id === 'sdr1' ? "CONFIRMADO NA TURMA" : "PENDENTE DE MATRÍCULA",
    classChoice: lead.id === 'sdr1' ? "Engenharia de Software (Sábado - Integração)" : "MBA Gestão Escolar (On-line EAD)",
    presenceInaugural: lead.id === 'sdr1' ? "Sim - Confirmou que participará" : "Pendente - Falta responder WhatsApp",
    onboardingGroup: lead.id === 'sdr1' ? "Sim - Adicionado no Discord" : "Não - Link enviado por WhatsApp",
    primaryAim: "Elevação profissional para assumir cargo de Staff Engineer ou Coordenador de Projetos.",
    blockersSolved: "Medo de não conciliar com o trabalho solucionado explicando acesso assíncrono.",
    playbook: "Destacar urgência! Ficam poucas vagas remanescentes para manter os bônus corporativos. Focar na mentoria ao vivo de networking.",
    nextStep: "Confirmar escolha definitiva do horário do laboratório prático por WhatsApp.",
    template: `Olá, ${lead.name}! Aqui é o consultor de admissão da Axis. Nossa IA mapeou que você já confirmou presença para a aula magna da turma de ${lead.id === 'sdr1' ? 'Engenharia de Software' : 'Gestão Escolar MBA'}. Vamos finalizar sua reserva oficial de vaga e liberar suas credenciais de acesso ao portal para você já iniciar suas aulas amanhã?`
  };

  const mockCS = {
    npsScore: lead.id === 'sdr1' ? "NPS 10/10 (Promotor)" : "NPS 7/10 (Morno)",
    activeUsers: lead.id === 'sdr1' ? "85% (Forte engajamento)" : "42% (Uso instável)",
    growthPotential: "Excelente. Cliente em fase de expansão de time comercial com abertura para 5 novas licenças.",
    criticalObjection: "Dúvidas no setup inicial com APIs de terceiros. Resolvido com consultoria express de 15 minutos.",
    playbook: "Parabenizar o cliente pelos ótimos KPIs com agentes inteligentes nos últimos 30 dias e oferecer o Upgrade para plano anual com 20% desc.",
    nextStep: "Agendar videochamada de alinhamento estratégico de CS de 15 minutos.",
    template: `Olá, ${lead.name}! Como estão os resultados comerciais aí na ${lead.company || 'sua empresa'}? Vi que seu time acelerou o SDR IA de forma incrível essa semana. Gostaríamos de marcar uma breve conversa de 15 minutos para fazer uma revisão estratégica de CS e apresentar novas automações exclusivas liberadas no seu plano. Qual o melhor horário amanhã?`
  };

  const mockNormal = {
    leadScore: lead.scoreIA || 85,
    cargo: "Diretor Comercial / Head de Operações",
    potencialComercial: "R$ 15.000 (Consultoria Enterprise + Licenças)",
    mainDores: "Baixo retorno em outbound, tempo de resposta a inbound lento (> 3 horas), vendedores perdidos em planilhas.",
    decididorStatus: "Sim, contato direto é o principal tomador de decisão técnica.",
    playbook: "Focar em ROI, automação de SLA de 5 minutos, e redução de churn de leads inativos. Demonstrar o painel SDR operando em tempo real.",
    nextStep: "Apresentar demonstração prática e enviar proposta de contratação de licenças.",
    template: `Olá, ${lead.name}! Tudo bem? Nossa IA inteligente de qualificação realizou a triagem na ${lead.company || 'sua empresa'} e identificou que vocês têm o fit exato para reduzir o tempo de primeiro contato a inbound de horas para minutos. Podemos marcar uma chamada rápida amanhã às 14h para apresentar a estrutura rodando com seus dados?`
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="p-6 border-white/10 bg-[#0B1120]/80 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                Relatório Master SDR IA
              </h4>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5">MIA-6 Algorítmico Axis Engine</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center gap-1 self-start sm:self-auto">
            <span className="text-[9px] font-black uppercase text-slate-500 px-2 tracking-wider">Filtro Pipeline:</span>
            {[
              { id: 'auto', label: '🤖 Auto' },
              { id: 'normal', label: '🌐 Sales' },
              { id: 'educacao', label: '🎓 Edu' },
              { id: 'posvenda', label: '🔄 CS' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setReportContextOverride(m.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  activeMode === m.id || (m.id === 'auto' && reportContextOverride === 'auto')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl relative z-10 select-none">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <div className="text-xs truncate">
              <span className="text-slate-400 font-bold">Foco do Pipeline: </span>
              <span className="text-white font-black uppercase font-mono tracking-widest">
                {activeMode === 'educacao' ? '🎓 SDR Inteligente de Educação' : 
                  activeMode === 'posvenda' ? '🔄 SDR Pós-Venda (CS & Onboarding)' : 
                  '🌐 SDR Comercial Padrão (Corporate)'}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-black text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2.5 py-1 rounded-md uppercase tracking-widest font-mono shrink-0">
            Hand-off Closer Ativo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <div className="space-y-4">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#06B6D4] block border-b border-white/5 pb-1.5">Perfil & Percepção do Lead</span>
              
              {activeMode === 'educacao' ? (
                <>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Turma Pretendida:</span>
                    <span className="text-white font-bold">{mockEducacao.classChoice}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Confirmou que vai na turma?</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${lead.id === 'sdr1' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {mockEducacao.statusTurma}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Presença Inaugural:</span>
                    <span className="text-white font-bold">{mockEducacao.presenceInaugural}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Grupo Alunos (Discord):</span>
                    <span className="text-white font-bold">{mockEducacao.onboardingGroup}</span>
                  </div>
                  <div className="text-xs pt-2">
                    <span className="text-slate-500 font-semibold block mb-1">Desejo de Carreira:</span>
                    <p className="text-slate-300 italic font-medium">"{mockEducacao.primaryAim}"</p>
                  </div>
                </>
              ) : activeMode === 'posvenda' ? (
                <>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Status NPS:</span>
                    <span className="text-emerald-400 font-mono font-black">{mockCS.npsScore}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Engajamento Usuários:</span>
                    <span className="text-white font-bold">{mockCS.activeUsers}</span>
                  </div>
                  <div className="text-xs pt-2">
                    <span className="text-slate-500 font-semibold block mb-1">Oportunidade de Expansão:</span>
                    <p className="text-slate-300 italic font-medium">"{mockCS.growthPotential}"</p>
                  </div>
                  <div className="text-xs pt-1">
                    <span className="text-slate-500 font-semibold block mb-1">Objeção Crítica Mitigada:</span>
                    <p className="text-slate-300 italic font-medium">"{mockCS.criticalObjection}"</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Score IA Axis:</span>
                    <span className="text-blue-400 font-mono font-black">{mockNormal.leadScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Cargo Contato:</span>
                    <span className="text-white font-bold">{mockNormal.cargo}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Potencial Estimado:</span>
                    <span className="text-emerald-400 font-bold">{mockNormal.potencialComercial}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Decididor Final?</span>
                    <span className="text-white font-bold">{mockNormal.decididorStatus}</span>
                  </div>
                  <div className="text-xs pt-2">
                    <span className="text-slate-500 font-semibold block mb-1">Principais Dores Comercial:</span>
                    <p className="text-slate-300 italic font-medium">"{mockNormal.mainDores}"</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl space-y-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block border-b border-blue-500/10 pb-1.5 font-sans">Estratégia e Playbook de Fechamento</span>
              <div className="text-xs space-y-3">
                <div>
                  <span className="text-blue-400/80 font-bold block uppercase tracking-wide text-[9px] mb-1">Playbook do Closer:</span>
                  <p className="text-slate-200 leading-relaxed font-semibold">
                    {activeMode === 'educacao' ? mockEducacao.playbook : 
                      activeMode === 'posvenda' ? mockCS.playbook : 
                      mockNormal.playbook}
                  </p>
                </div>
                <div>
                  <span className="text-blue-400/80 font-bold block uppercase tracking-wide text-[9px] mb-1">Próxima Ação Clave:</span>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      {activeMode === 'educacao' ? mockEducacao.nextStep : 
                        activeMode === 'posvenda' ? mockCS.nextStep : 
                        mockNormal.nextStep}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#EC4899] flex items-center gap-1.5">
              Mensagem de Abordagem Sugerida (1-Click)
            </span>
            <Button
              size="sm"
              onClick={() => {
                const txt = activeMode === 'educacao' ? mockEducacao.template : 
                            activeMode === 'posvenda' ? mockCS.template : 
                            mockNormal.template;
                navigator.clipboard.writeText(txt);
                toast.success("Mensagem copiada para a área de transferência!");
              }}
              className="bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] h-7 px-2.5 rounded-lg border border-white/10"
            >
              <Copy className="w-3 h-3 mr-1 inline" /> COPIAR SCRIPT
            </Button>
          </div>
          <p className="text-xs text-slate-300 italic font-medium leading-relaxed bg-black/25 p-3 rounded-xl border border-white/5">
            "{activeMode === 'educacao' ? mockEducacao.template : 
              activeMode === 'posvenda' ? mockCS.template : 
              mockNormal.template}"
          </p>
        </div>
      </Card>
    </div>
  );
}
