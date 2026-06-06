import { useState } from 'react';
import { Plus, Trash2, Settings2, DollarSign, Handshake, Receipt, Target, ArrowRight, Info } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer';
import { Button } from '../../components/ui/button';
import { useOTEConfig, OTEProfile, CommissionRule, PartnershipRule, TaxRate } from './hooks/useOTEConfig';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

type ConfigTab = 'perfis' | 'comissao' | 'parceria' | 'taxas' | 'metas';

const TABS: { key: ConfigTab; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'perfis', label: 'Perfis OTE', icon: Settings2, desc: 'Salário, variável e acelerador por cargo' },
  { key: 'comissao', label: 'Regras de Comissão', icon: DollarSign, desc: 'Faixas de atingimento e % comissão' },
  { key: 'parceria', label: 'Regras de Parceria', icon: Handshake, desc: 'Co-venda, indicação e splits' },
  { key: 'taxas', label: 'Taxas e Deduções', icon: Receipt, desc: 'INSS, IR e outros descontos' },
  { key: 'metas', label: 'Metas', icon: Target, desc: 'Metas individuais e por squad' },
];

const CARGOS = ['Closer', 'SDR', 'Gestor'] as const;
const NIVEIS = ['Aprendiz', 'Junior 1', 'Junior 2', 'Pleno', 'Senior'];
const APLICA = ['total', 'variavel', 'acelerador'] as const;

const CARGO_COLOR: Record<string, string> = {
  Closer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SDR: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Gestor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

function inp(cls = '') {
  return `bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/60 w-full transition-colors placeholder:text-slate-600 ${cls}`;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{children}</label>;
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-5 border-b border-white/5">
      <div className="p-2 rounded-xl bg-white/5 border border-white/10 mt-0.5">
        <Info className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div>
        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h3>
        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{desc}</p>
      </div>
    </div>
  );
}

function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

