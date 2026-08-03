import { useEffect, useState } from "react";
import { Building2, Users2, Receipt, Wallet, Handshake, Inbox } from "lucide-react";
import { PageContainer } from "../../components/PageContainer";
import { Card } from "../../components/ui/card";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

interface PlatformMetrics {
  total_tenants: number;
  total_leads: number;
  total_clientes: number;
  total_propostas: number;
  total_receita: number;
}

interface AttributedTenant {
  id: string;
  name: string;
  niche: string;
  status: string | null;
}

const currency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);

export default function PartnersOverview() {
  const { user } = useAuth();
  const hasAccess = !!user?.isMaster || !!user?.partnerId;

  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [tenants, setTenants] = useState<AttributedTenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !hasAccess) {
      setLoading(false);
      return;
    }

    let active = true;
    (async () => {
      // platform_metrics_overview() é SECURITY DEFINER e só devolve números
      // somados (nunca linha a linha) — tenant_partners é filtrado pela RLS
      // para só trazer os clientes atribuídos ao parceiro do usuário logado
      // (ou todos, se for super admin).
      const [{ data: metricsData, error: metricsError }, { data: tpData, error: tpError }] = await Promise.all([
        supabase.rpc("platform_metrics_overview"),
        supabase.from("tenant_partners").select("tenant_id, tenants (id, name, niche, status)"),
      ]);

      if (!active) return;

      if (metricsError) {
        console.error("[PartnersOverview] Erro ao carregar métricas agregadas:", metricsError.message);
      } else if (metricsData && metricsData[0]) {
        setMetrics(metricsData[0]);
      }

      if (tpError) {
        console.error("[PartnersOverview] Erro ao carregar tenants atribuídos:", tpError.message);
      } else if (tpData) {
        const list = tpData
          .map((row: any) => (Array.isArray(row.tenants) ? row.tenants[0] : row.tenants))
          .filter(Boolean);
        setTenants(list);
      }

      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <PageContainer title="Parceiros" description="Acesso restrito a organizações parceiras da plataforma Axis.">
        <Card className="p-10 flex flex-col items-center justify-center gap-3 text-center">
          <Handshake className="w-8 h-8 text-slate-500" />
          <span className="text-sm text-slate-400">Você não tem acesso a esta página.</span>
        </Card>
      </PageContainer>
    );
  }

  const metricItems = [
    { label: "Tenants na plataforma", value: metrics?.total_tenants ?? 0, icon: Building2 },
    { label: "Leads gerados", value: metrics?.total_leads ?? 0, icon: Users2 },
    { label: "Clientes cadastrados", value: metrics?.total_clientes ?? 0, icon: Building2 },
    { label: "Propostas emitidas", value: metrics?.total_propostas ?? 0, icon: Receipt },
    { label: "Receita total (a receber)", value: currency(metrics?.total_receita ?? 0), icon: Wallet },
  ];

  return (
    <PageContainer
      title="Parceiros"
      description="Clientes atribuídos à sua organização e números gerais da plataforma Axis."
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm text-slate-400 mb-3">Visão geral da plataforma</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {metricItems.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{label}</span>
                </div>
                <p className="text-2xl font-semibold text-white">{loading ? "—" : value}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-white-text/10">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Handshake className="w-4 h-4 text-slate-400" />
              Clientes atribuídos à sua organização
            </h3>
          </div>

          {tenants.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center gap-3 text-center">
              <Inbox className="w-8 h-8 text-slate-500" />
              <span className="text-sm text-slate-500">
                {loading ? "Carregando…" : "Nenhum cliente atribuído ainda."}
              </span>
            </div>
          ) : (
            <div className="divide-y divide-white-text/5">
              {tenants.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.niche}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${t.status === "Active" ? "bg-emerald-500" : "bg-slate-500"}`} />
                    {t.status ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
