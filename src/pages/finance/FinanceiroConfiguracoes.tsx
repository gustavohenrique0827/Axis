import { useState } from 'react';
import { Plus, Trash2, Settings2, DollarSign, Handshake, Receipt, Target, ArrowLeft, Info, Zap, Layers, TrendingUp, Check } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useOTEConfig, OTEProfile, CommissionRule, PartnershipRule, TaxRate, ModeloComissao } from './hooks/useOTEConfig';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';

const MODELOS: { key: ModeloComissao; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'acelerador', label: 'Acelerador por Perfil', icon: Zap, desc: 'Variável proporcional ao %-atingimento de cada perfil, com acelerador linear acima de 100%. Usa a aba "Perfis OTE".' },
  { key: 'faixas', label: 'Faixas de Atingimento', icon: Layers, desc: 'Comissão = % da faixa em que o colaborador se encaixa, aplicado sobre o valor realizado. Usa a aba "Regras de Comissão".' },
  { key: 'faturamento', label: '% do Faturamento', icon: TrendingUp, desc: 'Comissão = percentual fixo sobre o valor realizado, mais um bônus fixo ao bater 100% da meta.' },
];

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
  Closer: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  SDR: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Gestor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

function inp(cls = '') {
  return `bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] w-full transition-all ${cls}`;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">{children}</label>;
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]">
      <div className="p-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] mt-0.5">
        <Info className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
      </div>
      <div>
        <h3 className="text-xs font-bold text-[var(--color-text-primary)]">{title}</h3>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-medium">{desc}</p>
      </div>
    </div>
  );
}

