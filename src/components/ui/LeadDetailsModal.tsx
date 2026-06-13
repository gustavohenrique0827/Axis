import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Modal } from "./modal";
import { Trophy, ThumbsDown, X, Phone, Activity, TrendingUp, Brain, ChevronRight, User, AlertTriangle } from "lucide-react";

import { LeadDetailsModalTabs } from "./lead-details/LeadDetailsModal.constants";
import { LeadDetailsTempCfg } from "./lead-details/LeadDetailsModal.constants";
import { formatLeadValueBRL, safeParseTimeIdle, safeParseProbability, handleMarkLead } from "./lead-details/LeadDetailsModal.helpers";
import { LeadDetailsModalFooter } from "./lead-details/LeadDetailsModal.Footer";
import { motion, AnimatePresence } from "motion/react";
import { useLeadDetails } from "./lead-details/useLeadDetails";
import { IACopilot } from "./IACopilot";
import { ProfileSection } from "./lead-details/ProfileSection";
import { TimelineSection } from "./lead-details/TimelineSection";
import { SdrReportSection } from "./lead-details/SdrReportSection";
import { MessagingSection } from "./lead-details/MessagingSection";
import { ProductsSection } from "./lead-details/ProductsSection";
import { LogsSection } from "./lead-details/LogsSection";
import { useData } from "../../contexts/DataContext";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { ConfirmModal } from "./ConfirmModal";

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
}



