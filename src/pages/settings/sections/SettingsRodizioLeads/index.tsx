import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shuffle, FileText, Users } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";
import { TabClosersCRM } from "./TabClosersCRM";
import { TabFormularioSDR } from "./TabFormularioSDR";

const TABS = [
  { key: "formulario", label: "Formulário – SDRs", icon: <FileText className="w-3.5 h-3.5" /> },
  { key: "closers",    label: "CRM – Closers",      icon: <Users    className="w-3.5 h-3.5" /> },
] as const;

export function ConfigRodizioLeads() {
  const { user, tenantIdMap } = useAuth();
  const tenantId = user?.tenantName ? tenantIdMap[user.tenantName] : undefined;
  const [tab, setTab] = useState<"closers" | "formulario">("formulario");

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-slate-400" /> Rodízio de Leads
        </h1>
        <p className="text-sm text-slate-400 mt-1">Configure a distribuição automática de leads entre SDRs e Closers.</p>
      </div>

      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-colors ${tab === t.key ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === "closers" && <TabClosersCRM />}
          {tab === "formulario" && tenantId && <TabFormularioSDR tenantId={tenantId} />}
          {tab === "formulario" && !tenantId && <p className="text-sm text-slate-500">Carregando contexto do usuário...</p>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
