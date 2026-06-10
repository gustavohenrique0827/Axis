import { useState } from 'react';
import {
  X, Brain, Loader2, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, TrendingDown, Minus, MessageSquare, Target,
  ShieldAlert, Zap, ClipboardList, Phone, Send, ChevronDown,
  ChevronUp, DollarSign, Clock, Users, BarChart3,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  analyzeCall,
  type RevenueAnalysis,
  type PromptData,
  type AIProvider,
} from '../../../lib/revenueIntelligence';
import { toast } from 'sonner';
import { useData } from '../../../contexts/DataContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  if (status === 'confirmed' || status === 'accepted')
    return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
  if (status === 'negative')
    return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
  if (status === 'partial')
    return <Minus className="w-4 h-4 text-amber-400 shrink-0" />;
  return <Minus className="w-4 h-4 text-slate-500 shrink-0" />;
}

function ScoreBar({ value, max = 100, color = 'blue' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500', emerald: 'bg-emerald-500',
    amber: 'bg-amber-500', rose: 'bg-rose-500', indigo: 'bg-indigo-500',
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${colorMap[color] ?? 'bg-blue-500'} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-black text-slate-300 w-8 text-right">{value}</span>
    </div>
  );
}

function RiskBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const map = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse',
  };
  const labels = { low: 'Baixo', medium: 'Médio', high: 'Alto' };
  return (
    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${map[level]}`}>
      {labels[level]}
    </span>
  );
}

function IntensityBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const map = {
    low: 'text-slate-400 bg-white/5 border-white/5',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    high: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };
  const labels = { low: 'Fraco', medium: 'Médio', high: 'Forte' };
  return (
    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${map[level]}`}>
      {labels[level]}
    </span>
  );
}

