import { motion, AnimatePresence } from "motion/react";
import { Trophy } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

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
          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-panel)] p-4 flex items-center justify-between gap-4 mb-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                  Performance de Alta Eficiência
                </h4>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {goalAlerts.map((sq) => `${sq.nome}`).join(", ")} {goalAlerts.length > 1 ? "atingiram" : "atingiu"} 90%+ da meta mensal!
                </p>
              </div>
            </div>
            <Badge variant="success" dot dotPulse>
              Meta Próxima
            </Badge>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
