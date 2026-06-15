import { useRef, useEffect, useState } from "react";
import {
  Search, MoreVertical, X, Send, Mic, Paperclip, Camera,
  Hash, Users, MessageSquare, Plus, CheckCheck, ArrowLeft,
} from "lucide-react";
import { useInternalChat, InternalChannel } from "./useInternalChat";
import { EmojiStickerPicker } from "./EmojiStickerPicker";

const SmileIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" className={className} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-2-9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-2 5c2.327 0 4.316-1.42 5.092-3.411a.999.999 0 0 0-.916-1.391H7.824a1 1 0 0 0-.916 1.391C7.684 14.58 9.673 16 12 16z" />
  </svg>
);

const CHANNEL_COLORS = [
  "from-blue-500 to-blue-700",
  "from-violet-500 to-violet-700",
  "from-emerald-500 to-emerald-700",
  "from-amber-500 to-amber-700",
  "from-pink-500 to-pink-700",
  "from-cyan-500 to-cyan-700",
];

function channelColor(name: string) {
  return CHANNEL_COLORS[name.charCodeAt(0) % CHANNEL_COLORS.length];
}

function channelTypeIcon(type: string) {
  if (type === "geral") return <Hash className="w-3.5 h-3.5" />;
  if (type === "squad") return <Users className="w-3.5 h-3.5" />;
  return <MessageSquare className="w-3.5 h-3.5" />;
}

