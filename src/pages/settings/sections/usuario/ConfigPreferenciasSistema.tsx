import { useState, useEffect } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { 
  Sliders, Sun, Moon, Laptop, Globe, DollarSign, 
  Volume2, VolumeX, Eye, Columns3, Check, Save
} from "lucide-react";
import { toast } from "sonner";

export function ConfigPreferenciasSistema() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    return (localStorage.getItem("axis_theme_pref") as any) || "dark";
  });

  const [language, setLanguage] = useState("pt-BR");
  const [currency, setCurrency] = useState("BRL");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [defaultCrmView, setDefaultCrmView] = useState<"kanban" | "list">("kanban");
  const [compactCards, setCompactCards] = useState(false);

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("axis_theme_pref", newTheme);

    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  };

  const handleSave = () => {
    toast.success("Preferências do sistema salvas com sucesso!");
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
          Preferências do Sistema <Sliders className="w-5 h-5 text-[var(--color-primary-blue)]" />
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Personalize a interface, modos de visualização, idioma, moeda e alertas visuais do Axis.
        </p>
      </div>

      {/* Theme Selector */}
      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
          <Sun className="w-4 h-4 text-amber-500" /> Aparência & Tema
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: "dark", label: "Modo Escuro (Dark)", icon: Moon, desc: "Tema padrão com alto contraste" },
            { id: "light", label: "Modo Claro (Light)", icon: Sun, desc: "Superfície clara para ambientes iluminados" },
            { id: "system", label: "Seguir Sistema", icon: Laptop, desc: "Alterna automaticamente com o SO" },
          ].map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTheme(t.id as any)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "bg-[var(--color-primary-blue)]/10 border-[var(--color-primary-blue)] text-[var(--color-primary-blue)] shadow-xs"
                    : "bg-[var(--color-surface-sunken)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:border-[var(--color-border-default)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <t.icon className={`w-5 h-5 ${isSelected ? "text-[var(--color-primary-blue)]" : "text-[var(--color-text-muted)]"}`} />
                  {isSelected && <Check className="w-4 h-4 text-[var(--color-primary-blue)]" />}
                </div>
                <div>
                  <p className="text-xs font-bold">{t.label}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Regional & Formats */}
      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
          <Globe className="w-4 h-4 text-[var(--color-primary-blue)]" /> Idioma & Moeda
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1.5 block">Idioma da Plataforma</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (United States)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-text-muted)] mb-1.5 block">Moeda Padrão</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none"
            >
              <option value="BRL">Real Brasileiro (R$ - BRL)</option>
              <option value="USD">Dólar Americano ($ - USD)</option>
              <option value="EUR">Euro (€ - EUR)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* CRM & Workspace Experience */}
      <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
          <Columns3 className="w-4 h-4 text-[var(--color-primary-blue)]" /> Visualização & Alertas do CRM
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-[var(--radius-control)]">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-primary)]">Visualização Inicial do Pipeline</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Escolha entre visão Kanban (colunas) ou Lista tabular ao abrir o CRM.</p>
            </div>
            <div className="flex gap-1.5 bg-[var(--color-surface-elevated)] p-1 rounded-lg border border-[var(--color-border-default)]">
              <button
                type="button"
                onClick={() => setDefaultCrmView("kanban")}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${defaultCrmView === "kanban" ? "bg-[var(--color-primary-blue)] !text-white" : "text-[var(--color-text-muted)]"}`}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setDefaultCrmView("list")}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${defaultCrmView === "list" ? "bg-[var(--color-primary-blue)] !text-white" : "text-[var(--color-text-muted)]"}`}
              >
                Lista
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] rounded-[var(--radius-control)]">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-primary)]">Alertas Sonoros</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Emitir som sutil ao receber novo lead ou notificação urgente.</p>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${soundEnabled ? "bg-[var(--color-primary-blue)]/10 border-[var(--color-primary-blue)]/30 text-[var(--color-primary-blue)]" : "bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] text-[var(--color-text-muted)]"}`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <Button onClick={handleSave} className="h-9 px-5 text-xs font-bold gap-1.5 shadow-xs">
            <Save className="w-3.5 h-3.5" /> Salvar Preferências
          </Button>
        </div>
      </Card>
    </div>
  );
}

