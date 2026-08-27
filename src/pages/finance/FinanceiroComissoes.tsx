import { useState, useMemo, useCallback } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Settings, ChevronDown, Download, Plus, Trash2, Users, DollarSign, Zap } from 'lucide-react';
import { PageContainer } from '../../components/PageContainer';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useData } from '../../contexts/DataContext';
import { useOTEConfig } from './hooks/useOTEConfig';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

type CargoTab = 'Closer' | 'SDR' | 'Gestor';

const CARGO_TABS: { key: CargoTab; label: string; sublabel: string }[] = [
  { key: 'Closer', label: 'Closers',  sublabel: 'Vendas'      },
  { key: 'SDR',    label: 'SDRs',     sublabel: 'Agendamento' },
  { key: 'Gestor', label: 'Gestores', sublabel: 'Squad'       },
];

function semaforo(pct: number): { label: string; textColor: string; dotColor: string; badgeBg: string } {
  if (pct >= 80) return { label: 'Verde',    textColor: 'text-emerald-400', dotColor: 'bg-emerald-400', badgeBg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (pct >= 50) return { label: 'Amarelo',  textColor: 'text-amber-400',   dotColor: 'bg-amber-400',   badgeBg: 'bg-amber-500/10 border-amber-500/20'   };
  return               { label: 'Vermelho', textColor: 'text-red-400',     dotColor: 'bg-red-400',     badgeBg: 'bg-red-500/10 border-red-500/20'       };
}

function fmt(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function initials(nome: string) {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const AVATAR_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
];

interface ColabEntry {
  id: string;
  nome: string;
  cargo: CargoTab;
  nivel: string;
  squad: string;
  meta: number;
  realizado: number;
}

const STORAGE_KEY = 'ote_period_entries_v2';
const PERIOD_KEY  = 'ote_current_period';

const DEFAULT_ENTRIES: ColabEntry[] = [
  { id: 'e1', nome: 'Luana Pereira Alves Pinheiro Leite', cargo: 'Closer', nivel: 'Aprendiz', squad: 'Target',  meta: 70410, realizado: 591  },
  { id: 'e2', nome: 'Paulo Victor',                       cargo: 'Closer', nivel: 'Junior 1', squad: 'Pluppex', meta: 70410, realizado: 5285 },
  { id: 'e3', nome: 'Thais Nascimento Pereira',           cargo: 'Closer', nivel: 'Junior 1', squad: 'Target',  meta: 70410, realizado: 985  },
  { id: 'e4', nome: 'Israel Assis de Oliveira Carvalho',  cargo: 'Closer', nivel: 'Junior 1', squad: 'Target',  meta: 89186, realizado: 197  },
  { id: 'e5', nome: 'Wanderlei Sewaybricker Gurzoni',     cargo: 'Closer', nivel: 'Junior 1', squad: 'Target',  meta: 89186, realizado: 0    },
  { id: 'e6', nome: 'Gabriel Lima',                       cargo: 'Closer', nivel: 'Junior 1', squad: 'Pluppex', meta: 70410, realizado: 985  },
  { id: 'e7', nome: 'Anna Cristiny',                      cargo: 'Closer', nivel: 'Aprendiz', squad: 'Pluppex', meta: 50000, realizado: 0    },
];

const PERIODOS = ['Junho/2026', 'Maio/2026', 'Abril/2026', 'Março/2026'];

export default function FinanceiroComissoes() {
  const { squads } = useData();
  const { profiles, calcOTE } = useOTEConfig();

  const [periodo, setPeriodo] = useState<string>(
    () => localStorage.getItem(PERIOD_KEY) || PERIODOS[0]
  );
  const [activeTab, setActiveTab] = useState<CargoTab>('Closer');
  const [squadFilter, setSquadFilter] = useState('Todos');
  const [showSquadMenu, setShowSquadMenu] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ nome: '', cargo: 'Closer' as CargoTab, nivel: 'Junior 1', squad: '', meta: '', realizado: '' });

  const [entries, setEntries] = useState<ColabEntry[]>(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
    return DEFAULT_ENTRIES;
  });

  const saveEntries = (v: ColabEntry[]) => {
    setEntries(v);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  };

  const squadNames = useMemo(() => {
    const fromSquads = squads.map(s => s.nome);
    const fromEntries = [...new Set(entries.map(e => e.squad))];
    return ['Todos', ...new Set([...fromSquads, ...fromEntries])];
  }, [squads, entries]);

  const filtered = useMemo(() =>
    entries.filter(e =>
      e.cargo === activeTab &&
      (squadFilter === 'Todos' || e.squad === squadFilter)
    )
  , [entries, activeTab, squadFilter]);

  const rows = useMemo(() => filtered.map((e, idx) => {
    const ating = e.meta > 0 ? (e.realizado / e.meta) * 100 : 0;
    const profile = profiles.find(p => p.cargo === e.cargo && p.nivel === e.nivel);
    const ote = profile
      ? calcOTE(profile, ating)
      : { fixo: 0, variavel: 0, acelerador: 0, totalOTE: 0 };
    return { ...e, ating, sem: semaforo(ating), ...ote, colorIdx: idx % AVATAR_COLORS.length };
  }), [filtered, profiles, calcOTE]);

  const totals = useMemo(() => ({
    fixo:     rows.reduce((a, r) => a + r.fixo, 0),
    variavel: rows.reduce((a, r) => a + r.variavel, 0),
    ote:      rows.reduce((a, r) => a + r.totalOTE, 0),
    count:    rows.length,
    avgAting: rows.length ? rows.reduce((a, r) => a + r.ating, 0) / rows.length : 0,
  }), [rows]);

  const handleRecalc = useCallback(() => {
    setSpinning(true);
    setTimeout(() => { setSpinning(false); toast.success('OTE recalculado com sucesso!'); }, 900);
  }, []);

  const handleAddEntry = () => {
    if (!form.nome.trim() || !form.meta) return toast.error('Preencha nome e meta.');
    saveEntries([...entries, {
      id: `e${Date.now()}`,
      nome: form.nome.trim(),
      cargo: form.cargo,
      nivel: form.nivel,
      squad: form.squad,
      meta: parseFloat(form.meta) || 0,
      realizado: parseFloat(form.realizado) || 0,
    }]);
    setShowAddModal(false);
    setForm({ nome: '', cargo: 'Closer', nivel: 'Junior 1', squad: '', meta: '', realizado: '' });
    toast.success('Colaborador adicionado!');
  };

  const tabCount = (cargo: CargoTab) => entries.filter(e => e.cargo === cargo).length;

  const handleExport = () => {
    const lines = ['Nome;Cargo;Nível;Squad;Meta;Realizado;Atingimento;Semáforo;Fixo;Variável;Acelerador;Total OTE'];
    rows.forEach(r => lines.push(
      `"${r.nome}";"${r.cargo}";"${r.nivel}";"${r.squad}";${r.meta};${r.realizado};${r.ating.toFixed(1)}%;${r.sem.label};${r.fixo};${r.variavel};${r.acelerador};${r.totalOTE}`
    ));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `ote_${periodo.replace('/', '-')}.csv`; a.click();
  };

  const kpis = [
    {
      label: 'Colaboradores',
      value: String(totals.count),
      sub: `${activeTab}s ativos`,
      icon: Users,
      color: 'text-indigo-500',
    },
    {
      label: 'Total Fixo',
      value: fmt(totals.fixo),
      sub: 'salário base',
      icon: DollarSign,
      color: 'text-emerald-500',
    },
    {
      label: 'Total Variável',
      value: fmt(totals.variavel),
      sub: 'comissão apurada',
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      label: 'Total OTE',
      value: fmt(totals.ote),
      sub: `média ${totals.avgAting.toFixed(1)}% atingimento`,
      icon: Zap,
      color: 'text-amber-500',
    },
  ];

  return (
    <PageContainer
      title="Comissões & OTE"
      description="Apuração de On-Target Earnings por colaborador — fixo, variável e acelerador calculados automaticamente pelos perfis configurados."
      breadcrumb={[{ label: 'Financeiro', path: '/app/financeiro' }, { label: 'Comissões & OTE' }]}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-xl p-0.5">
            <Link to="/app/financeiro/configuracoes">
              <button className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Configurações">
                <Settings className="w-4 h-4" />
              </button>
            </Link>
            <button onClick={handleExport} className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Exportar CSV">
              <Download className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={handleRecalc}
            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-[10px] font-black uppercase tracking-widest px-5 rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} /> Recalcular OTE
          </Button>
        </div>
      }
    >
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={periodo}
          onChange={e => { setPeriodo(e.target.value); localStorage.setItem(PERIOD_KEY, e.target.value); }}
          className="h-9 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 text-xs font-bold text-[var(--color-text-primary)] outline-none cursor-pointer"
        >
          {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSquadMenu(v => !v)}
            className="flex items-center gap-2 h-9 px-3.5 border border-[var(--color-border-default)] rounded-[var(--radius-control)] text-xs font-bold text-[var(--color-text-primary)] bg-[var(--color-surface-sunken)] hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer"
          >
            <span className="text-[var(--color-text-muted)] font-normal">Squad:</span> {squadFilter} <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>
          {showSquadMenu && (
            <div className="absolute left-0 top-10 z-30 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-xl shadow-xl min-w-[160px] p-1 overflow-hidden animate-in fade-in">
              {squadNames.map(s => (
                <button key={s} onClick={() => { setSquadFilter(s); setShowSquadMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg hover:bg-[var(--color-surface-sunken)] transition-colors cursor-pointer ${squadFilter === s ? 'text-[var(--color-primary-blue)]' : 'text-[var(--color-text-primary)]'}`}
                >{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
              <kpi.icon className={`w-5 h-5 ${kpi.color} mb-3`} />
              <div className="text-2xl font-black font-mono text-[var(--color-text-primary)] mb-1">{kpi.value}</div>
              <div className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">{kpi.label}</div>
              <p className="text-[11px] text-[var(--color-text-faint)] mt-1 font-medium">{kpi.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-sm"
      >
        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-[var(--color-border-subtle)] px-4 pt-1 bg-[var(--color-surface-sunken)]">
          {CARGO_TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'border-[var(--color-primary-blue)] text-[var(--color-primary-blue)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.label} / {tab.sublabel}
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-md font-bold ${activeTab === tab.key ? 'bg-[var(--color-primary-blue)]/15 text-[var(--color-primary-blue)]' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'}`}>
                {tabCount(tab.key)}
              </span>
            </button>
          ))}
          <div className="ml-auto">
            <Button
              onClick={() => setShowAddModal(true)}
              className="h-8 text-xs font-bold gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Colaborador(a)', 'Meta', 'Realizado', 'Atingimento', 'Semáforo', 'Fixo', 'Variável', 'Acelerador', 'Total OTE', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] whitespace-nowrap ${i === 9 ? 'w-10' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-2xl bg-white/5"><Users className="w-6 h-6 text-slate-600" /></div>
                      <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Nenhum colaborador nesta categoria</p>
                      <button onClick={() => setShowAddModal(true)} className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 underline underline-offset-2">Adicionar colaborador</button>
                    </div>
                  </td>
                </tr>
              ) : rows.map(row => {
                const pct = row.ating;
                const atBadge = pct >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : pct >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20';
                return (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[row.colorIdx]} flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-lg`}>
                          {initials(row.nome)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white leading-tight">{row.nome}</p>
                          <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                            {row.cargo}
                            <span className="mx-1.5 text-slate-700">·</span>
                            {row.nivel}
                            {row.squad && <>
                              <span className="mx-1.5 text-slate-700">·</span>
                              <span className="text-blue-400">{row.squad}</span>
                            </>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-500 whitespace-nowrap">{fmt(row.meta)}</td>
                    <td className="px-5 py-3.5 text-sm font-black text-white whitespace-nowrap">{fmt(row.realizado)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg ${atBadge}`}>
                        {pct >= 100 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${row.sem.dotColor}`} />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${row.sem.textColor}`}>{row.sem.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-400 whitespace-nowrap">{fmt(row.fixo)}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-400 whitespace-nowrap">{fmt(row.variavel)}</td>
                    <td className="px-5 py-3.5 text-sm font-bold whitespace-nowrap">
                      {row.acelerador > 0
                        ? <span className="text-amber-400">{fmt(row.acelerador)}</span>
                        : <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-black text-emerald-400">{fmt(row.totalOTE)}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        onClick={() => { saveEntries(entries.filter(e => e.id !== row.id)); toast.success('Removido.'); }}
                        className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all rounded-lg hover:bg-white/5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer totals */}
        {rows.length > 0 && (
          <div className="px-5 py-4 border-t border-white/5 bg-white/[0.02] flex flex-wrap items-center justify-end gap-8">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Fixo</p>
              <p className="text-sm font-black text-slate-300">{fmt(totals.fixo)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Variável</p>
              <p className="text-sm font-black text-slate-300">{fmt(totals.variavel)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total OTE</p>
              <p className="text-base font-black text-emerald-400">{fmt(totals.ote)}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => setShowAddModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[var(--color-border-subtle)] flex justify-between items-center bg-[var(--color-surface-sunken)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Adicionar Colaborador OTE</h3>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Perfil OTE aplicado automaticamente pelo cargo + nível</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)} 
                className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Nome Completo</label>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                  placeholder="Nome completo" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Cargo</label>
                  <select value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value as CargoTab }))}
                    className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]">
                    <option>Closer</option><option>SDR</option><option>Gestor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Nível</label>
                  <select value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}
                    className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]">
                    <option>Aprendiz</option><option>Junior 1</option><option>Junior 2</option><option>Pleno</option><option>Senior</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Squad</label>
                  <input value={form.squad} onChange={e => setForm(f => ({ ...f, squad: e.target.value }))}
                    className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                    placeholder="Ex: Target" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Meta (R$)</label>
                  <input type="number" value={form.meta} onChange={e => setForm(f => ({ ...f, meta: e.target.value }))}
                    className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                    placeholder="70000" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1 block">Realizado (R$)</label>
                <input type="number" value={form.realizado} onChange={e => setForm(f => ({ ...f, realizado: e.target.value }))}
                  className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                  placeholder="0" />
              </div>
            </div>
            <div className="p-6 border-t border-[var(--color-border-subtle)] flex justify-end gap-2 bg-[var(--color-surface-sunken)]">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="h-9 px-4 text-xs font-bold border-[var(--color-border-default)]">Cancelar</Button>
              <Button type="button" onClick={handleAddEntry} className="h-9 px-5 text-xs font-bold shadow-xs">
                Adicionar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </PageContainer>
  );
}