function formatTime(isoStr: string) {
  return new Date(isoStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function isSticker(text: string) {
  // Single emoji character counts as a "sticker" (large display)
  return /^\p{Emoji}$/u.test(text.trim());
}

interface SidebarProps {
  channels: InternalChannel[];
  activeChannelId: string | null;
  onSelectChannel: (id: string) => void;
  onNewDM: () => void;
}

function InternalSidebar({ channels, activeChannelId, onSelectChannel, onNewDM }: SidebarProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Todos");

  const tabs = ["Todos", "Canais", "Squads", "Direto"];

  const filtered = channels.filter(ch => {
    const matchSearch = ch.name.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeTab === "Canais" && ch.type !== "geral") return false;
    if (activeTab === "Squads" && ch.type !== "squad") return false;
    if (activeTab === "Direto" && ch.type !== "direct") return false;
    return true;
  });

  return (
    <div className={`w-[320px] lg:w-[380px] h-full flex flex-col shrink-0 border-r border-white/5 bg-[#0B1120] z-10`}>
      {/* Header */}
      <div className="shrink-0 h-[72px] px-5 flex items-center justify-between border-b border-white/5">
        <h1 className="text-xl font-bold text-white tracking-tight">Chat Interno</h1>
        <div className="flex items-center gap-2 text-slate-400">
          <button
            onClick={onNewDM}
            title="Nova mensagem direta"
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex overflow-x-auto scrollbar-none border-b border-white/5 px-3 py-3 gap-2 bg-[#0B1120]/50 backdrop-blur-md">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-1.5 text-[13px] font-medium rounded-full transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                : "bg-white/5 hover:bg-white/10 text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="shrink-0 px-5 py-3 border-b border-white/5 bg-[#0B1120]/40">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar canal ou usuário..."
            className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto pb-20 scrollbar-none">
        {filtered.length === 0 && (
          <div className="p-10 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <Search className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-slate-400">Nenhum canal encontrado</p>
          </div>
        )}
        {filtered.map(ch => {
          const isActive = activeChannelId === ch.id;
          const isDirect = ch.type === "direct";
          return (
            <button
              key={ch.id}
              onClick={() => onSelectChannel(ch.id)}
              className={`w-full flex items-center gap-4 py-4 transition-all border-b border-white/5 text-left border-l-4 pl-[16px] pr-5 ${
                isActive
                  ? "border-l-blue-500 bg-blue-500/10 shadow-[inset_4px_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20 text-white"
                  : "border-transparent hover:bg-white/5 text-slate-300"
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner bg-gradient-to-br ${channelColor(ch.name)}`}>
                  {isDirect
                    ? ch.name.split(" & ")[1]?.slice(0, 2).toUpperCase() || "DM"
                    : channelTypeIcon(ch.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <h3 className={`font-semibold text-[15px] truncate ${isActive ? "text-white" : "text-slate-200"}`}>
                    {isDirect ? ch.name.replace(/.*& /, "") : `${ch.type === "geral" ? "#" : ch.type === "squad" ? "⚡ " : ""}${ch.name}`}
                  </h3>
                </div>
                <p className="text-[13px] text-slate-500 truncate">
                  {ch.description || (ch.type === "geral" ? "Canal geral" : ch.type === "squad" ? "Canal do squad" : "Mensagem direta")}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ChatAreaProps {
  channel: InternalChannel | null;
  messages: any[];
  inputText: string;
  setInputText: (t: string) => void;
  sendMessage: () => void;
  sendSticker: (s: string) => void;
  senderName: string;
  onBack?: () => void;
}

function InternalChatArea({ channel, messages, inputText, setInputText, sendMessage, sendSticker, senderName, onBack }: ChatAreaProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, channel]);

  const handleEmojiSelect = (emoji: string) => {
    setInputText(inputText + emoji);
    textareaRef.current?.focus();
  };

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center relative bg-[#0F172A]/30">
        <div className="flex flex-col items-center justify-center max-w-[420px] text-center px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/30 mb-8 -rotate-12 ring-4 ring-white/5">
            <MessageSquare className="w-10 h-10 text-white rotate-12" strokeWidth={2} />
          </div>
          <h2 className="text-white text-3xl font-bold tracking-tight mb-4">Chat Interno</h2>
          <p className="text-slate-400 text-[15px] leading-relaxed mb-8">
            Comunique-se com sua equipe em canais, squads ou mensagens diretas.
          </p>
        </div>
      </div>
    );
  }

  const isDirect = channel.type === "direct";

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0F172A]/50 z-0 relative min-w-0">
      {/* Header */}
      <div className="shrink-0 h-[64px] px-2 md:px-6 flex items-center justify-between border-b border-white/5 bg-[#0F172A]/90 backdrop-blur-md z-10 shadow-sm">
        <div className="flex items-center gap-2 md:gap-3 max-w-[70%]">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-1 text-slate-400 hover:text-white rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${channelColor(channel.name)}`}>
            {isDirect ? channel.name.split(" & ")[1]?.slice(0, 2).toUpperCase() : channelTypeIcon(channel.type)}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-white font-semibold text-[15px] md:text-[16px] truncate tracking-tight">
              {isDirect
                ? channel.name.replace(/.*& /, "")
                : `${channel.type === "geral" ? "#" : channel.type === "squad" ? "⚡ " : ""}${channel.name}`}
            </h2>
            <span className="text-[12px] text-slate-400 truncate">
              {channel.description || (channel.type === "geral" ? "Canal geral" : channel.type === "squad" ? "Squad" : "Direto")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          <button className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors hidden sm:flex">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#0B1120] scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full opacity-50 flex-col gap-4">
            <div className="bg-white/5 p-6 rounded-full shadow-lg ring-1 ring-white/10">
              <MessageSquare className="w-10 h-10 text-blue-400" />
            </div>
            <p className="text-sm text-slate-400 font-medium">
              Seja o primeiro a escrever em {channel.type !== "direct" ? `#${channel.name}` : channel.name.replace(/.*& /, "")}
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <span className="text-[11px] font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                Hoje
              </span>
            </div>

            {messages.map((msg, idx) => {
              const isMe = msg.sender_name === senderName;
              const prevMsg = messages[idx - 1];
              const sameUser = prevMsg?.sender_name === msg.sender_name;
              const closeTime = prevMsg && (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) < 60000;
              const grouped = sameUser && closeTime;
              const sticker = isSticker(msg.content);

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} ${grouped ? "mt-0.5" : "mt-3"}`}>
                  {/* Avatar — only first of group */}
                  {!isMe && !grouped && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 mr-2 mt-1 bg-gradient-to-br ${channelColor(msg.sender_name)}`}>
                      {msg.sender_name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {!isMe && grouped && <div className="w-8 h-8 shrink-0 mr-2" />}

                  <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                    {!grouped && (
                      <span className={`text-[10px] text-slate-500 font-semibold mb-1 ${isMe ? "mr-1" : "ml-1"}`}>
                        {isMe ? "Você" : msg.sender_name}
                      </span>
                    )}

                    {sticker ? (
                      /* Sticker — large emoji */
                      <div className="text-6xl leading-none p-1">{msg.content}</div>
                    ) : (
                      <div className={`px-4 py-2.5 relative shadow-sm ${
                        isMe
                          ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                          : "bg-white/5 text-slate-100 rounded-2xl rounded-tl-sm border border-white/5"
                      }`}>
                        <p className="text-[14.5px] leading-relaxed break-words whitespace-pre-wrap pb-2">
                          {msg.content}
                        </p>
                        <span className={`text-[10px] font-medium absolute bottom-1.5 right-3 flex items-center gap-1 ${isMe ? "text-blue-200/80" : "text-slate-500"}`}>
                          {formatTime(msg.created_at)}
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 shrink-0 relative bg-[#0F172A]/80 border-t border-white/5 backdrop-blur-md z-10">
        <div className="flex items-end gap-2 sm:gap-3 mx-auto w-full max-w-4xl">
          <div className="flex-1 bg-[#1E293B] border border-white/5 rounded-2xl flex items-end min-h-[50px] shadow-inner transition-colors focus-within:border-blue-500/50 min-w-0 relative">

            {/* Emoji/Sticker picker */}
            {showPicker && (
              <EmojiStickerPicker
                onEmojiSelect={handleEmojiSelect}
                onStickerSend={(s) => { sendSticker(s); setShowPicker(false); }}
                onClose={() => setShowPicker(false)}
              />
            )}

            <button
              onClick={() => setShowPicker(v => !v)}
              className={`p-3 sm:p-3.5 shrink-0 transition-colors ${showPicker ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
            >
              <SmileIcon className="w-5 h-5" />
            </button>

            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder="Mensagem..."
              className="flex-1 min-w-0 w-full max-h-[120px] bg-transparent text-white border-0 focus:ring-0 resize-none py-[14px] px-1 text-[15px] outline-none placeholder-slate-500 overflow-y-auto block"
              rows={1}
            />

            <button className="p-3 sm:p-3.5 text-slate-400 hover:text-white shrink-0 transition-colors">
              <Paperclip className="w-5 h-5 -rotate-45" />
            </button>
            {!inputText && (
              <button className="p-3 sm:p-3.5 pl-1 pr-3 sm:pr-4 text-slate-400 hover:text-white shrink-0 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={sendMessage}
            className="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 hover:bg-blue-500 active:scale-95 transition-all shadow-md shadow-blue-900/30"
          >
            {inputText.trim()
              ? <Send className="w-5 h-5 translate-x-[2px] -translate-y-[1px] text-white" />
              : <Mic className="w-5 h-5 text-white" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export function InternalChatView() {
  const {
    channels, activeChannelId, setActiveChannelId, activeChannel,
    activeMessages, otherUsers,
    inputText, setInputText,
    loading, sendMessage, openDirectMessage, senderName,
  } = useInternalChat();

  const [showDMSearch, setShowDMSearch] = useState(false);
  const [dmSearch, setDmSearch] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const handleSelectChannel = (id: string) => {
    setActiveChannelId(id);
    setMobileShowChat(true);
  };


  // Custom sendSticker that bypasses inputText state
  const handleSendSticker = (sticker: string) => {
    const prev = inputText;
    setInputText(sticker);
    setTimeout(sendMessage, 0);
    setInputText(prev);
  };

  if (loading && channels.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        <div className="text-sm">Carregando canais...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      {/* DM User Search Overlay */}
      {showDMSearch && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                autoFocus
                type="text"
                value={dmSearch}
                onChange={e => setDmSearch(e.target.value)}
                placeholder="Buscar usuário para mensagem direta..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
              />
              <button onClick={() => { setShowDMSearch(false); setDmSearch(""); }} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {otherUsers
                .filter(u => u.name.toLowerCase().includes(dmSearch.toLowerCase()))
                .map(u => (
                  <button
                    key={u.id}
                    onClick={() => { openDirectMessage(u); setShowDMSearch(false); setDmSearch(""); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${channelColor(u.name)}`}>
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-500">{u.role || u.email}</p>
                    </div>
                  </button>
                ))
              }
              {otherUsers.filter(u => u.name.toLowerCase().includes(dmSearch.toLowerCase())).length === 0 && (
                <p className="px-4 py-6 text-sm text-slate-600 text-center">Nenhum usuário encontrado</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${mobileShowChat ? "hidden md:flex" : "flex"} md:w-[320px] lg:w-[380px] w-full h-full shrink-0`}>
        <InternalSidebar
          channels={channels}
          activeChannelId={activeChannelId}
          onSelectChannel={handleSelectChannel}
          onNewDM={() => setShowDMSearch(true)}
        />
      </div>

      {/* Chat Area */}
      <div className={`${mobileShowChat ? "flex" : "hidden md:flex"} flex-1 h-full min-w-0`}>
        <InternalChatArea
          channel={activeChannel}
          messages={activeMessages}
          inputText={inputText}
          setInputText={setInputText}
          sendMessage={sendMessage}
          sendSticker={handleSendSticker}
          senderName={senderName}
          onBack={() => setMobileShowChat(false)}
        />
      </div>
    </div>
  );
}
