import { Card } from "../../../components/ui/card";
import { ArrowRight, Fingerprint } from "lucide-react";
import { useAuth, TenantNiche } from "../../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const DEMO_ACCOUNTS = [
  {
    tenantName: "G-Tech Master", niche: "Master" as TenantNiche, isMaster: true,
    label: "G-Tech Administrador", badge: "SaaS Admin",
    badgeClass: "bg-[#2563EB] text-white",
    desc: "Acesso completo a todas as empresas",
    hoverClass: "hover:border-[#2563EB] hover:bg-[#2563EB]/10",
    borderClass: "border-[#2563EB]/40",
    iconColor: "text-[#2563EB]",
  },
  {
    tenantName: "SolarCorp Engenharia", niche: "Solar" as TenantNiche, isMaster: false,
    label: "Energia Solar", badge: "Tenant",
    badgeClass: "bg-yellow-500/20 text-yellow-500",
    desc: "Integrações de propostas e funil técnico",
    hoverClass: "hover:border-yellow-500/50 hover:bg-yellow-500/10",
    borderClass: "border-white/10",
    iconColor: "text-yellow-500",
  },
  {
    tenantName: "Imobiliária Prime", niche: "Imobiliária" as TenantNiche, isMaster: false,
    label: "Imobiliária", badge: "Tenant",
    badgeClass: "bg-emerald-500/20 text-emerald-400",
    desc: "Funil de corretores, visitas e contratos",
    hoverClass: "hover:border-emerald-500/50 hover:bg-emerald-500/10",
    borderClass: "border-white/10",
    iconColor: "text-emerald-500",
  },
  {
    tenantName: "Clínica Vida", niche: "Clínica" as TenantNiche, isMaster: false,
    label: "Clínica & Saúde", badge: "Tenant",
    badgeClass: "bg-rose-500/20 text-rose-400",
    desc: "Automação de agendamentos e follow-up",
    hoverClass: "hover:border-rose-500/50 hover:bg-rose-500/10",
    borderClass: "border-white/10",
    iconColor: "text-rose-500",
  },
];

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
    <Card className="p-8 bg-[#111827]/40 backdrop-blur-md border border-white/5 border-dashed">
      <div className="flex items-center gap-2 mb-6 text-slate-400 text-sm font-semibold uppercase tracking-widest">
        <Fingerprint className="w-4 h-4" /> Acesso Demonstração
      </div>
      <p className="text-slate-400 text-sm mb-6">
        Para testes do sistema, escolha um dos perfis pré-configurados abaixo para entrar com as parametrizações e permissões específicas de cada nicho.
      </p>
      <div className="space-y-3">
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.tenantName}
            onClick={() => loginAsDemo(acc.tenantName, acc.niche, acc.isMaster)}
            className={`w-full flex items-center justify-between p-4 rounded-xl bg-[#0B1120] border ${acc.borderClass} ${acc.hoverClass} transition-all text-left group`}
          >
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                {acc.label}
                <span className={`px-2 py-0.5 rounded text-[10px] ${acc.badgeClass}`}>{acc.badge}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{acc.desc}</div>
            </div>
            <ArrowRight className={`w-4 h-4 ${acc.iconColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
          </button>
        ))}
      </div>
    </Card>
  );
}
