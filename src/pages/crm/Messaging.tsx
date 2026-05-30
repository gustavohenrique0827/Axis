import React from "react";
import { useMessaging } from "./messaging/useMessaging";
import { ChatListSidebar } from "./messaging/ChatListSidebar";
import { ActiveChatArea } from "./messaging/ActiveChatArea";
import { RightControlDrawer } from "./messaging/RightControlDrawer";
import { AddActivityDialog } from "./messaging/AddActivityDialog";

export default function Messaging() {
  const {
    leads,
    leadActivities,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    isSearching,
    activeChat, setActiveChat,
    previousChat,
    rightPanel, setRightPanel,
    previousPanel,
    contacts,
    messages,
    inputText, setInputText,
    isOffline,
    sentiment,
    aiAnalysis,
    aiSuggestion,
    viewMode, setViewMode,
    showAddActivityModal, setShowAddActivityModal,
    newActivityType, setNewActivityType,
    newActivityTitle, setNewActivityTitle,
    newActivityDesc, setNewActivityDesc,
    aiPrompt, setAiPrompt,
    aiTyping,
    aiMessages,
    isMobile,
    parseMessageTimeToTimestamp,
    parseActivityDateToTimestamp,
    handleManualRetry,
    handleAiAsk,
    handleSendMessage,
    handleCreateActivity,
    handleChatSelect
  } = useMessaging();

  const tabs = ["Todas", "Não lidas", "WhatsApp", "Instagram", "E-mail"];

  const filteredContacts = contacts.filter(c => {
    if (activeTab === "Não lidas" && c.unread === 0) return false;
    if (activeTab === "WhatsApp" && c.channel !== "WhatsApp") return false;
    if (activeTab === "Instagram" && c.channel !== "Instagram") return false;
    if (activeTab === "E-mail" && c.channel !== "Email") return false;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      const matchesName = c.name.toLowerCase().includes(query);
      const matchesTag = c.tags ? c.tags.some(t => t.toLowerCase().includes(query)) : false;
      return matchesName || matchesTag;
    }
    return true;
  });

  const viewChatId = isMobile ? (activeChat || previousChat) : activeChat;
  const currentContact = contacts.find(c => c.id === viewChatId);
  const currentMessages = currentContact ? (messages[currentContact.id] || []) : [];

  const cleanNumber = (num?: string) => {
    if (!num) return "";
    return num.replace(/\D/g, "").replace(/^55/, "");
  };

  const matchingLead = currentContact ? leads.find(l => {
    const phoneMatch = cleanNumber(l.phone) === cleanNumber(currentContact.phone);
    const nameMatch = l.name.toLowerCase().includes(currentContact.name.toLowerCase()) || 
                      currentContact.name.toLowerCase().includes(l.name.toLowerCase());
    return phoneMatch || nameMatch;
  }) : null;

  const relatedActivities = matchingLead 
    ? leadActivities.filter(act => act.leadId === matchingLead.id)
    : [];

  return (
    <div className={`flex bg-[#0B1120] overflow-hidden ${isMobile ? "min-h-[100dvh] justify-center relative" : "h-full w-full"}`}>
      <div className={`${isMobile ? "w-full max-w-[768px] h-[100dvh] flex flex-col relative bg-[#0B1120] overflow-hidden" : "w-full h-full rounded-2xl flex border border-white/10 bg-[#0F172A]/85 shadow-2xl backdrop-blur-xl overflow-hidden relative"}`}>
        
        {/* Main List View (Sidebar on Desktop, Full on Mobile) */}
        <ChatListSidebar
          isMobile={isMobile}
          activeChat={activeChat}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          filteredContacts={filteredContacts}
          handleChatSelect={handleChatSelect}
          tabs={tabs}
        />

        {/* Active Chat View Wrapper */}
        <ActiveChatArea
          isMobile={isMobile}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          previousChat={previousChat}
          rightPanel={rightPanel}
          setRightPanel={setRightPanel}
          currentContact={currentContact}
          currentMessages={currentMessages}
          isOffline={isOffline}
          handleManualRetry={handleManualRetry}
          sentiment={sentiment}
          viewMode={viewMode}
          setViewMode={setViewMode}
          matchingLead={matchingLead}
          setShowAddActivityModal={setShowAddActivityModal}
          relatedActivities={relatedActivities}
          parseMessageTimeToTimestamp={parseMessageTimeToTimestamp}
          parseActivityDateToTimestamp={parseActivityDateToTimestamp}
          inputText={inputText}
          setInputText={setInputText}
          handleSendMessage={handleSendMessage}
        />

        {/* Right Panel Layout (Overlay over Chat) */}
        {currentContact && rightPanel !== "none" && (
          <RightControlDrawer
            rightPanel={rightPanel}
            setRightPanel={setRightPanel}
            previousPanel={previousPanel}
            currentContact={currentContact}
            sentiment={sentiment}
            aiAnalysis={aiAnalysis}
            aiSuggestion={aiSuggestion}
            aiMessages={aiMessages}
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            aiTyping={aiTyping}
            handleAiAsk={handleAiAsk}
          />
        )}

        {/* Inline Dialog Modal for Logging New CRM Activities */}
        <AddActivityDialog
          showAddActivityModal={showAddActivityModal}
          setShowAddActivityModal={setShowAddActivityModal}
          matchingLead={matchingLead}
          newActivityType={newActivityType}
          setNewActivityType={setNewActivityType}
          newActivityTitle={newActivityTitle}
          setNewActivityTitle={setNewActivityTitle}
          newActivityDesc={newActivityDesc}
          setNewActivityDesc={setNewActivityDesc}
          handleCreateActivity={handleCreateActivity}
        />

      </div>
    </div>
  );
}