function SectionCard({ title, icon: Icon, children, className = '' }: {
  title: string; icon: any; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-[#0B1120] border border-white/5 rounded-2xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5 text-blue-400" />
        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  lead: any;
  stageName: string;
  pipelineName: string;
  onClose: () => void;
  embedded?: boolean;
}

export function RevenueIntelligenceModal({ lead, stageName, pipelineName, onClose, embedded = false }: Props) {
  const { addTask } = useData();

  const [transcript, setTranscript] = useState('');
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [productName, setProductName] = useState('');
  const [officialPrice, setOfficialPrice] = useState('');
  const [enrollmentFee, setEnrollmentFee] = useState('');
  const [installments, setInstallments] = useState('');
  const [commercialRules, setCommercialRules] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RevenueAnalysis | null>(null);
  const [showWhatsapp, setShowWhatsapp] = useState(false);

  const hasKeys =
    (provider === 'gemini' && !!import.meta.env.VITE_GEMINI_API_KEY) ||
    (provider === 'groq' && !!import.meta.env.VITE_GROQ_API_KEY);

  async function handleAnalyze() {
    if (!transcript.trim()) {
      toast.error('Cole a transcrição da ligação antes de analisar.');
      return;
    }
    if (!hasKeys) {
      toast.error(`Configure VITE_${provider.toUpperCase()}_API_KEY no arquivo .env`);
      return;
    }

    setLoading(true);
    try {
      const data: PromptData = {
        today: new Date().toLocaleDateString('pt-BR'),
        tenantName: lead.tenantName ?? 'AXIS',
        clientName: lead.tenantName ?? 'AXIS',
        pipelineName,
        stageName,
        leadName: lead.name,
        companyName: lead.company,
        sellerName: lead.seller ?? 'Não atribuído',
        productName: productName || 'Não informado',
        officialPrice: officialPrice || lead.value || 'Não informado',
        enrollmentFee: enrollmentFee || 'Não informado',
        installments: installments || 'Não informado',
        commercialRules: commercialRules || 'Nenhuma regra específica',
        crmNotes: lead.iaSummary ?? 'Sem notas',
        history: 'Veja histórico no CRM',
        transcript,
      };
      const analysis = await analyzeCall(data, provider);
      setResult(analysis);
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao analisar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleCreateTask() {
    if (!result?.task) return;
    addTask({
      title: result.task.title,
      type: 'Acompanhamento (Follow-up)',
      priority: 'Alta',
      date: `${result.task.date} ${result.task.time}`.trim(),
      related: lead.name,
      status: 'Em Aberto',
      seller: lead.seller ?? '',
      relatedProductIds: [],
      tags: ['revenue-ia'],
      description: result.task.description,
    } as any);
    toast.success('Tarefa criada com sucesso!');
  }

  function handleCopyWhatsapp() {
    if (!result?.whatsappFollowUp) return;
    navigator.clipboard.writeText(result.whatsappFollowUp);
    toast.success('Mensagem copiada!');
  }

  const probColor =
    !result ? 'text-slate-400'
    : result.closingProbability >= 70 ? 'text-emerald-400'
    : result.closingProbability >= 40 ? 'text-amber-400'
    : 'text-rose-400';

  const body = (
        <div className={embedded ? undefined : 'flex-1 overflow-y-auto'}>
          {!result ? (
            /* ── Input Form ── */
            <div className="p-6 space-y-5">
              {/* Provider selector */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Modelo IA:</span>
                <div className="flex gap-1 bg-[#0B1120] border border-white/5 rounded-xl p-1">
                  {(['gemini', 'groq'] as AIProvider[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setProvider(p)}
                      className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                        provider === p ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      {p === 'gemini' ? 'Google Gemini' : 'Groq (Llama)'}
                    </button>
                  ))}
                </div>
                {!hasKeys && (
                  <span className="text-[9px] text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    VITE_{provider.toUpperCase()}_API_KEY não encontrada
                  </span>
                )}
              </div>

              {/* CRM data row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Produto</label>
                  <input
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder="Ex: Mentoria Premium"
                    className="w-full bg-[#0B1120] border border-white/5 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500/40 placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Valor Oficial</label>
                  <input
                    value={officialPrice}
                    onChange={e => setOfficialPrice(e.target.value)}
                    placeholder={lead.value || 'Ex: R$ 3.000'}
                    className="w-full bg-[#0B1120] border border-white/5 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500/40 placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Taxa de Matrícula</label>
                  <input
                    value={enrollmentFee}
                    onChange={e => setEnrollmentFee(e.target.value)}
                    placeholder="Ex: R$ 500"
                    className="w-full bg-[#0B1120] border border-white/5 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500/40 placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Parcelamento</label>
                  <input
                    value={installments}
                    onChange={e => setInstallments(e.target.value)}
                    placeholder="Ex: 12x R$ 250"
                    className="w-full bg-[#0B1120] border border-white/5 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500/40 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Regras Comerciais (opcional)</label>
                <input
                  value={commercialRules}
                  onChange={e => setCommercialRules(e.target.value)}
                  placeholder="Ex: Desconto máx 10%, não negociar matrícula"
                  className="w-full bg-[#0B1120] border border-white/5 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500/40 placeholder:text-slate-600"
                />
              </div>

              {/* Transcript */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Transcrição da Ligação <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder="Cole aqui a transcrição completa da ligação, reunião ou mensagens de WhatsApp..."
                  rows={10}
                  className="w-full bg-[#0B1120] border border-white/5 text-xs text-white rounded-xl px-3 py-3 focus:outline-none focus:border-blue-500/40 resize-none placeholder:text-slate-600 font-mono leading-relaxed"
                />
                <p className="text-[9px] text-slate-600">{transcript.length} caracteres</p>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading || !transcript.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-xs font-black uppercase tracking-widest gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analisando com IA...</>
                ) : (
                  <><Brain className="w-4 h-4" /> Analisar Ligação</>
                )}
              </Button>
            </div>
          ) : (
            /* ── Results ── */
            <div className="p-6 space-y-4">
              {/* Top bar: closing probability + temperature + action */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Prob. Fechamento</p>
                  <p className={`text-3xl font-black ${probColor}`}>{result.closingProbability}%</p>
                </div>
                <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Temperatura</p>
                  <p className={`text-xl font-black uppercase ${
                    result.temperature === 'quente' ? 'text-rose-400'
                    : result.temperature === 'morno' ? 'text-amber-400'
                    : 'text-blue-400'
                  }`}>{result.temperature}</p>
                </div>
                <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">Score BANT</p>
                  <p className="text-3xl font-black text-white">{result.bantScore}<span className="text-sm text-slate-500">/8</span></p>
                </div>
              </div>

              {/* Urgent alerts */}
              {result.urgentAlerts.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Alertas Urgentes</span>
                  </div>
                  {result.urgentAlerts.map((a, i) => (
                    <p key={i} className="text-xs text-rose-300 flex items-start gap-2">
                      <span className="text-rose-500 shrink-0 mt-0.5">▸</span>{a}
                    </p>
                  ))}
                </div>
              )}

              {/* Executive summary */}
              <SectionCard title="Resumo Executivo" icon={BarChart3}>
                <p className="text-xs text-slate-300 leading-relaxed">{result.executiveSummary}</p>
                {result.managerInsights.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {result.managerInsights.map((ins, i) => (
                      <p key={i} className="text-[10px] text-slate-400 flex items-start gap-2">
                        <span className="text-blue-400 shrink-0">•</span>{ins}
                      </p>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* BANT */}
              <SectionCard title="Análise BANT" icon={Target}>
                <div className="space-y-3">
                  {(
                    [
                      { key: 'budget', label: 'Budget (Orçamento)', icon: DollarSign },
                      { key: 'authority', label: 'Authority (Autoridade)', icon: Users },
                      { key: 'need', label: 'Need (Necessidade)', icon: Zap },
                      { key: 'timeline', label: 'Timeline (Prazo)', icon: Clock },
                    ] as const
                  ).map(({ key, label, icon: Icon }) => {
                    const item = result.bant[key];
                    return (
                      <div key={key} className="bg-white/[0.02] rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-500 font-bold">{item.score}/2</span>
                            <StatusDot status={item.status} />
                          </div>
                        </div>
                        {item.evidence && item.evidence !== 'Não mencionado' && (
                          <p className="text-[10px] text-slate-400 italic border-l-2 border-blue-500/30 pl-2">"{item.evidence}"</p>
                        )}
                        {item.evidence === 'Não mencionado' && (
                          <p className="text-[10px] text-slate-600">Não mencionado na transcrição</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              {/* Call analysis + Playbook side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SectionCard title="Qualidade da Ligação" icon={Phone}>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Nota Geral</span>
                      <span className={`text-lg font-black ${result.callAnalysis.score >= 70 ? 'text-emerald-400' : result.callAnalysis.score >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {result.callAnalysis.score}/100
                      </span>
                    </div>
                    {[
                      { label: 'Rapport', val: result.callAnalysis.rapport },
                      { label: 'Descoberta', val: result.callAnalysis.needDiscovery },
                      { label: 'Investigação', val: result.callAnalysis.investigation },
                      { label: 'Clareza', val: result.callAnalysis.presentationClarity },
                      { label: 'Objeções', val: result.callAnalysis.objectionHandling },
                      { label: 'Fechamento', val: result.callAnalysis.closing },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{label}</span>
                        <ScoreBar value={val} color={val >= 70 ? 'emerald' : val >= 40 ? 'amber' : 'rose'} />
                      </div>
                    ))}
                  </div>
                  {result.callAnalysis.strengths.length > 0 && (
                    <div className="space-y-1 mt-3">
                      <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Pontos Fortes</p>
                      {result.callAnalysis.strengths.map((s, i) => (
                        <p key={i} className="text-[10px] text-slate-400 flex gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />{s}
                        </p>
                      ))}
                    </div>
                  )}
                  {result.callAnalysis.weaknesses.length > 0 && (
                    <div className="space-y-1 mt-3">
                      <p className="text-[9px] font-black text-rose-400 uppercase tracking-wider">Pontos de Melhoria</p>
                      {result.callAnalysis.weaknesses.map((w, i) => (
                        <p key={i} className="text-[10px] text-slate-400 flex gap-1.5">
                          <TrendingDown className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />{w}
                        </p>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="Aderência ao Playbook" icon={ClipboardList}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Aderência</span>
                    <span className={`text-2xl font-black ${result.playbookAnalysis.adherencePercent >= 70 ? 'text-emerald-400' : result.playbookAnalysis.adherencePercent >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {result.playbookAnalysis.adherencePercent}%
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {result.playbookAnalysis.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {step.done
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        }
                        <span className={`text-[10px] font-medium ${step.done ? 'text-slate-300' : 'text-slate-600'}`}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>

              {/* Commercial validation */}
              {result.commercialValidation.priceAlert && (
                <SectionCard title="Alerta Comercial" icon={ShieldAlert} className="border-amber-500/20 bg-amber-500/5">
                  <div className="space-y-2">
                    {result.commercialValidation.issues.map((issue, i) => (
                      <p key={i} className="text-xs text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />{issue}
                      </p>
                    ))}
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {result.commercialValidation.mentionedPrice && (
                        <div className="bg-white/5 rounded-xl p-2">
                          <p className="text-[9px] text-slate-500 uppercase font-black">Falado na ligação</p>
                          <p className="text-xs text-white font-bold">{result.commercialValidation.mentionedPrice}</p>
                        </div>
                      )}
                      {result.commercialValidation.officialPrice && (
                        <div className="bg-white/5 rounded-xl p-2">
                          <p className="text-[9px] text-slate-500 uppercase font-black">Valor Oficial CRM</p>
                          <p className="text-xs text-emerald-400 font-bold">{result.commercialValidation.officialPrice}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* Objections + Buying signals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.objections.length > 0 && (
                  <SectionCard title={`Objeções (${result.objections.length})`} icon={XCircle}>
                    <div className="space-y-2">
                      {result.objections.map((obj, i) => (
                        <div key={i} className="bg-white/[0.02] rounded-xl p-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-rose-400 uppercase">{obj.category}</span>
                            {obj.handled
                              ? <span className="text-[9px] text-emerald-400 font-bold">✓ Tratada</span>
                              : <span className="text-[9px] text-rose-400 font-bold">⚠ Não tratada</span>
                            }
                          </div>
                          <p className="text-[10px] text-slate-300">"{obj.text}"</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {result.buyingSignals.length > 0 && (
                  <SectionCard title={`Sinais de Compra (${result.buyingSignals.length})`} icon={TrendingUp}>
                    <div className="space-y-2">
                      {result.buyingSignals.map((sig, i) => (
                        <div key={i} className="bg-white/[0.02] rounded-xl p-2.5 space-y-1">
                          <IntensityBadge level={sig.intensity} />
                          <p className="text-[10px] text-slate-300">"{sig.text}"</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}
              </div>

              {/* Risk + Next action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SectionCard title="Risco de Perda" icon={ShieldAlert}>
                  <div className="flex items-center gap-3 mb-2">
                    <RiskBadge level={result.lossRisk.level} />
                  </div>
                  <p className="text-xs text-slate-400">{result.lossRisk.reason}</p>
                </SectionCard>

                <SectionCard title="Próxima Melhor Ação" icon={Zap} className="border-blue-500/10 bg-blue-500/5">
                  <p className="text-sm font-bold text-white">{result.nextBestAction}</p>
                </SectionCard>
              </div>

              {/* Task auto */}
              {result.task && (
                <SectionCard title="Tarefa Detectada" icon={ClipboardList}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">{result.task.title}</p>
                      <p className="text-[10px] text-slate-400">{result.task.date} {result.task.time}</p>
                      <p className="text-[10px] text-slate-500">{result.task.description}</p>
                    </div>
                    <Button
                      onClick={handleCreateTask}
                      className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-wider"
                    >
                      Criar Tarefa
                    </Button>
                  </div>
                </SectionCard>
              )}

              {/* WhatsApp follow-up */}
              <SectionCard title="Follow-up WhatsApp" icon={MessageSquare}>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowWhatsapp(v => !v)}
                    className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-white bg-transparent border-none cursor-pointer p-0 transition-colors"
                  >
                    {showWhatsapp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showWhatsapp ? 'Ocultar mensagem' : 'Ver mensagem sugerida'}
                  </button>
                  {showWhatsapp && (
                    <div className="bg-[#075e54]/10 border border-[#25d366]/20 rounded-xl p-3">
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-mono">
                        {result.whatsappFollowUp}
                      </p>
                      <Button
                        onClick={handleCopyWhatsapp}
                        className="mt-3 bg-[#25d366] hover:bg-[#1da851] text-white rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-wider gap-1.5"
                      >
                        <Send className="w-3 h-3" /> Copiar Mensagem
                      </Button>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Reset button */}
              <button
                onClick={() => setResult(null)}
                className="w-full py-2 text-[10px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-wider border border-dashed border-white/5 hover:border-white/10 rounded-xl transition-all bg-transparent cursor-pointer"
              >
                ← Nova Análise
              </button>
            </div>
          )}
        </div>
  );

  if (embedded) return body;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#060d1a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Revenue Intelligence</h2>
              <p className="text-[10px] text-slate-500">{lead.name} · {lead.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl border-none bg-transparent cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {body}
      </div>
    </div>
  );
}
