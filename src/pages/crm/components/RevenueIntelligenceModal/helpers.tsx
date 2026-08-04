import { CheckCircle2, XCircle, Minus } from 'lucide-react';
import React from 'react';

export function StatusDot({ status }: { status: string }) {
  if (status === 'confirmed' || status === 'accepted')
    return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
  if (status === 'negative')
    return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
  return <Minus className="w-4 h-4 text-slate-500 shrink-0" />;
}

export function ScoreBar({ value, max = 100, color = 'blue' }: { value: number; max?: number; color?: string }) {
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

export function RiskBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
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

export function IntensityBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
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

export function SectionCard({ title, icon: Icon, children, className = '' }: {
  title: string; icon: any; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-[var(--color-surface)] border border-white/5 rounded-2xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5 text-blue-400" />
        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );
}
