import { Gauge, Zap, Megaphone, HeartHandshake } from "lucide-react";

type TabId = "executivo" | "comercial" | "marketing" | "sucesso";

export function DashboardActionsTabs(props: {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}) {
  const { activeTab, onTabChange } = props;

  return (
    <div className="flex bg-[var(--color-surface-elevated)]/80 border border-white/5 rounded-2xl p-1 w-fit gap-1">
      {[
        { id: "executivo" as const, label: "Estratégico", icon: Gauge },
        { id: "comercial" as const, label: "Comercial", icon: Zap },
        { id: "marketing" as const, label: "Marketing", icon: Megaphone },
        { id: "sucesso" as const, label: "Retenção", icon: HeartHandshake },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer border-none bg-transparent ${
            activeTab === tab.id
              ? "bg-white/10 text-white"
              : "text-slate-500 hover:text-white"
          }`}
        >
          <tab.icon className="w-4 h-4" /> {tab.label}
        </button>
      ))}
    </div>
  );
}
