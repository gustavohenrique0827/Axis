import React, { useRef, useEffect, useState } from "react";
import { Hash, Users, MessageSquare, Send, Plus, ChevronRight, Search } from "lucide-react";
import { useInternalChat } from "./useInternalChat";

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  const colors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-pink-500", "bg-cyan-500"];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === "sm" ? "w-7 h-7 text-[9px]" : size === "lg" ? "w-10 h-10 text-sm" : "w-8 h-8 text-[11px]";
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center font-black text-white shrink-0`}>
      {initials || "?"}
    </div>
  );
}

function formatTime(isoStr: string) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function InternalChatView() {
  const {
    geralChannels, squadChannels, directChannels,
    activeChannelId, setActiveChannelId, activeChannel,
    activeMessages, otherUsers,
    inputText, setInputText,
    loading, sendMessage, openDirectMessage,
    senderName,
  } = useInternalChat();

  const [showUsers, setShowUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredUsers = otherUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const channelTypeIcon = (type: string) => {
    if (type === "geral") return <Hash className="w-3.5 h-3.5" />;
    if (type === "squad") return <Users className="w-3.5 h-3.5" />;
    return <MessageSquare className="w-3.5 h-3.5" />;
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 shrink-0 bg-[#0B1120] border-r border-white/5 flex flex-col">
        <div className="h-14 px-4 flex items-center border-b border-white/5 shrink-0">
          <h2 className="text-xs font-black text-white uppercase tracking-widest">Chat Interno</h2>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-4 scrollbar-none">
          {/* Geral */}
          <div>
            <p className="px-4 mb-1 text-[9px] font-black text-slate-600 uppercase tracking-widest">Canais</p>
            {loading ? (
              <div className="px-4 py-2 text-[11px] text-slate-600">Carregando...</div>
            ) : (
              <>
                {geralChannels.map(ch => (
                  <ChannelItem
                    key={ch.id}
                    channel={ch}
                    active={activeChannelId === ch.id}
                    icon={<Hash className="w-3.5 h-3.5" />}
                    onClick={() => setActiveChannelId(ch.id)}
                  />
                ))}
                {squadChannels.map(ch => (
                  <ChannelItem
                    key={ch.id}
                    channel={ch}
                    active={activeChannelId === ch.id}
                    icon={<Users className="w-3.5 h-3.5" />}
                    onClick={() => setActiveChannelId(ch.id)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Direct Messages */}
          <div>
            <div className="px-4 mb-1 flex items-center justify-between">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Mensagens Diretas</p>
              <button
                onClick={() => setShowUsers(v => !v)}
                className="text-slate-600 hover:text-slate-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* User search panel */}
            {showUsers && (
              <div className="mx-2 mb-2 bg-[#111827] border border-white/8 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
                  <Search className="w-3 h-3 text-slate-500 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Buscar usuário..."
                    className="flex-1 bg-transparent text-[11px] text-white placeholder-slate-600 outline-none"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filteredUsers.length === 0 && (
                    <p className="px-3 py-2 text-[10px] text-slate-600">Nenhum usuário</p>
                  )}
                  {filteredUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { openDirectMessage(u); setShowUsers(false); setUserSearch(""); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                    >
                      <Avatar name={u.name} size="sm" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-white truncate">{u.name}</p>
                        <p className="text-[9px] text-slate-600 truncate">{u.role || u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {directChannels.map(ch => {
              const otherName = ch.name.replace(senderName + " & ", "").replace(" & " + senderName, "");
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-left transition-colors ${activeChannelId === ch.id ? "bg-white/8 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                >
                  <Avatar name={otherName} size="sm" />
                  <span className="text-[11px] font-semibold truncate">{otherName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B1120]">
        {!activeChannel ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-3">
            <MessageSquare className="w-10 h-10 opacity-20" />
            <p className="text-sm font-bold">Selecione um canal para começar</p>
          </div>
        ) : (
          <>
            {/* Channel header */}
            <div className="h-14 px-5 flex items-center gap-2 border-b border-white/5 shrink-0">
              <span className="text-slate-400">{channelTypeIcon(activeChannel.type)}</span>
              <span className="text-sm font-black text-white">{activeChannel.name}</span>
              {activeChannel.description && (
                <>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <span className="text-[11px] text-slate-500">{activeChannel.description}</span>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-none">
              {activeMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                  <Hash className="w-8 h-8 opacity-20" />
                  <p className="text-sm font-bold">Seja o primeiro a escrever em #{activeChannel.name}</p>
                </div>
              )}
              {activeMessages.map((msg, idx) => {
                const isMe = msg.sender_name === senderName;
                const prevMsg = activeMessages[idx - 1];
                const sameUser = prevMsg?.sender_name === msg.sender_name;
                const closeInTime = prevMsg && (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) < 60000;
                const grouped = sameUser && closeInTime;

                return (
                  <div key={msg.id} className={`flex items-end gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} ${grouped ? "mt-0.5" : "mt-3"}`}>
                    {!grouped ? (
                      <Avatar name={msg.sender_name} size="sm" />
                    ) : (
                      <div className="w-7 h-7 shrink-0" />
                    )}
                    <div className={`flex flex-col gap-0.5 max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                      {!grouped && (
                        <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="text-[10px] font-black text-slate-400">{msg.sender_name}</span>
                          <span className="text-[9px] text-slate-600">{formatTime(msg.created_at)}</span>
                        </div>
                      )}
                      <div className={`px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed ${isMe
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white/[0.06] text-slate-100 rounded-bl-sm"
                      }`}>
                        {msg.content}
                      </div>
                      {grouped && (
                        <span className="text-[9px] text-slate-700 px-1">{formatTime(msg.created_at)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 shrink-0">
              <div className="flex items-center gap-3 bg-white/[0.04] border border-white/8 rounded-2xl px-4 py-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Mensagem em #${activeChannel.name}…`}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChannelItem({ channel, active, icon, onClick }: {
  channel: { id: string; name: string };
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-1.5 text-left transition-colors ${active ? "bg-white/8 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
    >
      <span className="opacity-60">{icon}</span>
      <span className="text-[11px] font-semibold truncate">{channel.name}</span>
    </button>
  );
}
