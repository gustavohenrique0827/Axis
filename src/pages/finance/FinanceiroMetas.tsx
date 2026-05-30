import React from "react";
import { Button } from "../../components/ui/button";
import { 
  Play, RotateCcw, Download
} from "lucide-react";
import { PageContainer } from "../../components/PageContainer";
import { useFinanceiroMetas } from "./metas/useFinanceiroMetas";
import { MetasOverview } from "./metas/MetasOverview";
import { SquadMetasSection } from "./metas/SquadMetasSection";
import { AdminMetasConfig } from "./metas/AdminMetasConfig";
import { ColaboradoresMetasSection } from "./metas/ColaboradoresMetasSection";

export default function FinanceiroMetas() {
  const {
    squads, setSquads,
    period, setPeriod,
    attentionThreshold, setAttentionThreshold,
    alerts, setAlerts,
    selectedSquadId, setSelectedSquadId,
    formName, setFormName,
    formFocus, setFormFocus,
    formMeta, setFormMeta,
    formBaseComissao, setFormBaseComissao,
    formBonusSuperador, setFormBonusSuperador,
    formPeriod, setFormPeriod,
    colaboradores, setColaboradores,
    selectedColabId, setSelectedColabId,
    colabName, setColabName,
    colabSquadId, setColabSquadId,
    colabMeta, setColabMeta,
    colabRealizado, setColabRealizado,
    oteActiveTab, setOteActiveTab,
    totalMeta,
    totalFaturamento,
    totalPercent,
    calculateOTE,
    historicalOTEData,
    projecaoInteligente,
    handleSimulateSale,
    handleResetSimulator,
    handleExportPDF,
    handleSliderChange
  } = useFinanceiroMetas();

  const actions = (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <div className="flex bg-[#0A1120] border border-white/10 rounded-xl p-1 shrink-0">
        {(["monthly", "quarterly", "annual"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              period === p 
                ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/10" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            {p === "monthly" ? "Mensal" : p === "quarterly" ? "Trimestral" : "Anual"}
          </button>
        ))}
      </div>
      
      <Button 
        onClick={handleSimulateSale}
        className="bg-emerald-600 hover:bg-emerald-550 text-white font-black text-[10px] uppercase tracking-widest gap-2 h-11 px-5 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
      >
        <Play className="w-4 h-4 text-emerald-300 animate-pulse" /> Simular Venda
      </Button>

      <Button 
        variant="outline"
        onClick={handleResetSimulator}
        className="border-white/10 text-slate-300 hover:text-white bg-white/5 h-11 px-4 rounded-xl text-[10px] uppercase font-bold tracking-wider"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </Button>

      <Button 
        onClick={handleExportPDF}
        className="bg-blue-600 hover:bg-blue-550 text-white font-black text-[10px] uppercase tracking-widest gap-2 h-11 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/10"
      >
        <Download className="w-3.5 h-3.5 text-blue-300" /> Exportar Relatório de Metas
      </Button>
    </div>
  );

  return (
    <PageContainer
      title="Campanhas de Metas & Comissionamento"
      description="Gerenciamento visual de targets corporativos, aceleradores OTE e distribuição de prêmios por Squad."
      actions={actions}
    >
      <MetasOverview
        period={period}
        totalFaturamento={totalFaturamento}
        totalMeta={totalMeta}
        totalPercent={totalPercent}
        squads={squads}
        calculateOTE={calculateOTE}
        oteActiveTab={oteActiveTab}
        setOteActiveTab={setOteActiveTab}
        historicalOTEData={historicalOTEData}
        projecaoInteligente={projecaoInteligente}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <SquadMetasSection
          period={period}
          squads={squads}
          calculateOTE={calculateOTE}
          handleSliderChange={handleSliderChange}
        />

        <AdminMetasConfig
          squads={squads}
          setSquads={setSquads}
          selectedSquadId={selectedSquadId}
          setSelectedSquadId={setSelectedSquadId}
          formName={formName}
          setFormName={setFormName}
          formFocus={formFocus}
          setFormFocus={setFormFocus}
          formMeta={formMeta}
          setFormMeta={setFormMeta}
          formBaseComissao={formBaseComissao}
          setFormBaseComissao={setFormBaseComissao}
          formBonusSuperador={formBonusSuperador}
          setFormBonusSuperador={setFormBonusSuperador}
          formPeriod={formPeriod}
          setFormPeriod={setFormPeriod}
          period={period}
          setPeriod={setPeriod}
          attentionThreshold={attentionThreshold}
          setAttentionThreshold={setAttentionThreshold}
          alerts={alerts}
          setAlerts={setAlerts}
        />
      </div>

      <ColaboradoresMetasSection
        period={period}
        colaboradores={colaboradores}
        setColaboradores={setColaboradores}
        squads={squads}
        selectedColabId={selectedColabId}
        setSelectedColabId={setSelectedColabId}
        colabName={colabName}
        setColabName={setColabName}
        colabSquadId={colabSquadId}
        setColabSquadId={setColabSquadId}
        colabMeta={colabMeta}
        setColabMeta={setColabMeta}
        colabRealizado={colabRealizado}
        setColabRealizado={setColabRealizado}
      />
    </PageContainer>
  );
}
