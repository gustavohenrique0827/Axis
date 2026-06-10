import React from "react";
import { Card } from "../card";
import { Button } from "../button";
import { Brain, Sparkles, Send, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface SdrReportSectionProps {
  lead: any;
  reportContextOverride: 'auto' | 'normal' | 'educacao' | 'posvenda';
  setReportContextOverride: (val: 'auto' | 'normal' | 'educacao' | 'posvenda') => void;
  leadName: string;
  companyName: string;
  seller: string;
  score: number;
}

export function SdrReportSection({
  lead,
  reportContextOverride,
  setReportContextOverride,
  leadName,
  companyName,
  seller,
  score
}: SdrReportSectionProps) {
  // Auto detect context
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

  // Generic mapping from custom fields
  const getField = (key: string, fallback: string = 'Não informado') => {
    if (!lead.customFields || !Array.isArray(lead.customFields)) return fallback;
    const field = lead.customFields.find((f: any) => f.name.toLowerCase().includes(key.toLowerCase()));
    return field?.value || fallback;
  };

  const educacaoData = {
    statusTurma: getField('status turma', 'Pendente de Análise'),
    classChoice: getField('curso', 'Não selecionado'),
    presenceInaugural: getField('presença', 'Pendente'),
    onboardingGroup: getField('grupo', 'Pendente'),
    primaryAim: getField('objetivo', 'Não detalhado.'),
    playbook: getField('playbook', 'Coletar mais informações sobre o lead e engajamento nas aulas.'),
    nextStep: getField('proximo passo', 'Agendar ligação de boas vindas.'),
    template: `Olá, ${leadName}! Aqui é o consultor de admissão da Axis. Nossa IA mapeou seu interesse. Podemos conversar?`
  };

  const csData = {
    npsScore: getField('nps', 'NPS Indefinido'),
    activeUsers: getField('engajamento', 'Aguardando métricas'),
    growthPotential: getField('potencial', 'A ser avaliado.'),
    criticalObjection: getField('objeção', 'Nenhuma registrada.'),
    playbook: getField('playbook cs', 'Acompanhar adoção da plataforma.'),
    nextStep: getField('proximo passo cs', 'Agendar touchpoint.'),
    template: `Olá, ${leadName}! Como estão os resultados na ${companyName || 'sua empresa'}? Gostaríamos de marcar uma breve conversa para revisão estratégica.`
  };

  const normalData = {
    leadScore: lead.scoreIA || 0,
    cargo: getField('cargo', 'Não informado'),
    potencialComercial: getField('tamanho', 'A avaliar'),
    mainDores: getField('dores', 'Aguardando mapeamento de dores.'),
    decididorStatus: getField('decididor', 'A confirmar.'),
    playbook: getField('playbook vendas', 'Qualificar através de metodologia comercial estruturada.'),
    nextStep: getField('proximo passo vendas', 'Agendar qualificação inicial.'),
    template: `Olá, ${leadName}! Tudo bem? Gostaria de entender mais sobre os desafios da ${companyName || 'sua empresa'}. Podemos marcar uma chamada rápida?`
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="p-6 border-white/10 bg-[#0B1120]/80 space-y-6 relative overflow-hidden">
        {/* Glowing Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        {/* Report Header */}
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

          {/* Selector Context options */}
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

        {/* MODE WATERMARK BANNER */}
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
          <span className="text-[9px] font-black text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2.5 py-1 rounded-md uppercase tracking-widest shrink-0">
            Hand-off Closer Ativo
          </span>
        </div>

        {/* DYNAMIC CONTENT PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <div className="space-y-4">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#06B6D4] block border-b border-white/5 pb-1.5">Perfil & Percepção do Lead</span>
              
              {activeMode === 'educacao' ? (
                <>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Turma Pretendida:</span>
                    <span className="text-white font-bold">{educacaoData.classChoice}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Status de Matrícula:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-400">
                      {educacaoData.statusTurma}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Presença Inaugural:</span>
                    <span className="text-white font-bold">{educacaoData.presenceInaugural}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Grupo Alunos (Discord):</span>
                    <span className="text-white font-bold">{educacaoData.onboardingGroup}</span>
                  </div>
                  <div className="text-xs pt-2">
                    <span className="text-slate-500 font-semibold block mb-1">Desejo de Carreira:</span>
                    <p className="text-slate-300 italic font-medium">"{educacaoData.primaryAim}"</p>
                  </div>
                </>
              ) : activeMode === 'posvenda' ? (
                <>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Status NPS:</span>
                    <span className="text-emerald-400 font-mono font-black">{csData.npsScore}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Engajamento Usuários:</span>
                    <span className="text-white font-bold">{csData.activeUsers}</span>
                  </div>
                  <div className="text-xs pt-2">
                    <span className="text-slate-500 font-semibold block mb-1">Oportunidade de Expansão:</span>
                    <p className="text-slate-300 italic font-medium">"{csData.growthPotential}"</p>
                  </div>
                  <div className="text-xs pt-1">
                    <span className="text-slate-500 font-semibold block mb-1">Objeção Crítica Mitigada:</span>
                    <p className="text-slate-300 italic font-medium">"{csData.criticalObjection}"</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Score IA Axis:</span>
                    <span className="text-blue-400 font-mono font-black">{normalData.leadScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Cargo Contato:</span>
                    <span className="text-white font-bold">{normalData.cargo}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Potencial Estimado:</span>
                    <span className="text-emerald-400 font-bold">{normalData.potencialComercial}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Decididor Final?</span>
                    <span className="text-white font-bold">{normalData.decididorStatus}</span>
                  </div>
                  <div className="text-xs pt-2">
                    <span className="text-slate-500 font-semibold block mb-1">Principais Dores Comercial:</span>
                    <p className="text-slate-300 italic font-medium">"{normalData.mainDores}"</p>
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
                    {activeMode === 'educacao' ? educacaoData.playbook : 
                     activeMode === 'posvenda' ? csData.playbook : 
                     normalData.playbook}
                  </p>
                </div>
                
                <div>
                  <span className="text-blue-400/80 font-bold block uppercase tracking-wide text-[9px] mb-1">Próxima Ação Clave:</span>
                  <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      {activeMode === 'educacao' ? educacaoData.nextStep : 
                       activeMode === 'posvenda' ? csData.nextStep : 
                       normalData.nextStep}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ONE CLICK MENSAGEM */}
        <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#EC4899] flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-pink-400" /> Mensagem de Abordagem Sugerida (1-Click)
            </span>
            <Button
              size="sm"
              onClick={() => {
                const txt = activeMode === 'educacao' ? educacaoData.template : 
                            activeMode === 'posvenda' ? csData.template : 
                            normalData.template;
                navigator.clipboard.writeText(txt);
                toast.success("Script copiado!");
              }}
              className="bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] h-7 px-2.5 rounded-lg border border-white/10"
            >
              <Copy className="w-3 h-3 mr-1 inline animate-none" /> COPIAR SCRIPT
            </Button>
          </div>
          <p className="text-xs text-slate-300 italic font-medium leading-relaxed bg-black/25 p-3 rounded-xl border border-white/5">
            "{activeMode === 'educacao' ? educacaoData.template : 
              activeMode === 'posvenda' ? csData.template : 
              normalData.template}"
          </p>
        </div>
      </Card>
    </div>
  );
}
