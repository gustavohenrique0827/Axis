import React from "react";
import { Search, MoreVertical, X, MessageCircle, Instagram, Mail } from "lucide-react";
import { motion } from "motion/react";
import { Contact, Channel } from "./useMessaging";

interface ChatListSidebarProps {
  isMobile: boolean;
  activeChat: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  filteredContacts: Contact[];
  handleChatSelect: (id: string) => void;
  tabs: string[];
}

const getChannelIcon = (channel: Channel, className = "w-4 h-4") => {
  switch (channel) {
    case "WhatsApp": return <MessageCircle className={`${className} text-emerald-400`} />;
    case "Instagram": return <Instagram className={`${className} text-pink-400`} />;
    case "Email": return <Mail className={`${className} text-blue-400`} />;
  }
};

export function ChatListSidebar({
  isMobile,
  activeChat,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isSearching,
  filteredContacts,
  handleChatSelect,
  tabs
}: ChatListSidebarProps) {
  return (
    <div className={`${
        isMobile 
          ? `absolute inset-0 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] z-10 ${activeChat ? '-translate-x-1/4 opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}` 
          : 'w-[320px] lg:w-[380px] h-full flex flex-col shrink-0 border-r border-white/5 z-10'
      } bg-[var(--color-surface)]`}>
      
      {/* Header */}
      <div className="shrink-0 h-[72px] px-5 flex items-center justify-between border-b border-white/5">
        <h1 className="text-xl font-bold text-white tracking-tight">Mensagens</h1>
        <div className="flex items-center gap-3 text-slate-400">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer"><Search className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex overflow-x-auto scrollbar-none border-b border-white/5 px-3 py-3 gap-2 bg-[var(--color-surface)]/50 backdrop-blur-md">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-1.5 text-[13px] font-medium rounded-full transition-all cursor-pointer ${
              activeTab === tab 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Quick Search */}
      <div className="shrink-0 px-5 py-3 border-b border-white/5 bg-[var(--color-surface)]/40">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou tag..."
            className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="scrollbar-none flex-1 overflow-y-auto pb-20">
        <motion.div
          key={`${searchQuery}-${activeTab}-${isSearching}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full flex flex-col"
        >
          {isSearching ? (
            /* Skeleton Loader */
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="w-full flex items-center gap-4 pl-[16px] pr-5 py-4 border-b border-white/5 border-l-4 border-transparent animate-pulse">
                <div className="w-12 h-12 rounded-full bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-800 rounded w-10" />
                  </div>
                  <div className="h-3.5 bg-slate-800 rounded w-3/4" />
                </div>
              </div>
            ))
          ) : (
            /* Real contacts list */
            <>
              {filteredContacts.map(contact => {
                const isActive = !isMobile && activeChat === contact.id;
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleChatSelect(contact.id)}
                    className={`w-full flex items-center gap-4 py-4 transition-all border-b border-white/5 text-left cursor-pointer group border-l-4 ${
                      isActive 
                        ? 'selecao-ativa border-l-blue-500 bg-blue-500/10 pl-[16px] pr-5 shadow-[inset_4px_0_15px_rgba(59,130,246,0.15),0_0_15px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/20 text-white' 
                        : 'border-transparent pl-[16px] pr-5 hover:bg-white/5'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-inner ${
                        contact.channel === 'WhatsApp' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                        contact.channel === 'Instagram' ? 'bg-gradient-to-br from-pink-500 to-purple-700' :
                        'bg-gradient-to-br from-blue-500 to-indigo-700'
                      }`}>
                        {contact.avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#0F172A] rounded-full p-[3px] shadow-sm ring-2 ring-[#0B1120]">
                        {getChannelIcon(contact.channel, "w-[14px] h-[14px]")}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <div className="flex justify-between items-center">
                        <h3 className={`font-semibold text-[15px] truncate ${contact.unread > 0 ? "text-white" : "text-slate-200"}`}>
                          {contact.name}
                        </h3>
                        <span className={`text-[11px] font-medium ${contact.unread > 0 ? 'text-blue-400' : 'text-slate-500'}`}>
                          {contact.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-[13px] truncate flex-1 leading-snug ${contact.unread > 0 ? "text-slate-300 font-medium" : "text-slate-500"}`}>
                          {contact.lastMessage}
                        </p>
                        {contact.unread > 0 && (
                          <span className="bg-blue-600 text-white text-[11px] font-bold h-[22px] min-w-[22px] rounded-full flex items-center justify-center px-1.5 shrink-0 shadow-sm animate-pulse">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              
              {filteredContacts.length === 0 && (
                <div className="p-10 flex flex-col items-center justify-center gap-4 text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shadow-lg">
                    <Search className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Nenhum resultado encontrado</h4>
                    <p className="text-xs text-slate-400 max-w-[220px]">
                      Não encontramos nenhuma conversa que corresponda ao termo buscando ou aos filtros aplicados.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