function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-5 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>
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
    modeloComissao, setModeloComissao,
    percentFaturamento, setPercentFaturamento,
    bonusMetaBatida, setBonusMetaBatida,
  } = useOTEConfig();

  const { section } = useParams<{ section?: string }>();
  const tab: ConfigTab = (TABS.some(t => t.key === section) ? section : 'perfis') as ConfigTab;

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
      actions={
        <Link to="/app/financeiro/comissoes">
          <Button variant="outline" className="h-9 px-4 text-xs font-bold gap-1.5 border-[var(--color-border-default)]">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para Comissões
          </Button>
        </Link>
      }
    >
      <div className="space-y-5 max-w-[1700px] mx-auto pb-12">
        {/* Horizontal section tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-xl p-1 shadow-sm scrollbar-none">
          {TABS.map(t => (
            <Link
              key={t.key}
              to={`/app/financeiro/configuracoes/${t.key}`}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${tab === t.key
                ? 'bg-[var(--color-primary-blue)] !text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)]'
                }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </Link>
          ))}
        </div>

        {/* Modelo de Comissão — escolha que define qual fórmula calcOTE aplica na apuração */}
        <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
          <SectionHeader
            title="Modelo de Comissão da Empresa"
            desc="Escolha como sua empresa remunera a parte variável — essa escolha define qual configuração abaixo entra de fato no cálculo do OTE."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
            {MODELOS.map(m => {
              const isSelected = modeloComissao === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => { setModeloComissao(m.key); toast.success(`Modelo de comissão alterado para: ${m.label}`); }}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-[var(--color-primary-blue)]/10 border-[var(--color-primary-blue)] shadow-xs'
                      : 'bg-[var(--color-surface-sunken)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <m.icon className={`w-4 h-4 ${isSelected ? 'text-[var(--color-primary-blue)]' : 'text-[var(--color-text-muted)]'}`} />
                    {isSelected && <Check className="w-4 h-4 text-[var(--color-primary-blue)]" />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isSelected ? 'text-[var(--color-primary-blue)]' : 'text-[var(--color-text-primary)]'}`}>{m.label}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1 leading-relaxed">{m.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {modeloComissao === 'faturamento' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 pt-0">
              <div>
                <Label>% de Comissão sobre o Faturamento</Label>
                <input type="number" value={percentFaturamento} onChange={e => setPercentFaturamento(+e.target.value)} className={inp()} />
              </div>
              <div>
                <Label>Bônus fixo ao bater 100% da meta (R$)</Label>
                <input type="number" value={bonusMetaBatida} onChange={e => setBonusMetaBatida(+e.target.value)} className={inp()} />
              </div>
            </div>
          )}
        </Card>

        {/* Content area */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Section title bar */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] border border-[var(--color-primary-blue)]/20">
              <activeTab.icon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text-primary)] leading-none">{activeTab.label}</h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{activeTab.desc}</p>
            </div>
          </div>

          {/* ── PERFIS OTE ── */}
          {tab === 'perfis' && (
            <div className="space-y-4">
              <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
                <SectionHeader
                  title="Perfis cadastrados"
                  desc="Cada perfil define fixo, variável-alvo e acelerador por cargo + nível. O threshold é o % mínimo de atingimento para ganhar variável."
                />
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]">
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
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                      {profiles.map(p => (
                        <tr key={p.id} className="hover:bg-[var(--color-surface-sunken)]/50 transition-colors group">
                          <td className="px-5 py-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${CARGO_COLOR[p.cargo] || 'bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)]'}`}>
                              {p.cargo}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-semibold text-[var(--color-text-primary)]">{p.nivel}</td>
                          <td className="px-5 py-3">
                            <input type="number" value={p.salarioFixo}
                              onChange={e => updateProfile(p.id, { salarioFixo: +e.target.value })}
                              className={inp('w-28')} />
                          </td>
                          <td className="px-5 py-3">
                            <input type="number" value={p.variavelAlvo}
                              onChange={e => updateProfile(p.id, { variavelAlvo: +e.target.value })}
                              className={inp('w-28')} />
                          </td>
                          <td className="px-5 py-3">
                            <input type="number" value={p.aceleradorPercent}
                              onChange={e => updateProfile(p.id, { aceleradorPercent: +e.target.value })}
                              className={inp('w-20')} />
                          </td>
                          <td className="px-5 py-3">
                            <input type="number" value={p.thresholdMinimo}
                              onChange={e => updateProfile(p.id, { thresholdMinimo: +e.target.value })}
                              className={inp('w-20')} />
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => { removeProfile(p.id); toast.success('Perfil removido.'); }}
                              className="p-1.5 text-[var(--color-text-faint)] hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-lg cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] p-6 shadow-sm">
                <h3 className="text-xs font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" /> Novo Perfil OTE
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  <div>
                    <Label>Cargo</Label>
                    <select value={pForm.cargo} onChange={e => setPForm(f => ({ ...f, cargo: e.target.value as any }))} className={inp()}>
                      {CARGOS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Nível</Label>
                    <select value={pForm.nivel} onChange={e => setPForm(f => ({ ...f, nivel: e.target.value }))} className={inp()}>
                      {NIVEIS.map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Fixo (R$)</Label>
                    <input type="number" value={pForm.salarioFixo} onChange={e => setPForm(f => ({ ...f, salarioFixo: +e.target.value }))} className={inp()} />
                  </div>
                  <div>
                    <Label>Variável (R$)</Label>
                    <input type="number" value={pForm.variavelAlvo} onChange={e => setPForm(f => ({ ...f, variavelAlvo: +e.target.value }))} className={inp()} />
                  </div>
                  <div>
                    <Label>Acelerador %</Label>
                    <input type="number" value={pForm.aceleradorPercent} onChange={e => setPForm(f => ({ ...f, aceleradorPercent: +e.target.value }))} className={inp()} />
                  </div>
                  <div>
                    <Label>Threshold %</Label>
                    <input type="number" value={pForm.thresholdMinimo} onChange={e => setPForm(f => ({ ...f, thresholdMinimo: +e.target.value }))} className={inp()} />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => { addProfile(pForm); toast.success('Perfil OTE criado com sucesso!'); }}
                    className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
                    <Plus className="w-3.5 h-3.5" /> Adicionar Perfil
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ── REGRAS DE COMISSÃO ── */}
          {tab === 'comissao' && (
            <div className="space-y-4">
              <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
                <SectionHeader
                  title="Faixas de Comissionamento"
                  desc="Define o % de comissão pago conforme o atingimento de meta. Faixas avaliadas em ordem crescente."
                />
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]">
                      <tr><Th>Nome da Faixa</Th><Th>Ating. Mín. %</Th><Th>Ating. Máx. %</Th><Th>% Comissão</Th><Th children={''}></Th></tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                      {commRules.map(r => (
                        <tr key={r.id} className="hover:bg-[var(--color-surface-sunken)]/50 transition-colors group">
                          <td className="px-5 py-3 font-bold text-[var(--color-text-primary)]">{r.nome}</td>
                          <td className="px-5 py-3 font-mono text-[var(--color-text-muted)]">{r.faixaMin}%</td>
                          <td className="px-5 py-3 font-mono text-[var(--color-text-muted)]">{r.faixaMax}%</td>
                          <td className="px-5 py-3">
                            <span className="font-bold text-emerald-500">{r.percentComissao}%</span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => { removeCommRule(r.id); toast.success('Regra removida.'); }}
                              className="p-1.5 text-[var(--color-text-faint)] hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-lg cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] p-6 shadow-sm">
                <h3 className="text-xs font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" /> Nova Faixa
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="col-span-2 md:col-span-1">
                    <Label>Nome</Label>
                    <input value={cForm.nome} onChange={e => setCForm(f => ({ ...f, nome: e.target.value }))} className={inp()} placeholder="Ex: Acelerador" />
                  </div>
                  <div>
                    <Label>Mín. %</Label>
                    <input type="number" value={cForm.faixaMin} onChange={e => setCForm(f => ({ ...f, faixaMin: +e.target.value }))} className={inp()} />
                  </div>
                  <div>
                    <Label>Máx. %</Label>
                    <input type="number" value={cForm.faixaMax} onChange={e => setCForm(f => ({ ...f, faixaMax: +e.target.value }))} className={inp()} />
                  </div>
                  <div>
                    <Label>% Comissão</Label>
                    <input type="number" value={cForm.percentComissao} onChange={e => setCForm(f => ({ ...f, percentComissao: +e.target.value }))} className={inp()} />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => { if (!cForm.nome) return toast.error('Informe o nome.'); addCommRule(cForm); toast.success('Faixa criada!'); }}
                    className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
                    <Plus className="w-3.5 h-3.5" /> Adicionar Faixa
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ── REGRAS DE PARCERIA ── */}
          {tab === 'parceria' && (
            <div className="space-y-4">
              <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
                <SectionHeader
                  title="Regras de Parceria"
                  desc="Co-vendas, indicações e splits entre SDR e Closer. Aplicados sobre o valor da comissão gerada."
                />
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]">
                      <tr><Th>Tipo</Th><Th>Descrição</Th><Th>Split %</Th><Th children={''}></Th></tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                      {partRules.map(r => (
                        <tr key={r.id} className="hover:bg-[var(--color-surface-sunken)]/50 transition-colors group">
                          <td className="px-5 py-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] border border-[var(--color-primary-blue)]/20">
                              {r.tipo}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[var(--color-text-muted)]">{r.descricao}</td>
                          <td className="px-5 py-3 font-bold text-purple-500">{r.percentSplit}%</td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => { removePartRule(r.id); toast.success('Regra removida.'); }}
                              className="p-1.5 text-[var(--color-text-faint)] hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-lg cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] p-6 shadow-sm">
                <h3 className="text-xs font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" /> Nova Regra
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Tipo</Label>
                    <input value={prForm.tipo} onChange={e => setPrForm(f => ({ ...f, tipo: e.target.value }))} className={inp()} placeholder="Ex: Co-venda" />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <input value={prForm.descricao} onChange={e => setPrForm(f => ({ ...f, descricao: e.target.value }))} className={inp()} placeholder="Breve explicação" />
                  </div>
                  <div>
                    <Label>Split %</Label>
                    <input type="number" value={prForm.percentSplit} onChange={e => setPrForm(f => ({ ...f, percentSplit: +e.target.value }))} className={inp()} />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => { if (!prForm.tipo) return toast.error('Informe o tipo.'); addPartRule(prForm); toast.success('Regra criada!'); }}
                    className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
                    <Plus className="w-3.5 h-3.5" /> Adicionar Regra
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ── TAXAS E DEDUÇÕES ── */}
          {tab === 'taxas' && (
            <div className="space-y-4">
              <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
                <SectionHeader
                  title="Taxas e Deduções"
                  desc="INSS, IR e outros descontos aplicados sobre o total OTE ou componentes individuais."
                />
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]">
                      <tr><Th>Nome</Th><Th>% Dedução</Th><Th>Aplica em</Th><Th children={''}></Th></tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border-subtle)]">
                      {taxRates.map(t => (
                        <tr key={t.id} className="hover:bg-[var(--color-surface-sunken)]/50 transition-colors group">
                          <td className="px-5 py-3 font-bold text-[var(--color-text-primary)]">{t.nome}</td>
                          <td className="px-5 py-3 font-bold text-rose-500">{t.percent}%</td>
                          <td className="px-5 py-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
                              {t.aplicaEm}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => { removeTaxRate(t.id); toast.success('Taxa removida.'); }}
                              className="p-1.5 text-[var(--color-text-faint)] hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-lg cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] p-6 shadow-sm">
                <h3 className="text-xs font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" /> Nova Taxa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Nome</Label>
                    <input value={tForm.nome} onChange={e => setTForm(f => ({ ...f, nome: e.target.value }))} className={inp()} placeholder="Ex: INSS" />
                  </div>
                  <div>
                    <Label>% Dedução</Label>
                    <input type="number" value={tForm.percent} onChange={e => setTForm(f => ({ ...f, percent: +e.target.value }))} className={inp()} />
                  </div>
                  <div>
                    <Label>Aplica em</Label>
                    <select value={tForm.aplicaEm} onChange={e => setTForm(f => ({ ...f, aplicaEm: e.target.value as any }))} className={inp()}>
                      {APLICA.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => { if (!tForm.nome) return toast.error('Informe o nome.'); addTaxRate(tForm); toast.success('Taxa criada!'); }}
                    className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
                    <Plus className="w-3.5 h-3.5" /> Adicionar Taxa
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ── METAS ── */}
          {tab === 'metas' && (
            <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
              <div className="p-4 rounded-2xl bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] border border-[var(--color-primary-blue)]/20">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">Gerenciar Metas do Time</h3>
                <p className="text-xs text-[var(--color-text-muted)] max-w-sm mt-1">Meta e realizado de cada colaborador são cadastrados por período direto na tela de Comissões & OTE.</p>
              </div>
              <Link to="/app/financeiro/comissoes">
                <Button className="h-9 px-5 text-xs font-bold gap-1.5 shadow-xs">
                  <Target className="w-3.5 h-3.5" /> Abrir Comissões & OTE
                </Button>
              </Link>
            </Card>
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
}
