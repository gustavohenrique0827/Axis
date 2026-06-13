import { motion, AnimatePresence } from "motion/react";
import { Trophy } from "lucide-react";

export function DashboardGoalAlerts(props: { goalAlerts: Array<{ nome: string }> }) {
  const { goalAlerts } = props;

  return (
    <AnimatePresence>
      {goalAlerts.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden text-left"
        >
          <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                  Performace de Elite Detectada
                </h4>
                <p className="text-xs text-emerald-400/80 font-medium">
                  {goalAlerts.map((sq) => `${sq.nome}`).join(", ")} {goalAlerts.length > 1 ? "atingiram" : "atingiu"} 90%+ da meta mensal!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-lg uppercase tracking-wider">
                Meta Próxima
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

