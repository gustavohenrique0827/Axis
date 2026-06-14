import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Modal } from "./modal";
import { Phone, Activity, TrendingUp, AlertTriangle } from "lucide-react";

import { LeadDetailsModalTabs } from "./lead-details/LeadDetailsModal.constants";
import { LeadDetailsTempCfg } from "./lead-details/LeadDetailsModal.constants";
import { formatLeadValueBRL, safeParseTimeIdle, safeParseProbability } from "./lead-details/LeadDetailsModal.helpers";
import { LeadDetailsModalFooter } from "./lead-details/LeadDetailsModal.Footer";
import { LeadDetailsModalHero } from "./lead-details/LeadDetailsModalHero";
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
import { ConfirmModal } from "./modals/shared/ConfirmModal";

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
  const formattedValue = formatLeadValueBRL(value);
  const initials = ((companyName || leadName || "LD").substring(0, 2)).toUpperCase();

  const moveToStage = (stg: any) => {
    updateLead(lead.id, { stageId: stg.id, status: stg.status });
    toast.success(`Etapa: ${stg.name}`);
    setAlterationLogs((prev: any[]) => [
      { id: Date.now().toString(), author: seller || "Sistema", desc: `Moveu para '${stg.name}'`, time: "Agora" },
      ...prev,
    ]);
  };

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

          <LeadDetailsModalHero
            tc={tc}
            initials={initials}
            companyName={companyName}
            leadName={leadName}
            formattedValue={formattedValue}
            priority={priority}
            slaStatus={slaStatus}
            stagesDef={stagesDef}
            lead={lead}
            seller={seller}
            setAlterationLogs={setAlterationLogs}
            updateLead={updateLead}
            showCopilot={showCopilot}
            setShowCopilot={setShowCopilot}
            onClose={onClose}
            moveToStage={moveToStage}
          />

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
                {currentTab === "informacoes" && (
                  <div className="px-5 py-4 space-y-4">
                    {/* Stats trio */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#111827] border border-blue-500/10 rounded-xl p-3 text-center hover:border-blue-500/20 transition-colors group">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-1.5 group-hover:bg-blue-500/15 transition-colors">
                          <Activity className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div className="text-2xl font-black text-white tabular-nums leading-none">{leadActs.length}</div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1">Interações</div>
                      </div>

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

                {currentTab === "mensagens" && (
                  <div className="px-5 py-4">
                    <MessagingSection
                      leadName={leadName}
                      companyName={companyName}
                      seller={seller}
                    />
                  </div>
                )}

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