export default function FinanceiroConfiguracoes() {
  const {
    profiles, addProfile, removeProfile, updateProfile,
    commRules, addCommRule, removeCommRule,
    partRules, addPartRule, removePartRule,
    taxRates, addTaxRate, removeTaxRate,
  } = useOTEConfig();

  const [tab, setTab] = useState<ConfigTab>('perfis');

  const [pForm, setPForm] = useState<Omit<OTEProfile, 'id'>>({
    cargo: 'Closer', nivel: 'Junior 1', salarioFixo: 1620,
    variavelAlvo: 3000, aceleradorPercent: 2, thresholdMinimo: 30,
  });
  const [cForm, setCForm] = useState<Omit<CommissionRule, 'id'>>({ nome: '', faixaMin: 0, faixaMax: 100, percentComissao: 5 });
  const [prForm, setPrForm] = useState<Omit<PartnershipRule, 'id'>>({ tipo: '', descricao: '', percentSplit: 10 });
  const [tForm, setTForm] = useState<Omit<TaxRate, 'id'>>({ nome: '', percent: 0, aplicaEm: 'total' });

  const activeTab = TABS.find(t => t.key === tab)!;

  return (
    <PageContainer
      title="Configurações Financeiras"
      description="Perfis OTE, regras de comissão, parcerias e taxas que alimentam o cálculo automático da folha de comissões."
      breadcrumb={[{ label: 'Financeiro', path: '/app/financeiro' }, { label: 'Comissões', path: '/app/financeiro/comissoes' }, { label: 'Configurações' }]}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 shrink-0"
        >
          <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Seções</p>
            </div>
            <div className="p-2">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${tab === t.key
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'border border-transparent hover:bg-white/5'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg ${tab === t.key ? 'bg-emerald-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                    <t.icon className={`w-3.5 h-3.5 ${tab === t.key ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-black uppercase tracking-wide leading-none ${tab === t.key ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                      {t.label}
                    </p>
                    <p className="text-[9px] text-slate-600 font-medium mt-0.5 leading-none truncate">{t.desc}</p>
                  </div>
                  {tab === t.key && <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content area */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0 space-y-4"
        >
          {/* Section title bar */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <activeTab.icon className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-widest leading-none">{activeTab.label}</h2>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{activeTab.desc}</p>
            </div>
          </div>

          {/* ── PERFIS OTE ── */}
          {tab === 'perfis' && (
            <div className="space-y-4">
              <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
                <SectionHeader
                  title="Perfis cadastrados"
                  desc="Cada perfil define fixo, variável-alvo e acelerador por cargo + nível. O threshold é o % mínimo de atingimento para ganhar variável."
                />
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/5">
                      <tr>
                        <Th>Cargo</Th>
                        <Th>Nível</Th>
                        <Th>Fixo (R$)</Th>
                        <Th>Variável Alvo (R$)</Th>
                        <Th>Acelerador %</Th>
                        <Th>Threshold %</Th>
                        <Th children={''}></Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {profiles.map(p => (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg border ${CARGO_COLOR[p.cargo] || 'bg-white/5 text-slate-400 border-white/10'}`}>
                              {p.cargo}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm font-bold text-slate-400">{p.nivel}</td>
                          <td className="px-5 py-3.5">
                            <input type="number" value={p.salarioFixo}
                              onChange={e => updateProfile(p.id, { salarioFixo: +e.target.value })}
                              className={inp('w-28')} />
                          </td>
                          <td className="px-5 py-3.5">
                            <input type="number" value={p.variavelAlvo}
                              onChange={e => updateProfile(p.id, { variavelAlvo: +e.target.value })}
                              className={inp('w-28')} />
                          </td>
                          <td className="px-5 py-3.5">
                            <input type="number" value={p.aceleradorPercent}
                              onChange={e => updateProfile(p.id, { aceleradorPercent: +e.target.value })}
                              className={inp('w-20')} />
                          </td>
                          <td className="px-5 py-3.5">
                            <input type="number" value={p.thresholdMinimo}
                              onChange={e => updateProfile(p.id, { thresholdMinimo: +e.target.value })}
                              className={inp('w-20')} />
                          </td>
                          <td className="px-5 py-3.5">
                            <button onClick={() => { removeProfile(p.id); toast.success('Perfil removido.'); }}
                              className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all rounded-lg hover:bg-white/5">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> Novo Perfil
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  <div className="space-y-1.5">
                    <Label>Cargo</Label>
                    <select value={pForm.cargo} onChange={e => setPForm(f => ({ ...f, cargo: e.target.value as any }))} className={inp()}>
                      {CARGOS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nível</Label>
                    <select value={pForm.nivel} onChange={e => setPForm(f => ({ ...f, nivel: e.target.value }))} className={inp()}>
                      {NIVEIS.map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fixo (R$)</Label>
                    <input type="number" value={pForm.salarioFixo} onChange={e => setPForm(f => ({ ...f, salarioFixo: +e.target.value }))} className={inp()} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Variável (R$)</Label>
                    <input type="number" value={pForm.variavelAlvo} onChange={e => setPForm(f => ({ ...f, variavelAlvo: +e.target.value }))} className={inp()} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Acelerador %</Label>
                    <input type="number" value={pForm.aceleradorPercent} onChange={e => setPForm(f => ({ ...f, aceleradorPercent: +e.target.value }))} className={inp()} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Threshold %</Label>
                    <input type="number" value={pForm.thresholdMinimo} onChange={e => setPForm(f => ({ ...f, thresholdMinimo: +e.target.value }))} className={inp()} />
                  </div>
                </div>
                <Button onClick={() => { addProfile(pForm); toast.success('Perfil OTE criado!'); }}
                  className="mt-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20">
                  <Plus className="w-4 h-4" /> Adicionar Perfil
                </Button>
              </div>
            </div>
          )}

          {/* ── REGRAS DE COMISSÃO ── */}
          {tab === 'comissao' && (
            <div className="space-y-4">
              <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
                <SectionHeader
                  title="Faixas de Comissionamento"
                  desc="Define o % de comissão pago conforme o atingimento de meta. Faixas avaliadas em ordem crescente."
                />
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/5">
                      <tr><Th>Nome da Faixa</Th><Th>Ating. Mín. %</Th><Th>Ating. Máx. %</Th><Th>% Comissão</Th><Th children={''}></Th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {commRules.map(r => (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-5 py-3.5 text-sm font-black text-white">{r.nome}</td>
                          <td className="px-5 py-3.5 text-sm font-mono text-slate-400">{r.faixaMin}%</td>
                          <td className="px-5 py-3.5 text-sm font-mono text-slate-400">{r.faixaMax}%</td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-black text-emerald-400">{r.percentComissao}%</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <button onClick={() => { removeCommRule(r.id); toast.success('Regra removida.'); }}
                              className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all rounded-lg hover:bg-white/5">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> Nova Faixa
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <Label>Nome</Label>
                    <input value={cForm.nome} onChange={e => setCForm(f => ({ ...f, nome: e.target.value }))} className={inp()} placeholder="Ex: Acelerador" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mín. %</Label>
                    <input type="number" value={cForm.faixaMin} onChange={e => setCForm(f => ({ ...f, faixaMin: +e.target.value }))} className={inp()} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Máx. %</Label>
                    <input type="number" value={cForm.faixaMax} onChange={e => setCForm(f => ({ ...f, faixaMax: +e.target.value }))} className={inp()} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>% Comissão</Label>
                    <input type="number" value={cForm.percentComissao} onChange={e => setCForm(f => ({ ...f, percentComissao: +e.target.value }))} className={inp()} />
                  </div>
                </div>
                <Button onClick={() => { if (!cForm.nome) return toast.error('Informe o nome.'); addCommRule(cForm); toast.success('Faixa criada!'); }}
                  className="mt-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20">
                  <Plus className="w-4 h-4" /> Adicionar Faixa
                </Button>
              </div>
            </div>
          )}

          {/* ── REGRAS DE PARCERIA ── */}
          {tab === 'parceria' && (
            <div className="space-y-4">
              <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
                <SectionHeader
                  title="Regras de Parceria"
                  desc="Co-vendas, indicações e splits entre SDR e Closer. Aplicados sobre o valor da comissão gerada."
                />
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/5">
                      <tr><Th>Tipo</Th><Th>Descrição</Th><Th>Split %</Th><Th children={''}></Th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {partRules.map(r => (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-5 py-3.5">
                            <span className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {r.tipo}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-400">{r.descricao}</td>
                          <td className="px-5 py-3.5 text-sm font-black text-violet-400">{r.percentSplit}%</td>
                          <td className="px-5 py-3.5">
                            <button onClick={() => { removePartRule(r.id); toast.success('Regra removida.'); }}
                              className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all rounded-lg hover:bg-white/5">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> Nova Regra
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <input value={prForm.tipo} onChange={e => setPrForm(f => ({ ...f, tipo: e.target.value }))} className={inp()} placeholder="Ex: Co-venda" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Descrição</Label>
                    <input value={prForm.descricao} onChange={e => setPrForm(f => ({ ...f, descricao: e.target.value }))} className={inp()} placeholder="Breve explicação" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Split %</Label>
                    <input type="number" value={prForm.percentSplit} onChange={e => setPrForm(f => ({ ...f, percentSplit: +e.target.value }))} className={inp()} />
                  </div>
                </div>
                <Button onClick={() => { if (!prForm.tipo) return toast.error('Informe o tipo.'); addPartRule(prForm); toast.success('Regra criada!'); }}
                  className="mt-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20">
                  <Plus className="w-4 h-4" /> Adicionar Regra
                </Button>
              </div>
            </div>
          )}

          {/* ── TAXAS E DEDUÇÕES ── */}
          {tab === 'taxas' && (
            <div className="space-y-4">
              <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
                <SectionHeader
                  title="Taxas e Deduções"
                  desc="INSS, IR e outros descontos aplicados sobre o total OTE ou componentes individuais."
                />
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/5">
                      <tr><Th>Nome</Th><Th>% Dedução</Th><Th>Aplica em</Th><Th children={''}></Th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {taxRates.map(t => (
                        <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-5 py-3.5 text-sm font-black text-white">{t.nome}</td>
                          <td className="px-5 py-3.5 text-sm font-black text-rose-400">{t.percent}%</td>
                          <td className="px-5 py-3.5">
                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400">
                              {t.aplicaEm}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <button onClick={() => { removeTaxRate(t.id); toast.success('Taxa removida.'); }}
                              className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all rounded-lg hover:bg-white/5">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> Nova Taxa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nome</Label>
                    <input value={tForm.nome} onChange={e => setTForm(f => ({ ...f, nome: e.target.value }))} className={inp()} placeholder="Ex: INSS" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>% Dedução</Label>
                    <input type="number" value={tForm.percent} onChange={e => setTForm(f => ({ ...f, percent: +e.target.value }))} className={inp()} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Aplica em</Label>
                    <select value={tForm.aplicaEm} onChange={e => setTForm(f => ({ ...f, aplicaEm: e.target.value as any }))} className={inp()}>
                      {APLICA.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <Button onClick={() => { if (!tForm.nome) return toast.error('Informe o nome.'); addTaxRate(tForm); toast.success('Taxa criada!'); }}
                  className="mt-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20">
                  <Plus className="w-4 h-4" /> Adicionar Taxa
                </Button>
              </div>
            </div>
          )}

          {/* ── METAS ── */}
          {tab === 'metas' && (
            <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-5">
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <Target className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-widest">Gerenciar Metas</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-2">As metas individuais e de squad são configuradas no módulo de Metas do Financeiro. Clique abaixo para acessar.</p>
              </div>
              <Link to="/app/financeiro/metas">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-[10px] font-black uppercase tracking-widest h-11 px-6 rounded-xl shadow-lg shadow-emerald-500/20">
                  <Target className="w-4 h-4" /> Abrir Módulo de Metas
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
}
