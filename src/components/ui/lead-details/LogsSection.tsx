import React from "react";
import { Card } from "../card";
import { ShieldCheck } from "lucide-react";

interface LogsSectionProps {
  alterationLogs: any[];
}

export function LogsSection({ alterationLogs }: LogsSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Card className="p-4 border-white/10 bg-[var(--color-surface)]/60 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Auditoria de Operação (RBAC Trace)
          </h4>
          <span className="text-[9px] font-bold text-slate-500 uppercase">LGPD Standard</span>
        </div>

        <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
          {alterationLogs.map((log) => (
            <div key={log.id} className="relative text-xs">
              <div className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border border-[#06B6D4] bg-[var(--color-surface)] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-white font-bold leading-normal">{log.desc}</p>
                  <span className="text-[10px] text-slate-500 mt-1 font-semibold block">Operador: <strong className="text-slate-400">{log.author}</strong></span>
                </div>
                <span className="text-[9px] text-[#06B6D4] font-mono whitespace-nowrap">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
