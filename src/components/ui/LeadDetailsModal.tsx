import { Modal } from "./modal";
import { Button } from "./button";
import { ConfirmModal } from "./ConfirmModal";
import { 
  Trophy, ThumbsDown, Trash, Calendar, MessageSquare, 
  Brain, BadgeCent, ShieldCheck
} from "lucide-react";
import { useLeadDetails } from "./lead-details/useLeadDetails";
import { RevenueIntelligenceModal } from "../../pages/crm/components/RevenueIntelligenceModal";
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

export function LeadDetailsModal({ isOpen, onClose, lead }: LeadDetailsModalProps) {
  const { updateLead } = useData();

  const {
    activeTab, setActiveTab,
    reportContextOverride, setReportContextOverride,
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
    progressPercent,
    tempColors,
    customLeadFields,
    applyMessageTemplate
  } = useLeadDetails(lead, onClose);

  const { leadActivities } = useData();

  if (!lead) return null;

  const headerActionPill = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => {
          const lastStage = stagesDef[stagesDef.length - 1];
          updateLead(lead.id, { stageId: lastStage?.id ?? '5', status: 'Fechado' });
          toast.success('Parabéns! Lead fechado com status GANHO! 🏆');
          setAlterationLogs((prev: any[]) => [
            { id: Date.now().toString(), author: seller || "Sistema", desc: "MARCOU COMO GANHO - Negócio concluído", time: "Agora" },
            ...prev
          ]);
        }}
        className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/25 h-9 px-4 rounded-full gap-2 font-bold shadow-sm transition-all animate-in fade-in duration-200"
      >
        <Trophy className="w-4 h-4 animate-bounce" /> Ganho
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          updateLead(lead.id, { status: 'Perdido' });
          toast.warning('Negócio marcado como Perdido. Fica para a próxima.');
          setAlterationLogs((prev: any[]) => [
            { id: Date.now().toString(), author: seller || "Sistema", desc: "MARCOU COMO PERDIDO", time: "Agora" },
            ...prev
          ]);
        }}
        className="text-rose-400 border-rose-400/20 bg-rose-400/10 hover:bg-rose-400/25 h-9 px-4 rounded-full gap-2 font-bold shadow-sm transition-all"
      >
        <ThumbsDown className="w-4 h-4" /> Perdido
      </Button>
    </div>
  );

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={headerActionPill}
        maxWidth="max-w-xl"
        position="right"
        footer={
          <div className="flex items-center justify-between w-full gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="border-white/5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 gap-1.5 h-10 px-4"
            >
              <Trash className="w-4 h-4" /> Excluir Lead
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} className="text-slate-400 font-bold px-4">Fechar</Button>
              {isEditingInline ? (
                <Button onClick={handleSaveAll} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6">Salvar</Button>
              ) : (
                <Button onClick={() => setIsEditingInline(true)} className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold px-6">Editar</Button>
              )}
            </div>
          </div>
        }
      >
        {/* Dynamic Funnel Stages Navigation */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-3 scrollbar-none shrink-0 border-b border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0 mr-1.5 font-sans">Mudar Etapa Funil:</span>
          {stagesDef.map(stg => {
            const isActive = lead.stageId === stg.id;
            return (
              <button 
                key={stg.id} 
                onClick={() => {
                  updateLead(lead.id, { stageId: stg.id, status: stg.status });
                  toast.success(`Encaminhado no funil: ${stg.name}`);
                  setAlterationLogs((prev: any[]) => [
                    { id: Date.now().toString(), author: "Carlos Eduardo Mendes", desc: `Moveu o lead para a etapa de '${stg.name}'`, time: "Agora" },
                    ...prev
                  ]);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                  isActive 
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-lg shadow-blue-500/20' 
                    : 'bg-[#111827] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {stg.name}
              </button>
            );
          })}
        </div>

        {/* Progress Bar indicator */}
        <div className="h-1 w-full bg-slate-800 rounded-full mb-6 overflow-hidden shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Dynamic Section Grid */}
        <div className="grid grid-cols-1 gap-6 items-start">
          
          {/* PROFILE CARD & FAST ACTIONS SECTION */}
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
            setActiveTab={setActiveTab}
            setChatChannel={() => {}}
            applyMessageTemplate={applyMessageTemplate}
            updateLead={updateLead}
          />

          {/* INTERACTIVE FEATURE TABS CONSOLE SECTION */}
          <div className="space-y-6">
            
            {/* Elegant Tab Headers */}
            <div className="flex gap-2 border-b border-white/10 overflow-x-auto scrollbar-none shrink-0 pb-1.5">
              {[
                { id: 'timeline', label: 'TIMELINE & HISTÓRICO', icon: Calendar },
                { id: 'sdrReport', label: '⚡ RELATÓRIO IA CLOSER', icon: Brain },
                { id: 'revenueIntel', label: '🧠 ANÁLISE IA', icon: Brain },
                { id: 'whatsapp', label: 'DIRECT MESSAGING', icon: MessageSquare },
                { id: 'products', label: 'METAS & PRODUTOS', icon: BadgeCent },
                { id: 'logs', label: 'RBAC AUDITOR & LOGS', icon: ShieldCheck }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-2.5 pt-1.5 px-3 font-bold text-[10px] tracking-widest border-b-2 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? 'border-[#06B6D4] text-[#06B6D4]' 
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: TIMELINE */}
            {activeTab === 'timeline' && (
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
            )}

            {/* TAB CONTENT: DIRECT MESSAGING & QUICK CHAT TEMPLATES */}
            {activeTab === 'whatsapp' && (
              <MessagingSection
                leadName={leadName}
                companyName={companyName}
                seller={seller}
              />
            )}

            {/* TAB CONTENT: PRODUCTS BUDGET & COMMISSIONS */}
            {activeTab === 'products' && (
              <ProductsSection
                lead={lead}
                estimatedSum={estimatedSum}
                availableProducts={availableProducts}
                linkedProductIds={linkedProductIds}
                toggleProductLink={toggleProductLink}
                seller={seller}
                setAlterationLogs={setAlterationLogs}
              />
            )}

            {/* TAB CONTENT: SDR IA REPORT BLUEPRINT FOR CLOSER */}
            {activeTab === 'sdrReport' && (
              <SdrReportSection
                lead={lead}
                reportContextOverride={reportContextOverride}
                setReportContextOverride={setReportContextOverride}
                leadName={leadName}
                companyName={companyName}
                seller={seller}
                score={score}
              />
            )}

            {/* TAB CONTENT: REVENUE INTELLIGENCE ENGINE */}
            {activeTab === 'revenueIntel' && (
              <RevenueIntelligenceModal
                lead={lead}
                stageName={stagesDef.find(s => s.id === lead.stageId)?.name ?? ''}
                pipelineName="Pipeline CRM"
                onClose={() => setActiveTab('timeline')}
                embedded
              />
            )}

            {/* TAB CONTENT: AUDITOR TRACE & ALTERATION LOGS */}
            {activeTab === 'logs' && (
              <LogsSection alterationLogs={alterationLogs} />
            )}

          </div>

        </div>
      </Modal>

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
