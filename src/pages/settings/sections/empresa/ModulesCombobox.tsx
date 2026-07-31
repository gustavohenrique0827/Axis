import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export const ALL_MODULES: { id: string; label: string; desc: string }[] = [
  { id: "crm",          label: "CRM & Pipeline",        desc: "Leads, funil e SDR IA" },
  { id: "financeiro",   label: "Financeiro",             desc: "Painel, entradas, saídas e DRE" },
  { id: "engajamento",  label: "Engajamento",            desc: "WhatsApp, e-mail e automações" },
  { id: "marketing",    label: "Marketing",              desc: "Campanhas, conteúdo e social" },
  { id: "educacao",     label: "Educação",               desc: "Turmas, alunos e certificados" },
  { id: "clinica",      label: "Clínica & Saúde",        desc: "Prontuários e agendamento" },
  { id: "rh",           label: "RH & Colaboradores",     desc: "Equipe interna e comissões" },
  { id: "bi",           label: "BI & Indicadores",       desc: "Relatórios e estatísticas" },
  { id: "produtividade",label: "Tarefas & Kanban",       desc: "Afazeres e produtividade" },
  { id: "catalogo",     label: "Catálogo de Produtos",   desc: "Estoque, SKUs e iPhones" },
  { id: "dev",          label: "Dev & Tecnologia",       desc: "Projetos, sprints e repositórios" },
];

interface ModulesComboboxProps {
  selected: string[];
  onChange: (v: string[]) => void;
}

export function ModulesCombobox({ selected, onChange }: ModulesComboboxProps) {
  const [open, setOpen] = useState(false);
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  const displayText =
    selected.length === 0
      ? "Selecione os módulos..."
      : selected.length === ALL_MODULES.length
      ? "Todos os módulos"
      : `${selected.length} módulo${selected.length !== 1 ? "s" : ""} selecionado${selected.length !== 1 ? "s" : ""}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#2563EB] focus:outline-none transition-all flex items-center justify-between text-left"
      >
        <span className={selected.length === 0 ? "text-slate-600" : "text-white"}>{displayText}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--color-surface)] border border-white/10 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
            <button type="button" onClick={() => onChange(ALL_MODULES.map((m) => m.id))} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">Todos</button>
            <span className="text-slate-700">·</span>
            <button type="button" onClick={() => onChange([])} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors">Limpar</button>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {ALL_MODULES.map((mod) => {
              const checked = selected.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggle(mod.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-white/[0.04] ${checked ? "bg-blue-600/[0.06]" : ""}`}
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${checked ? "bg-blue-600 border-blue-600" : "border-white/20"}`}>
                    {checked && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-[11px] font-black text-white">{mod.label}</div>
                    <div className="text-[9px] text-slate-500 font-bold truncate">{mod.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
