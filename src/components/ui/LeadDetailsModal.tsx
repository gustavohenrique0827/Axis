import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Modal } from "./modal";
import { Button } from "./button";
import { ConfirmModal } from "./ConfirmModal";
import {
  Trophy, ThumbsDown, Trash, X,
  Phone, Activity, TrendingUp, Brain,
} from "lucide-react";
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

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
}

const TABS = [
  { id: "informacoes", label: "INFORMAÇÕES" },
  { id: "historico",   label: "HISTÓRICO"   },
  { id: "relatorio",   label: "⚡ RELATÓRIO IA" },
  { id: "mensagens",   label: "MENSAGENS"   },
  { id: "produtos",    label: "PRODUTOS"    },
  { id: "logs",        label: "LOGS"        },
];

const TEMP_COLOR: Record<string, string> = {
  quente: "text-rose-400", Quente: "text-rose-400", Hot: "text-rose-400",
  morno:  "text-amber-400", Morno: "text-amber-400", Warm: "text-amber-400",
  frio:   "text-blue-400",  Frio:  "text-blue-400",  Cold: "text-blue-400",
};

export function LeadDetailsModal({ isOpen, onClose, lead }: LeadDetailsModalProps) {
  const { updateLead } = useData();
  const { leadActivities } = useData();
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

  // Map old tab IDs from ProfileSection callbacks to new tab IDs
  const handleSetActiveTab = useCallback((tab: string) => {
    const map: Record<string, string> = {
      timeline:     "historico",
      sdrReport:    "relatorio",
      whatsapp:     "mensagens",
      products:     "produtos",
      revenueIntel: "informacoes",
      logs:         "logs",
    };
    setCurrentTab(map[tab] || tab);
  }, []);

  if (!lead) return null;

  const leadActs = leadActivities.filter((a: any) => a.leadId === lead.id);
  const timeIdleNum = typeof timeIdle === "number" ? timeIdle : 0;
  const probNum = Math.round(Number(probability) || 0);

  const formattedValue = new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL",
  }).format(
    parseFloat(String(value ?? "0").replace(/[^\d,.-]/g, "").replace(",", ".")) || 0
  );

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
          <div className="flex items-center justify-between w-full gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="border-white/5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 gap-1.5 h-9 px-4"
            >
              <Trash className="w-4 h-4" /> Excluir
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} className="text-slate-400 font-bold px-4 h-9">
                Fechar
              </Button>
              {isEditingInline ? (
                <Button onClick={handleSaveAll} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 h-9">
                  Salvar
                </Button>
              ) : (
                <Button onClick={() => setIsEditingInline(true)} className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-5 h-9">
                  Editar
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="flex h-full">

          {/* ── Lead details (full width) ── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

            {/* ── Header: avatar + name + stats + actions ── */}
            <div className="px-5 pt-4 pb-3 border-b border-white/5 shrink-0 space-y-3">

              {/* Row 1: identity + action buttons */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600/30 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center text-sm font-black text-blue-300 shrink-0">
                    {(companyName || leadName || "?")[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-black text-white truncate">
                        {companyName || leadName}
                      </h2>
                      {lead.clientName && (
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full shrink-0">
                          {lead.clientName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-emerald-400 font-mono font-bold">{formattedValue}</span>
                      {temperature && (
                        <span className={`text-[10px] font-bold ${TEMP_COLOR[temperature] || "text-slate-400"}`}>
                          ● {temperature}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setShowCopilot((v) => !v)}
                    title="IA Copilot"
                    className={`p-1.5 rounded-lg border transition-all ${
                      showCopilot
                        ? "bg-violet-500/20 border-violet-500/40 text-violet-400"
                        : "border-white/10 text-slate-500 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10"
                    }`}
                  >
                    <Brain className="w-4 h-4" />
                  </button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const lastStage = stagesDef[stagesDef.length - 1];
                      updateLead(lead.id, { stageId: lastStage?.id ?? "5", status: "Fechado" });
                      toast.success("Lead fechado como GANHO! 🏆");
                      setAlterationLogs((prev: any[]) => [
                        { id: Date.now().toString(), author: seller || "Sistema", desc: "MARCOU COMO GANHO", time: "Agora" },
                        ...prev,
                      ]);
                    }}
                    className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 h-8 px-3 rounded-full gap-1.5 text-[10px] font-bold"
                  >
                    <Trophy className="w-3.5 h-3.5" /> Ganho
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateLead(lead.id, { status: "Perdido" });
                      toast.warning("Lead marcado como Perdido.");
                      setAlterationLogs((prev: any[]) => [
                        { id: Date.now().toString(), author: seller || "Sistema", desc: "MARCOU COMO PERDIDO", time: "Agora" },
                        ...prev,
                      ]);
                    }}
                    className="text-rose-400 border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 h-8 px-3 rounded-full gap-1.5 text-[10px] font-bold"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> Perdido
                  </Button>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: stage pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest shrink-0 mr-1">
                  ETAPA:
                </span>
                {stagesDef.map((stg: any) => (
                  <button
                    key={stg.id}
                    onClick={() => moveToStage(stg)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 transition-all border cursor-pointer ${
                      lead.stageId === stg.id
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-lg shadow-blue-500/20"
                        : "bg-[#0B1120] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {stg.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex border-b border-white/5 overflow-x-auto scrollbar-none shrink-0 px-4">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`pb-2.5 pt-2 px-3 text-[10px] font-bold tracking-widest border-b-2 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    currentTab === tab.id
                      ? "border-[#06B6D4] text-[#06B6D4]"
                      : "border-transparent text-slate-500 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 overflow-y-auto min-h-0">

              {/* INFORMAÇÕES */}
              {currentTab === "informacoes" && (
                <div className="px-5 py-4 space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#0B1120] border border-white/5 rounded-xl p-3 text-center">
                      <Activity className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <div className="text-xl font-black text-white">{leadActs.length}</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">INTERAÇÕES</div>
                    </div>
                    <div className={`border rounded-xl p-3 text-center ${timeIdleNum > 7 ? "bg-rose-500/10 border-rose-500/20" : "bg-[#0B1120] border-white/5"}`}>
                      <Phone className={`w-4 h-4 mx-auto mb-1 ${timeIdleNum > 7 ? "text-rose-400" : "text-slate-400"}`} />
                      <div className={`text-xl font-black ${timeIdleNum > 7 ? "text-rose-400" : "text-white"}`}>
                        {timeIdleNum}d
                      </div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">SEM CONTATO</div>
                    </div>
                    <div className={`border rounded-xl p-3 text-center ${probNum >= 70 ? "bg-emerald-500/10 border-emerald-500/20" : probNum >= 40 ? "bg-amber-500/10 border-amber-500/20" : "bg-[#0B1120] border-white/5"}`}>
                      <TrendingUp className={`w-4 h-4 mx-auto mb-1 ${probNum >= 70 ? "text-emerald-400" : probNum >= 40 ? "text-amber-400" : "text-slate-400"}`} />
                      <div className={`text-xl font-black ${probNum >= 70 ? "text-emerald-400" : probNum >= 40 ? "text-amber-400" : "text-white"}`}>
                        {probNum}%
                      </div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">PROB. GANHO</div>
                    </div>
                  </div>

                  {/* Full profile/edit section */}
                  <ProfileSection
                    lead={lead}
                    companyName={companyName}
                    setCompanyName={setCompanyName}
                    leadName={leadName}
                    setLeadName={setLeadName}
                    phone={phone}
                    setPhone={setPhone}
                    email={email}
                    setEmail={setEmail}
                    title={title}
                    setTitle={setTitle}
                    value={value}
                    setValue={setValue}
                    seller={seller}
                    setSeller={setSeller}
                    priority={priority}
                    setPriority={setPriority}
                    score={score}
                    temperature={temperature}
                    probability={probability}
                    slaStatus={slaStatus}
                    timeIdle={timeIdle}
                    customTags={customTags}
                    newTagInput={newTagInput}
                    setNewTagInput={setNewTagInput}
                    isEditingInline={isEditingInline}
                    setIsEditingInline={setIsEditingInline}
                    tempColors={tempColors}
                    customLeadFields={customLeadFields}
                    customFieldsState={customFieldsState}
                    setCustomFieldsState={setCustomFieldsState}
                    handleAddTag={handleAddTag}
                    handleRemoveTag={handleRemoveTag}
                    handleConvertLead={handleConvertLead}
                    addLeadActivity={handleRegisterActivity}
                    setAlterationLogs={setAlterationLogs}
                    setActiveTab={handleSetActiveTab}
                    setChatChannel={() => {}}
                    applyMessageTemplate={applyMessageTemplate}
                    updateLead={updateLead}
                  />
                </div>
              )}

              {/* HISTÓRICO */}
              {currentTab === "historico" && (
                <div className="px-5 py-4">
                  <TimelineSection
                    lead={lead}
                    leadActivities={leadActivities}
                    activityType={activityType}
                    setActivityType={setActivityType}
                    activityTitle={activityTitle}
                    setActivityTitle={setActivityTitle}
                    activityDate={activityDate}
                    setActivityDate={setActivityDate}
                    activityTime={activityTime}
                    setActivityTime={setActivityTime}
                    activityDesc={activityDesc}
                    setActivityDesc={setActivityDesc}
                    activityError={activityError}
                    setActivityError={setActivityError}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    handleRegisterActivity={handleRegisterActivity}
                    seller={seller}
                  />
                </div>
              )}

              {/* RELATÓRIO IA */}
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

              {/* MENSAGENS */}
              {currentTab === "mensagens" && (
                <div className="px-5 py-4">
                  <MessagingSection
                    leadName={leadName}
                    companyName={companyName}
                    seller={seller}
                  />
                </div>
              )}

              {/* PRODUTOS */}
              {currentTab === "produtos" && (
                <div className="px-5 py-4">
                  <ProductsSection
                    lead={lead}
                    estimatedSum={estimatedSum}
                    availableProducts={availableProducts}
                    linkedProductIds={linkedProductIds}
                    toggleProductLink={toggleProductLink}
                    seller={seller}
                    setAlterationLogs={setAlterationLogs}
                  />
                </div>
              )}

              {/* LOGS */}
              {currentTab === "logs" && (
                <div className="px-5 py-4">
                  <LogsSection alterationLogs={alterationLogs} />
                </div>
              )}

            </div>
          </div>
        </div>
      </Modal>

      {createPortal(
        <AnimatePresence>
          {showCopilot && isOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="fixed top-0 bottom-0 right-[546px] w-[300px] z-[100] bg-[#070E1A] border-r border-white/10 overflow-y-auto shadow-2xl rounded-l-2xl"
            >
              <IACopilot leadName={leadName} companyName={companyName} />
            </motion.div>
          )}
        </AnimatePresence>,
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
