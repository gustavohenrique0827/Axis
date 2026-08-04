import { Terminal, Rocket } from "lucide-react";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { DevKPIs } from "./components/DevKPIs";
import { SprintVelocityChart } from "./components/SprintVelocityChart";
import { DeploysChart } from "./components/DeploysChart";
import { DevRecentActivity } from "./components/DevRecentActivity";
import { DevEnvironmentStatus } from "./components/DevEnvironmentStatus";

export default function PainelDev() {
  return (
    <PageContainer
      title="Painel Dev & Tecnologia"
      description="Visão geral da operação de desenvolvimento — sprints, deploys, issues e saúde dos ambientes."
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 rounded-xl border-white/5 text-xs gap-2">
            <Terminal className="w-4 h-4" /> Sprint Atual
          </Button>
          <Button className="rounded-xl h-10 px-6 text-xs gap-2">
            <Rocket className="w-4 h-4" /> Novo Deploy
          </Button>
        </div>
      }
    >
      <div className="max-w-[1700px] mx-auto space-y-6 pb-10">
        <DevKPIs />

        <div className="grid lg:grid-cols-3 gap-6">
          <SprintVelocityChart />
          <DeploysChart />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <DevRecentActivity />
          <DevEnvironmentStatus />
        </div>
      </div>
    </PageContainer>
  );
}
