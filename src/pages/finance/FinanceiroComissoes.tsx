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
          {/* Period */}
          <select
            value={periodo}
            onChange={e => { setPeriodo(e.target.value); localStorage.setItem(PERIOD_KEY, e.target.value); }}
            className="h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-[11px] font-black uppercase tracking-widest outline-none text-white cursor-pointer"
          >
            {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Squad filter */}
          <div className="relative">
            <button
              onClick={() => setShowSquadMenu(v => !v)}
              className="flex items-center gap-2 h-11 px-4 border border-white/10 rounded-xl text-[11px] font-black text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              {squadFilter} <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {showSquadMenu && (
              <div className="absolute right-0 top-12 z-30 bg-[var(--color-surface-elevated)] border border-white/10 rounded-xl shadow-2xl shadow-black/50 min-w-[160px] overflow-hidden">
                {squadNames.map(s => (
                  <button key={s} onClick={() => { setSquadFilter(s); setShowSquadMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[11px] font-bold hover:bg-white/5 transition-colors ${squadFilter === s ? 'text-emerald-400' : 'text-slate-300'}`}
                  >{s}</button>
                ))}
              </div>
            )}
          </div>

          <Link to="/app/financeiro/configuracoes">
            <Button variant="outline" className="h-11 gap-2 text-[10px] font-black uppercase tracking-widest border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl">
              <Settings className="w-4 h-4" /> Config
            </Button>
          </Link>

          <Button variant="outline" onClick={handleExport} className="h-11 gap-2 text-[10px] font-black uppercase tracking-widest border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl">
            <Download className="w-4 h-4" /> CSV
          </Button>

          <Button
            onClick={handleRecalc}
            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-[10px] font-black uppercase tracking-widest px-5 rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} /> Recalcular OTE
          </Button>
        </div>
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="p-6 bg-[var(--color-surface-elevated)]/50 border hover:border-white/10 border-white/5 backdrop-blur-md transition-all">
              <kpi.icon className={`w-5 h-5 ${kpi.color} mb-4`} />
              <div className="text-2xl font-display font-black text-white mb-1 italic">{kpi.value}</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</div>
              <p className="text-[10px] text-slate-600 mt-1 font-medium">{kpi.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden"
      >
        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-white/5 px-4 pt-1">
          {CARGO_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label} / {tab.sublabel}
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-md font-black ${activeTab === tab.key ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-slate-600'}`}>
                {tabCount(tab.key)}
              </span>
            </button>
          ))}
          <div className="ml-auto">
            <Button
              onClick={() => setShowAddModal(true)}
              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg shadow-lg shadow-emerald-500/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl shadow-black/60 overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Adicionar Colaborador</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Perfil OTE aplicado automaticamente pelo cargo + nível</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome Completo</label>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60 placeholder:text-slate-600 transition-colors"
                  placeholder="Nome completo" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cargo</label>
                  <select value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value as CargoTab }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60 transition-colors">
                    <option>Closer</option><option>SDR</option><option>Gestor</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nível</label>
                  <select value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60 transition-colors">
                    <option>Aprendiz</option><option>Junior 1</option><option>Junior 2</option><option>Pleno</option><option>Senior</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Squad</label>
                  <input value={form.squad} onChange={e => setForm(f => ({ ...f, squad: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60 placeholder:text-slate-600 transition-colors"
                    placeholder="Ex: Target" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta (R$)</label>
                  <input type="number" value={form.meta} onChange={e => setForm(f => ({ ...f, meta: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60 placeholder:text-slate-600 transition-colors"
                    placeholder="70000" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Realizado (R$)</label>
                <input type="number" value={form.realizado} onChange={e => setForm(f => ({ ...f, realizado: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60 placeholder:text-slate-600 transition-colors"
                  placeholder="0" />
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex gap-3">
              <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl">Cancelar</Button>
              <Button onClick={handleAddEntry} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20">
                Adicionar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </PageContainer>
  );
}