export function LeadDetailsModal({ isOpen, onClose, lead }: LeadDetailsModalProps) {
  const { updateLead, leadActivities } = useData();
  const [currentTab, setCurrentTab] = useState("informacoes");
  const [showCopilot, setShowCopilot] = useState(false);

  const {
    isConfirmDeleteOpen, setIsConfirmDeleteOpen,
    customFieldsState, setCustomFieldsState,
    activityType, setActivityType,
    activityDesc, setActivityDesc,
    activityTitle, setActivityTitle,
    activityDate, setActivityDate,
    activityTime, setActivityTime,
    activityError, setActivityError,
    selectedFiles, setSelectedFiles,
    isEditingInline, setIsEditingInline,
    leadName, setLeadName,
    companyName, setCompanyName,
    phone, setPhone,
    email, setEmail,
    title, setTitle,
    value, setValue,
    seller, setSeller,
    priority, setPriority,
    score,
    temperature,
    probability,
    slaStatus,
    timeIdle,
    customTags,
    newTagInput, setNewTagInput,
    alterationLogs, setAlterationLogs,
    estimatedSum,
    handleAddTag,
    handleRemoveTag,
    handleConvertLead,
    handleRegisterActivity,
    handleSaveAll,
    handleConfirmDelete,
    toggleProductLink,
    availableProducts,
    linkedProductIds,
    stagesDef,
    reportContextOverride, setReportContextOverride,
    tempColors,
    customLeadFields,
    applyMessageTemplate,
  } = useLeadDetails(lead, onClose);

  const handleSetActiveTab = useCallback((tab: string) => {
    const map: Record<string, string> = {
      timeline: "historico", sdrReport: "relatorio",
      whatsapp: "mensagens", products: "produtos",
      revenueIntel: "informacoes", logs: "logs",
    };
    setCurrentTab(map[tab] || tab);
  }, []);

  if (!lead) return null;

  const leadActs = leadActivities.filter((a: any) => a.leadId === lead.id);
  const timeIdleNum = safeParseTimeIdle(timeIdle);
  const probNum = safeParseProbability(probability);

  const tc = LeadDetailsTempCfg[temperature as keyof typeof LeadDetailsTempCfg] || LeadDetailsTempCfg.Frio;
  const TempIcon = tc.icon;

  const formattedValue = formatLeadValueBRL(value);

  const moveToStage = (stg: any) => {
    updateLead(lead.id, { stageId: stg.id, status: stg.status });
    toast.success(`Etapa: ${stg.name}`);
    setAlterationLogs((prev: any[]) => [
      {
        id: Date.now().toString(),
        author: seller || "Sistema",
        desc: `Moveu para '${stg.name}'`,
        time: "Agora",
      },
      ...prev,
    ]);
  };


  const initials = ((companyName || leadName || "LD").substring(0, 2)).toUpperCase();

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="max-w-[546px]"
        position="right"
        noPadding
        footer={
          <LeadDetailsModalFooter
            isEditingInline={isEditingInline}
            setIsEditingInline={setIsEditingInline}
            handleSaveAll={handleSaveAll}

            isConfirmDeleteOpen={isConfirmDeleteOpen}
            setIsConfirmDeleteOpen={setIsConfirmDeleteOpen}
            onClose={onClose}
            onConfirmDelete={handleConfirmDelete}
            companyName={companyName}
            leadName={leadName}
          />
        }
      >
        <div className="flex flex-col h-full bg-[#0B1120]">

          {/* ── Temperature stripe ── */}
          <div className={`h-[3px] shrink-0 bg-gradient-to-r ${tc.stripe}`} />

          {/* ── Hero Header ── */}
          <div className={`relative shrink-0 bg-gradient-to-b ${tc.hero} border-b border-white/[0.06]`}>

            {/* Top action bar */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              {/* Ganho + Perdido */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const lastStage = stagesDef[stagesDef.length - 1];
                    updateLead(lead.id, { stageId: lastStage?.id ?? "5", status: "Fechado" });
                    toast.success("Lead fechado como GANHO! 🏆");
                    setAlterationLogs((prev: any[]) => [
                      { id: Date.now().toString(), author: seller || "Sistema", desc: "MARCOU COMO GANHO", time: "Agora" },
                      ...prev,
                    ]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95"
                >
                  <Trophy className="w-3 h-3" /> Ganho
                </button>
                <button
                  onClick={() => {
                    updateLead(lead.id, { status: "Perdido" });
                    toast.warning("Lead marcado como Perdido.");
                    setAlterationLogs((prev: any[]) => [
                      { id: Date.now().toString(), author: seller || "Sistema", desc: "MARCOU COMO PERDIDO", time: "Agora" },
                      ...prev,
                    ]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-rose-500/10 active:scale-95"
                >
                  <ThumbsDown className="w-3 h-3" /> Perdido
                </button>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowCopilot((v) => !v)}
                  title="IA Copilot"
                  className={cn(
                    "p-1.5 rounded-lg border transition-all",
                    showCopilot
                      ? "bg-violet-500/20 border-violet-500/40 text-violet-400"
                      : "border-white/10 text-slate-500 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10"
                  )}
                >
                  <Brain className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors ml-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lead identity */}
            <div className="flex items-center gap-4 px-5 pb-4">
              {/* Avatar */}
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 ring-2 ring-offset-2 ring-offset-[#0B1120] select-none",
                tc.avatar
              )}>
                {initials}
              </div>

              {/* Name + value + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-white truncate leading-tight">
                    {companyName || leadName || <span className="text-slate-500 italic font-normal text-sm">Sem nome</span>}
                  </h2>
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0",
                    tc.badge
                  )}>
                    <TempIcon className="w-2.5 h-2.5" />
                    {tc.label}
                  </span>
                </div>

                {companyName && leadName && (
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <User className="w-3 h-3 shrink-0" />
                    <span className="truncate">{leadName}</span>
                  </p>
                )}

                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-sm font-black text-emerald-400 font-mono tracking-tight">
                    {formattedValue}
                  </span>
                  <span className="text-[9px] text-slate-600">·</span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    priority === "Alta"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      : priority === "Média"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-slate-700/40 border-white/10 text-slate-500"
                  )}>
                    ▲ {priority}
                  </span>
                  {slaStatus && (
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      slaStatus === "Em Dia"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : slaStatus === "Crítico"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    )}>
                      SLA · {slaStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stage pills */}
            <div className="flex items-center gap-2 px-5 pb-3 overflow-x-auto scrollbar-none">
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              {stagesDef.map((stg: any) => {
                const isActive = lead.stageId === stg.id;
                return (
                  <button
                    key={stg.id}
                    onClick={() => moveToStage(stg)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 transition-all border cursor-pointer",
                      isActive
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-500/25"
                        : "bg-[#111827] border-white/10 text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/5"
                    )}
                  >
                    {stg.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Tab bar ── */}
          <div className="flex border-b border-white/[0.06] overflow-x-auto scrollbar-none shrink-0 bg-[#0B1120]">
            {LeadDetailsModalTabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 pt-2.5 pb-2 px-4 border-b-2 text-[8px] font-black tracking-widest whitespace-nowrap transition-all shrink-0 cursor-pointer min-w-[68px] relative",
                    isActive
                      ? "border-[#06B6D4] text-[#06B6D4]"
                      : "border-transparent text-slate-500 hover:text-slate-300 hover:border-white/10"
                  )}
                >
                  <tab.icon className={cn("w-4 h-4 transition-transform", isActive && "scale-110")} />
                  <span>{tab.short}</span>
                  {isActive && (
                    <motion.div
                      layoutId="tab-active-dot"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Tab content ── */}
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >

                {/* ── INFORMAÇÕES ── */}
                {currentTab === "informacoes" && (
                  <div className="px-5 py-4 space-y-4">
                    {/* Stats trio */}
                    <div className="grid grid-cols-3 gap-2">

                      {/* Interações */}
                      <div className="bg-[#111827] border border-blue-500/10 rounded-xl p-3 text-center hover:border-blue-500/20 transition-colors group">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-1.5 group-hover:bg-blue-500/15 transition-colors">
                          <Activity className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div className="text-2xl font-black text-white tabular-nums leading-none">{leadActs.length}</div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1">Interações</div>
                      </div>

                      {/* Sem contato */}
                      <div className={cn(
                        "rounded-xl p-3 text-center border transition-colors",
                        timeIdleNum > 7 ? "bg-rose-500/10 border-rose-500/25"
                        : timeIdleNum > 3 ? "bg-amber-500/10 border-amber-500/20"
                        : "bg-[#111827] border-white/5"
                      )}>
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5",
                          timeIdleNum > 7 ? "bg-rose-500/15" : timeIdleNum > 3 ? "bg-amber-500/15" : "bg-slate-700/50"
                        )}>
                          {timeIdleNum > 7
                            ? <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                            : <Phone className={cn("w-3.5 h-3.5", timeIdleNum > 3 ? "text-amber-400" : "text-slate-500")} />
                          }
                        </div>
                        <div className={cn(
                          "text-2xl font-black tabular-nums leading-none",
                          timeIdleNum > 7 ? "text-rose-400" : timeIdleNum > 3 ? "text-amber-400" : "text-white"
                        )}>
                          {timeIdleNum}d
                        </div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1">Sem Contato</div>
                      </div>

                      {/* Probabilidade */}
                      <div className={cn(
                        "rounded-xl p-3 text-center border transition-colors",
                        probNum >= 70 ? "bg-emerald-500/10 border-emerald-500/20"
                        : probNum >= 40 ? "bg-amber-500/10 border-amber-500/15"
                        : "bg-[#111827] border-white/5"
                      )}>
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5",
                          probNum >= 70 ? "bg-emerald-500/15" : probNum >= 40 ? "bg-amber-500/15" : "bg-slate-700/50"
                        )}>
                          <TrendingUp className={cn(
                            "w-3.5 h-3.5",
                            probNum >= 70 ? "text-emerald-400" : probNum >= 40 ? "text-amber-400" : "text-slate-500"
                          )} />
                        </div>
                        <div className={cn(
                          "text-2xl font-black tabular-nums leading-none",
                          probNum >= 70 ? "text-emerald-400" : probNum >= 40 ? "text-amber-400" : "text-white"
                        )}>
                          {probNum}%
                        </div>
                        <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700",
                              probNum >= 70 ? "bg-emerald-400" : probNum >= 40 ? "bg-amber-400" : "bg-slate-600"
                            )}
                            style={{ width: `${probNum}%` }}
                          />
                        </div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1">Prob. Ganho</div>
                      </div>
                    </div>

                    {/* Profile section */}
                    <ProfileSection
                      lead={lead}
                      companyName={companyName}    setCompanyName={setCompanyName}
                      leadName={leadName}          setLeadName={setLeadName}
                      phone={phone}                setPhone={setPhone}
                      email={email}                setEmail={setEmail}
                      title={title}                setTitle={setTitle}
                      value={value}                setValue={setValue}
                      seller={seller}              setSeller={setSeller}
                      priority={priority}          setPriority={setPriority}
                      score={score}
                      temperature={temperature}
                      probability={probability}
                      slaStatus={slaStatus}
                      timeIdle={timeIdle}
                      customTags={customTags}
                      newTagInput={newTagInput}    setNewTagInput={setNewTagInput}
                      isEditingInline={isEditingInline}
                      setIsEditingInline={setIsEditingInline}
                      tempColors={tempColors}
                      customLeadFields={customLeadFields}
                      customFieldsState={customFieldsState}
                      setCustomFieldsState={setCustomFieldsState}
                      handleAddTag={handleAddTag}
                      handleRemoveTag={handleRemoveTag}
                      handleConvertLead={handleConvertLead}
                      setAlterationLogs={setAlterationLogs}
                      setActiveTab={handleSetActiveTab}
                      setChatChannel={() => {}}
                      applyMessageTemplate={applyMessageTemplate}
                      updateLead={updateLead}
                    />
                  </div>
                )}

                {/* ── HISTÓRICO ── */}
                {currentTab === "historico" && (
                  <div className="px-5 py-4">
                    <TimelineSection
                      lead={lead}
                      leadActivities={leadActivities}
                      activityType={activityType}        setActivityType={setActivityType}
                      activityTitle={activityTitle}      setActivityTitle={setActivityTitle}
                      activityDate={activityDate}        setActivityDate={setActivityDate}
                      activityTime={activityTime}        setActivityTime={setActivityTime}
                      activityDesc={activityDesc}        setActivityDesc={setActivityDesc}
                      activityError={activityError}      setActivityError={setActivityError}
                      selectedFiles={selectedFiles}      setSelectedFiles={setSelectedFiles}
                      handleRegisterActivity={handleRegisterActivity}
                      seller={seller}
                    />
                  </div>
                )}

                {/* ── RELATÓRIO IA ── */}
                {currentTab === "relatorio" && (
                  <div className="px-5 py-4">
                    <SdrReportSection
                      lead={lead}
                      reportContextOverride={reportContextOverride}
                      setReportContextOverride={setReportContextOverride}
                      leadName={leadName}
                      companyName={companyName}
                      seller={seller}
                      score={score}
                    />
                  </div>
                )}

                {/* ── CHAT ── */}
                {currentTab === "mensagens" && (
                  <div className="px-5 py-4">
                    <MessagingSection
                      leadName={leadName}
                      companyName={companyName}
                      seller={seller}
                    />
                  </div>
                )}

                {/* ── PRODUTOS ── */}
                {currentTab === "produtos" && (
                  <div className="px-5 py-4">
                    <ProductsSection
                      estimatedSum={estimatedSum}
                      availableProducts={availableProducts}
                      linkedProductIds={linkedProductIds}
                      toggleProductLink={toggleProductLink}
                      seller={seller}
                      setAlterationLogs={setAlterationLogs}
                    />
                  </div>
                )}

                {/* ── LOGS ── */}
                {currentTab === "logs" && (
                  <div className="px-5 py-4">
                    <LogsSection alterationLogs={alterationLogs} />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Modal>

      {/* IA Copilot panel */}
      {isOpen && showCopilot && createPortal(
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          className="fixed top-0 bottom-0 right-[546px] w-[300px] z-[100] bg-[#070E1A] border-r border-white/10 overflow-y-auto shadow-2xl rounded-l-2xl"
        >
          <IACopilot leadName={leadName} companyName={companyName} />
        </motion.div>,
        document.body
      )}

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remover Lead Permanentemente?"
        message={`Você tem certeza ABSOLUTA de que deseja deletar o lead "${companyName || leadName}"? Todos os relatórios de alteração, e-mails de interações e produtos vinculados no faturamento serão destruídos.`}
      />
    </>
  );
}
