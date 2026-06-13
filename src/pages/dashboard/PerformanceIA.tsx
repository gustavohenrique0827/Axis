import {
   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';
import { PageContainer } from "../../components/PageContainer";

import { PerformanceIAEngineCards } from "./components/PerformanceIA/PerformanceIAEngineCards";
import { PerformanceIAWhatIfSimulator } from "./components/PerformanceIA/PerformanceIAWhatIfSimulator";
import { PerformanceIADeepLearningInsights } from "./components/PerformanceIA/PerformanceIADeepLearningInsights";
import { usePerformanceIA } from "./components/PerformanceIA/usePerformanceIA";

export default function PerformanceIA() {
  const {
    isSimulating,
    aiRecommendations,
    simulationData,
    runSimulation,
  } = usePerformanceIA();

  return (
    <PageContainer
      title="Cérebro Performance IA"
      description="Simulações avançadas e auditoria preditiva baseada em redes neurais."
    >
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        {/* AI Engine Status */}
        <PerformanceIAEngineCards
          simulationData={simulationData}
          isSimulating={isSimulating}
        />

        {/* What-If Simulator + Recomendações */}
        <PerformanceIAWhatIfSimulator
          isSimulating={isSimulating}
          runSimulation={runSimulation}
          simulationData={simulationData}
          aiRecommendations={aiRecommendations}
        />

        {/* Deep Learning Insights */}
        <PerformanceIADeepLearningInsights
          simulationData={simulationData}
        />
      </div>
    </PageContainer>
  );
}

