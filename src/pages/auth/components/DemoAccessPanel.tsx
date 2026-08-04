import { Card } from "../../../components/ui/card";
import { ArrowRight, Fingerprint } from "lucide-react";
import { useAuth, TenantNiche } from "../../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const DEMO_ACCOUNTS = [
  {
    tenantName: "G-Tech Master", niche: "Master" as TenantNiche, isMaster: true,
    label: "G-Tech Administrador", badge: "SaaS Admin",
    desc: "Acesso completo a todas as empresas",
  },
  {
    tenantName: "SolarCorp Engenharia", niche: "Solar" as TenantNiche, isMaster: false,
    label: "Energia Solar", badge: "Tenant",
    desc: "Integrações de propostas e funil técnico",
  },
  {
    tenantName: "Imobiliária Prime", niche: "Imobiliária" as TenantNiche, isMaster: false,
    label: "Imobiliária", badge: "Tenant",
    desc: "Funil de corretores, visitas e contratos",
  },
  {
    tenantName: "Clínica Vida", niche: "Clínica" as TenantNiche, isMaster: false,
    label: "Clínica & Saúde", badge: "Tenant",
    desc: "Automação de agendamentos e follow-up",
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
    <Card className="p-8">
      <div className="flex items-center gap-2 mb-6 text-slate-400 text-sm">
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
            className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface)] border border-white/10 hover:border-white/20 transition-colors text-left group"
          >
            <div>
              <div className="font-medium text-white flex items-center gap-2">
                {acc.label}
                <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-slate-300">{acc.badge}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{acc.desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </Card>
  );
}
