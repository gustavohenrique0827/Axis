import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Play, RotateCcw, Download, Users, Settings2, UserCog
} from "lucide-react";
import { PageContainer } from "../../components/PageContainer";
import { useFinanceiroMetas } from "./metas/useFinanceiroMetas";
import { MetasOverview, BalancoGeralBanner } from "./metas/MetasOverview";
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

  const [section, setSection] = useState<'squads' | 'admin' | 'colaboradores'>('squads');

  const SECTION_TABS = [
    { key: 'squads' as const, label: 'Squads & OTE', icon: Users },
    { key: 'admin' as const, label: 'Configuração Admin', icon: Settings2 },
    { key: 'colaboradores' as const, label: 'Colaboradores', icon: UserCog },
  ];

  const actions = (
    <div className="flex flex-wrap items-center justify-end gap-2 print:hidden max-w-full">
      <div className="flex bg-[var(--color-surface)] border border-white/10 rounded-xl p-1 shrink-0 glass-card">
        {(["monthly", "quarterly", "annual"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
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
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest gap-1.5 h-10 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
      >
        <Play className="w-3.5 h-3.5 text-emerald-300 animate-pulse" /> Simular Venda
      </Button>

      <Button
        variant="outline"
        onClick={handleResetSimulator}
        className="border-white/10 text-slate-300 hover:text-white bg-white/5 h-10 px-3 rounded-xl text-[10px] uppercase font-bold tracking-wider"
        title="Resetar simulação"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </Button>

      <Button
        onClick={handleExportPDF}
        className="bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest gap-1.5 h-10 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/10"
        title="Exportar Relatório de Metas em PDF"
      >
        <Download className="w-3.5 h-3.5 text-blue-300" /> Exportar PDF
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

      {/* Section tabs — keeps each view within the viewport instead of stacking everything */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-1.5 shadow-xl shadow-black/10 scrollbar-none mt-4">
        {SECTION_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setSection(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wide whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              section === t.key
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25 shadow-sm shadow-blue-500/10'
                : 'text-slate-400 border border-transparent hover:text-white hover:bg-white/5'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {section === 'squads' && (
          <>
            <BalancoGeralBanner totalFaturamento={totalFaturamento} totalMeta={totalMeta} />
            <SquadMetasSection
              period={period}
              squads={squads}
              calculateOTE={calculateOTE}
              handleSliderChange={handleSliderChange}
            />
          </>
        )}

        {section === 'admin' && (
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
        )}

        {section === 'colaboradores' && (
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
        )}
      </div>
    </PageContainer>
  );
}
