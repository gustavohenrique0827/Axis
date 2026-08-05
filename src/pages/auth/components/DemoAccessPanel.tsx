import { Card } from "../../../components/ui/card";
import { ArrowRight, Fingerprint, Building2, Sun, Home, HeartPulse } from "lucide-react";
import { useAuth, TenantNiche } from "../../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const DEMO_ACCOUNTS = [
  {
    tenantName: "G-Tech Master", niche: "Master" as TenantNiche, isMaster: true,
    label: "G-Tech Administrador", badge: "SaaS Admin",
    desc: "Acesso completo a todas as empresas",
    icon: Building2, color: "blue",
  },
  {
    tenantName: "SolarCorp Engenharia", niche: "Solar" as TenantNiche, isMaster: false,
    label: "Energia Solar", badge: "Tenant",
    desc: "Integrações de propostas e funil técnico",
    icon: Sun, color: "amber",
  },
  {
    tenantName: "Imobiliária Prime", niche: "Imobiliária" as TenantNiche, isMaster: false,
    label: "Imobiliária", badge: "Tenant",
    desc: "Funil de corretores, visitas e contratos",
    icon: Home, color: "emerald",
  },
  {
    tenantName: "Clínica Vida", niche: "Clínica" as TenantNiche, isMaster: false,
    label: "Clínica & Saúde", badge: "Tenant",
    desc: "Automação de agendamentos e follow-up",
    icon: HeartPulse, color: "rose",
  },
];

const COLOR_STYLES: Record<string, { chip: string; icon: string; badge: string }> = {
  blue: { chip: "bg-blue-500/10 border-blue-500/20", icon: "text-blue-500", badge: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  amber: { chip: "bg-amber-500/10 border-amber-500/20", icon: "text-amber-500", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  emerald: { chip: "bg-emerald-500/10 border-emerald-500/20", icon: "text-emerald-500", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  rose: { chip: "bg-rose-500/10 border-rose-500/20", icon: "text-rose-500", badge: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
};

export function DemoAccessPanel() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/app/dashboard";

  const loginAsDemo = (tenantName: string, niche: TenantNiche, isMaster: boolean) => {
    login({
      name: `Admin ${niche}`,
      email: `admin@${tenantName.toLowerCase().replace(/\s+/g, "")}.com`,
      role: isMaster ? "Super Admin" : "Gerente",
      tenantName,
      tenantNiche: niche,
      isMaster,
    });
    navigate(from, { replace: true });
  };

  return (
    <Card className="p-8 bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] shadow-sm">
      <div className="flex items-center gap-2 mb-6 text-[var(--color-text-muted)] text-sm font-semibold">
        <Fingerprint className="w-4 h-4 text-[#2563EB]" /> Acesso Demonstração
      </div>
      <p className="text-[var(--color-text-muted)] text-sm mb-6">
        Para testar o sistema, escolha um dos perfis pré-configurados abaixo para entrar com as parametrizações e especificações de cada nicho.
      </p>
      <div className="space-y-3">
        {DEMO_ACCOUNTS.map((acc) => {
          const style = COLOR_STYLES[acc.color];
          const Icon = acc.icon;
          return (
            <button
              key={acc.tenantName}
              onClick={() => loginAsDemo(acc.tenantName, acc.niche, acc.isMaster)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] hover:border-[#2563EB]/40 hover:shadow-md transition-all text-left group"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${style.chip}`}>
                <Icon className={`w-5 h-5 ${style.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                  {acc.label}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${style.badge}`}>{acc.badge}</span>
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">{acc.desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--color-text-faint)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
            </button>
          );
        })}
      </div>
    </Card>
  );
}
