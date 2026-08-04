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
              <Trophy className="w-4 h-4 text-emerald-400" />
              <div>
                <h4 className="text-sm text-white">
                  Performace de Elite Detectada
                </h4>
                <p className="text-xs text-slate-400">
                  {goalAlerts.map((sq) => `${sq.nome}`).join(", ")} {goalAlerts.length > 1 ? "atingiram" : "atingiu"} 90%+ da meta mensal!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Meta Próxima
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
