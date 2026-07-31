import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { FileText, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../contexts/AuthContext";
import { FormDetail, type FormDefinition } from "./components/Formularios/FormDetail";

const FORMS: FormDefinition[] = [
  {
    id:          "metodo_eplus",
    name:        "Método E+ — O Despertar do Empreendedor",
    description: "Formulário de inscrição da landing page E-EMPREENDA+.",
    previewUrl:  import.meta.env.DEV
                   ? "http://localhost:5175/inscricao"
                   : "https://escolaempreendamais.pluppex.com.br/inscricao",
    source:      "landing_empreenda",
    active:      true,
  },
];

export default function MarketingFormularios() {
  const { user, tenantIdMap } = useAuth();
  const tenantId = user?.tenantName ? tenantIdMap[user.tenantName] : undefined;
  const [selected, setSelected] = useState<FormDefinition | null>(null);

  return (
    <PageContainer
      title="Formulários"
      subtitle="Gerencie formulários de captação de leads conectados ao CRM."
    >
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setSelected(null)}
                className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                Formulários
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[11px] font-black text-white uppercase tracking-widest truncate">{selected.name}</span>
            </div>
            {tenantId
              ? <FormDetail form={selected} tenantId={tenantId} />
              : <p className="text-sm text-slate-500">Carregando contexto do usuário...</p>
            }
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid gap-4">
              {FORMS.map(form => (
                <button key={form.id} onClick={() => setSelected(form)}
                  className="group text-left w-full flex items-center gap-5 p-5 bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-2xl hover:border-white/15 hover:bg-white/[0.04] transition-all">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-black text-white truncate">{form.name}</h3>
                      {form.active && (
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase shrink-0">
                          Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">{form.description}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{form.previewUrl}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
