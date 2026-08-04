import React, { useState, useMemo } from "react";
import { Activity, Server, DollarSign, TerminalSquare, Bell, Plus, Shield } from "lucide-react";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { setupMasterUser } from "../../lib/supabase";
import { toast } from "sonner";
import { ModuleConfigModal } from "./components/ModuleConfigModal";
import { AdminOverviewTab } from "./components/AdminOverviewTab";
import { AdminTenantsTab } from "./components/AdminTenantsTab";
import { AdminBillingTab } from "./components/AdminBillingTab";
import { AdminLogsTab } from "./components/AdminLogsTab";

const TABS = [
  { id: "overview", label: "Visão Geral", icon: Activity },
  { id: "tenants", label: "Tenants & Instâncias", icon: Server },
  { id: "billing", label: "Faturamento", icon: DollarSign },
  { id: "logs", label: "Logs do Sistema", icon: TerminalSquare },
];

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-white/10 p-3 rounded-lg shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        <p className="text-slate-300 text-sm">R$ {(payload[0].value / 1000).toFixed(0)}k</p>
      </div>
    );
  }
  return null;
};

export default function AdminSaaS() {
  const [activeTab, setActiveTab] = useState("overview");
  const [settingUpMaster, setSettingUpMaster] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [crmEnabled, setCrmEnabled] = useState(true);
  const [sdrEnabled, setSdrEnabled] = useState(false);
  const [advDashboardEnabled, setAdvDashboardEnabled] = useState(false);

  const { getTenantModules, updateTenantModules } = useAuth();
  const { financeEntries } = useData();

  const revenueData = useMemo(() => {
    const months: Record<string, { name: string; mrr: number }> = {};
    financeEntries
      .filter((f) => f.type === "Receber" && f.status === "Pago")
      .forEach((f) => {
        try {
          const d = new Date(f.date || "");
          if (isNaN(d.getTime())) return;
          const month = d.toLocaleDateString("pt-BR", { month: "short" });
          if (!months[month]) months[month] = { name: month, mrr: 0 };
          months[month].mrr += f.value;
        } catch {}
      });
    return Object.values(months);
  }, [financeEntries]);

  const globalMrr = revenueData.reduce((acc, curr) => acc + curr.mrr, 0);

  const handleSetupMaster = async () => {
    setSettingUpMaster(true);
    const result = await setupMasterUser();
    setSettingUpMaster(false);
    if (result.success) {
      toast.success(result.alreadyExists ? "Usuário master gthec já existe — permissões verificadas." : "Usuário master admin@gthec.com criado! Senha: gthec@2025");
    } else {
      toast.error(`Erro: ${result.error}`);
    }
  };

  const handleOpenModules = (tenantName: string) => {
    setSelectedTenant(tenantName);
    const mods = getTenantModules(tenantName);
    setCrmEnabled(mods.crm);
    setSdrEnabled(mods.sdr);
    setAdvDashboardEnabled(mods.advDashboard);
  };

  const handleSaveModules = () => {
    if (selectedTenant) {
      updateTenantModules(selectedTenant, { crm: crmEnabled, sdr: sdrEnabled, advDashboard: advDashboardEnabled });
      toast.success(`Módulos do tenant "${selectedTenant}" atualizados com sucesso!`);
      setSelectedTenant(null);
    }
  };

  return (
    <PageContainer
      title="Gestão de Infraestrutura Axis"
      description="Controle centralizado de instâncias, faturamento e saúde global da plataforma."
      actions={
        <div className="flex gap-2">
          <Button onClick={handleSetupMaster} disabled={settingUpMaster} variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            {settingUpMaster ? "Configurando..." : "Setup Master gthec"}
          </Button>
          <Button variant="outline" disabled>
            <Bell className="w-4 h-4 mr-2" /> Alertas
          </Button>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" /> Novo Tenant
          </Button>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 mb-8 pb-2 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <AdminOverviewTab globalMrr={globalMrr} revenueData={revenueData} CustomTooltip={CustomTooltip} />
      )}
      {activeTab === "tenants" && <AdminTenantsTab />}
      {activeTab === "billing" && (
        <AdminBillingTab revenueData={revenueData} CustomTooltip={CustomTooltip} />
      )}
      {activeTab === "logs" && <AdminLogsTab />}

      {selectedTenant && (
        <ModuleConfigModal
          selectedTenant={selectedTenant}
          setSelectedTenant={setSelectedTenant}
          crmEnabled={crmEnabled}
          setCrmEnabled={setCrmEnabled}
          sdrEnabled={sdrEnabled}
          setSdrEnabled={setSdrEnabled}
          advDashboardEnabled={advDashboardEnabled}
          setAdvDashboardEnabled={setAdvDashboardEnabled}
          handleSaveModules={handleSaveModules}
        />
      )}
    </PageContainer>
  );
}
