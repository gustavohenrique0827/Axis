import { motion } from 'motion/react';
import { Card } from '../../../../components/ui/card';
import { Trophy } from 'lucide-react';

interface SalesEntry {
  name: string;
  total: number;
  deals: number;
  rate: number;
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-40">
      <Icon className="w-8 h-8 text-slate-500" />
      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">{message}</p>
    </div>
  );
}

export function SalesRankingPodium({ salesRanking }: { salesRanking: SalesEntry[] }) {
  const top3 = salesRanking.slice(0, 3);
  const hasSales = top3.length > 0;

  return (
    <Card className="p-10 bg-gradient-to-br from-[var(--color-surface-elevated)]/60 via-[var(--color-surface)]/80 to-[var(--color-surface-elevated)] border-white/5 relative overflow-hidden group rounded-3xl">
      <div className="flex items-center justify-between mb-12">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-500" /> Hall da Fama
        </h3>
        <div className="flex gap-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            {new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase()}
          </span>
        </div>
      </div>

      {!hasSales ? (
        <EmptyState icon={Trophy} message="Nenhum deal fechado ainda. Feche o primeiro negócio para ver o ranking!" />
      ) : (
        <>
          <div className="flex items-end justify-center gap-6 mb-12 h-56">
            {top3[1] ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "75%", opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 50 }}
                className="flex-1 max-w-[130px] flex flex-col items-center gap-4 group/p"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-slate-700/50 border border-slate-400/50 backdrop-blur-xl flex items-center justify-center text-2xl shadow-2xl group-hover/p:-translate-y-1 transition-transform">🥈</div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-slate-400 text-slate-900 text-[8px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">2º</div>
                </div>
                <div className="w-full h-full bg-slate-400/5 border-x border-t border-white/10 rounded-t-[2rem] p-5 flex flex-col items-center justify-center shadow-inner">
                  <p className="text-[11px] font-black text-white text-center truncate w-full mb-1">{top3[1].name}</p>
                  <p className="text-xs font-black text-slate-400 font-mono">R$ {top3[1].total.toLocaleString('pt-BR')}</p>
                </div>
              </motion.div>
            ) : <div className="flex-1 max-w-[130px]" />}

            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "100%", opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
              className="flex-1 max-w-[150px] flex flex-col items-center gap-5 group/p"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/20 group-hover/p:-translate-y-2 transition-transform">🥇</div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -inset-3 border-2 border-dashed border-amber-500/20 rounded-3xl"
                />
              </div>
              <div className="w-full h-full bg-amber-500/10 border-x border-t border-amber-500/30 rounded-t-[2.5rem] p-6 flex flex-col items-center justify-center shadow-inner">
                <p className="text-[13px] font-black text-white text-center truncate w-full mb-1">{top3[0].name}</p>
                <p className="text-lg font-black text-amber-400 font-mono tracking-tighter">R$ {top3[0].total.toLocaleString('pt-BR')}</p>
                <div className="mt-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-tighter shadow-[0_0_15px_rgba(245,158,11,0.4)]">Destaque do Mês</div>
              </div>
            </motion.div>

            {top3[2] ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "60%", opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 50 }}
                className="flex-1 max-w-[110px] flex flex-col items-center gap-4 group/p"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-orange-700/50 border border-orange-700/50 backdrop-blur-xl flex items-center justify-center text-xl shadow-2xl group-hover/p:-translate-y-1 transition-transform">🥉</div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-700 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">3º</div>
                </div>
                <div className="w-full h-full bg-orange-700/5 border-x border-t border-white/10 rounded-t-[1.5rem] p-4 flex flex-col items-center justify-center shadow-inner">
                  <p className="text-[10px] font-black text-white text-center truncate w-full mb-1">{top3[2].name}</p>
                  <p className="text-[11px] font-black text-orange-400 font-mono">R$ {top3[2].total.toLocaleString('pt-BR')}</p>
                </div>
              </motion.div>
            ) : <div className="flex-1 max-w-[110px]" />}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {top3.map((s, idx) => (
              <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-xl group-hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Conversão</p>
                  <span className="text-xs font-black text-blue-400">{s.rate}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.rate}%` }}
                    transition={{ delay: 1, duration: 1.5 }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Negócios Fechados</span>
                  <span className="text-xs font-black text-white">{s.deals}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
