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
    blue: 'bg-slate-400', emerald: 'bg-emerald-500',
    amber: 'bg-amber-500', rose: 'bg-rose-500', indigo: 'bg-slate-400',
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${colorMap[color] ?? 'bg-slate-400'} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-slate-300 w-8 text-right">{value}</span>
    </div>
  );
}

export function RiskBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const dot = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-rose-500',
  };
  const text = {
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-rose-400',
  };
  const labels = { low: 'Baixo', medium: 'Médio', high: 'Alto' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${text[level]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[level]}`} />
      {labels[level]}
    </span>
  );
}

export function IntensityBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const dot = {
    low: 'bg-slate-500',
    medium: 'bg-amber-500',
    high: 'bg-emerald-500',
  };
  const text = {
    low: 'text-slate-400',
    medium: 'text-amber-400',
    high: 'text-emerald-400',
  };
  const labels = { low: 'Fraco', medium: 'Médio', high: 'Forte' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${text[level]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[level]}`} />
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
        <Icon className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm text-slate-400">{title}</h3>
      </div>
      {children}
    </div>
  );
}
