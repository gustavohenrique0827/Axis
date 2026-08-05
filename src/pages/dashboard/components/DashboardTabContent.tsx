import { StrategicalView } from "./StrategicalView";
import { CommercialView } from "./CommercialView";
import { MarketingView } from "./MarketingView";
import { CustomerSuccessView } from "./CustomerSuccessView";

export function DashboardTabContent(props: {
  activeTab: "executivo" | "comercial" | "marketing" | "sucesso";
  comparisonPeriod: "month" | "year";
  setComparisonPeriod: (p: "month" | "year") => void;
  performanceData: any[];
  squads: any[];
  contracts: any[];
  salesRanking: any[];
  funnelData: any[];
  recentActivities: any[];
}) {
  const {
    activeTab,
    comparisonPeriod,
    setComparisonPeriod,
    performanceData,
    squads,
    contracts,
    salesRanking,
    funnelData,
    recentActivities,
  } = props;

  return (
    <>
      {activeTab === "executivo" && (
        <StrategicalView
          comparisonPeriod={comparisonPeriod}
          setComparisonPeriod={setComparisonPeriod}
          performanceData={performanceData}
          squads={squads}
          contracts={contracts}
        />
      )}

      {activeTab === "comercial" && (
        <CommercialView
          salesRanking={salesRanking}
          funnelData={funnelData}
          recentActivities={recentActivities}
        />
      )}

      {activeTab === "marketing" && <MarketingView />}

      {activeTab === "sucesso" && <CustomerSuccessView />}
    </>
  );
}

