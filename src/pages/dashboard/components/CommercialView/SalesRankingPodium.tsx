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
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <Icon className="w-8 h-8 text-slate-500" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function SalesRankingPodium({ salesRanking }: { salesRanking: SalesEntry[] }) {
  const top3 = salesRanking.slice(0, 3);
  const hasSales = top3.length > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm text-slate-400 flex items-center gap-2">
          <Trophy className="w-4 h-4" /> Hall da Fama
        </h3>
        <span className="text-xs text-slate-500">
          {new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
        </span>
      </div>

      {!hasSales ? (
        <EmptyState icon={Trophy} message="Nenhum deal fechado ainda. Feche o primeiro negócio para ver o ranking!" />
      ) : (
        <>
          <div className="flex items-end justify-center gap-6 mb-8 h-56">
            {top3[1] ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "75%", opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 50 }}
                className="flex-1 max-w-[130px] flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">🥈</div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-slate-600 text-white text-xs rounded-full flex items-center justify-center">2</div>
                </div>
                <div className="w-full h-full bg-white/5 border border-white/5 rounded-t-2xl p-4 flex flex-col items-center justify-center">
                  <p className="text-xs text-white text-center truncate w-full mb-1">{top3[1].name}</p>
                  <p className="text-xs text-slate-400">R$ {top3[1].total.toLocaleString('pt-BR')}</p>
                </div>
              </motion.div>
            ) : <div className="flex-1 max-w-[130px]" />}

            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "100%", opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
              className="flex-1 max-w-[150px] flex flex-col items-center gap-3"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">🥇</div>
              </div>
              <div className="w-full h-full bg-amber-500/5 border border-amber-500/20 rounded-t-2xl p-4 flex flex-col items-center justify-center">
                <p className="text-sm text-white text-center truncate w-full mb-1">{top3[0].name}</p>
                <p className="text-base text-amber-400">R$ {top3[0].total.toLocaleString('pt-BR')}</p>
                <div className="mt-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">Destaque do Mês</div>
              </div>
            </motion.div>

            {top3[2] ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "60%", opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 50 }}
                className="flex-1 max-w-[110px] flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg">🥉</div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-700/80 text-white text-xs rounded-full flex items-center justify-center">3</div>
                </div>
                <div className="w-full h-full bg-white/5 border border-white/5 rounded-t-2xl p-3 flex flex-col items-center justify-center">
                  <p className="text-xs text-white text-center truncate w-full mb-1">{top3[2].name}</p>
                  <p className="text-xs text-slate-400">R$ {top3[2].total.toLocaleString('pt-BR')}</p>
                </div>
              </motion.div>
            ) : <div className="flex-1 max-w-[110px]" />}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {top3.map((s, idx) => (
              <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">Conversão</p>
                  <span className="text-xs text-slate-300">{s.rate}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.rate}%` }}
                    transition={{ delay: 1, duration: 1.5 }}
                    className="h-full bg-slate-400 rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Negócios Fechados</span>
                  <span className="text-xs text-white">{s.deals}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
