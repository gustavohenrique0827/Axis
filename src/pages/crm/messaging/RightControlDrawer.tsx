import React from "react";
import { 
  X, Info, Sparkles, Phone, Mail, Clock, Trash2, ShieldCheck, Send, Zap
} from "lucide-react";
import { Contact, RightPanelState } from "./useMessaging";

interface RightControlDrawerProps {
  rightPanel: RightPanelState;
  setRightPanel: React.Dispatch<React.SetStateAction<RightPanelState>>;
  previousPanel: RightPanelState;
  currentContact: Contact;
  sentiment: string;
  aiAnalysis: string;
  aiSuggestion: string;
  aiMessages: { id: string, text: string, type: 'user'|'system' }[];
  aiPrompt: string;
  setAiPrompt: (p: string) => void;
  aiTyping: boolean;
  handleAiAsk: () => void;
}

export function RightControlDrawer({
  rightPanel,
  setRightPanel,
  previousPanel,
  currentContact,
  sentiment,
  aiAnalysis,
  aiSuggestion,
  aiMessages,
  aiPrompt,
  setAiPrompt,
  aiTyping,
  handleAiAsk
}: RightControlDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${rightPanel !== 'none' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setRightPanel("none")}
      />
      
      {/* Drawer */}
      <div className={`absolute top-0 right-0 bottom-0 w-[90%] sm:w-[380px] bg-[var(--color-surface)] flex flex-col border-l border-white/10 shadow-2xl shadow-black z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${rightPanel !== 'none' ? 'translate-x-0' : 'translate-x-[100%]'}`}>
        
        {/* Panel Header */}
        <div className="shrink-0 h-[72px] px-5 flex items-center justify-between border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-md">
          <h2 className="text-[16px] text-white font-semibold flex items-center gap-2.5">
            {(rightPanel === "info" || (rightPanel === "none" && previousPanel === "info")) ? <Info className="w-5 h-5 text-slate-400"/> : <Sparkles className="w-5 h-5 text-blue-400"/>}
            {(rightPanel === "info" || (rightPanel === "none" && previousPanel === "info")) ? "Dados do Contato" : "Axis Copilot"}
          </h2>
          <button onClick={() => setRightPanel("none")} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Content: Info */}
        <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent p-6 space-y-6 ${(rightPanel === "info" || (rightPanel === "none" && previousPanel === "info")) ? 'block' : 'hidden'}`}>
          <div className="flex flex-col items-center text-center">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-xl text-white ${
                currentContact.channel === 'WhatsApp' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                currentContact.channel === 'Instagram' ? 'bg-gradient-to-br from-pink-500 to-purple-700' :
                'bg-gradient-to-br from-blue-500 to-indigo-700'
              }`}>
                {currentContact.avatar}
              </div>
              <h2 className="text-xl text-white font-bold tracking-tight">{currentContact.name}</h2>
              <p className="text-slate-400 text-[13px] font-medium mt-2 uppercase tracking-widest flex items-center gap-1.5 justify-center">
                {currentContact.channel}
              </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-xl font-medium text-[13px] flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors cursor-pointer">
              <Phone className="w-4 h-4"/> Ligar
            </button>
            <button className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-2.5 rounded-xl font-medium text-[13px] flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-colors cursor-pointer">
              <Mail className="w-4 h-4"/> E-mail
            </button>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-5 text-left">
              <div>
                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Telefone</h4>
                <p className="text-slate-200 text-[14px] font-medium">{currentContact.phone || "Não cadastrado"}</p>
              </div>
              {currentContact.email && (
                <div>
                  <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">E-mail</h4>
                  <p className="text-slate-200 text-[14px] font-medium break-all">{currentContact.email}</p>
                </div>
              )}
              <div>
                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3" /> SLA de Resposta</h4>
                <p className={`text-[14px] font-bold flex items-center gap-1.5 ${currentContact.slaStatus?.includes('Atrasado') ? 'text-rose-400' : 'text-emerald-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${currentContact.slaStatus?.includes('Atrasado') ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                  {currentContact.slaStatus || "Dentro do Prazo"}
                </p>
              </div>
              <div>
                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Tags / Estágio</h4>
                <div className="flex flex-wrap gap-2">
                  {currentContact.tags?.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-[var(--color-surface-elevated)] border border-white/10 rounded-md text-[11px] text-slate-300 font-medium uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                  <button className="px-2.5 py-1 border border-dashed border-white/20 text-slate-400 hover:text-white hover:bg-white/5 rounded-md text-[11px] font-medium transition-colors cursor-pointer uppercase tracking-wider">
                    + Tag
                  </button>
                </div>
              </div>
              <div>
                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Histórico de Compras</h4>
                <div className="space-y-2">
                  {currentContact.purchaseHistory && currentContact.purchaseHistory.length > 0 ? currentContact.purchaseHistory.map((ph, idx) => (
                    <div key={idx} className="flex flex-col gap-0.5 bg-[var(--color-surface-elevated)] p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-start justify-between">
                        <p className="text-[13px] text-slate-200 font-medium leading-tight">{ph.item}</p>
                        <span className="text-[12px] text-emerald-400 font-bold shrink-0 ml-2">{ph.value}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{ph.date}</p>
                    </div>
                  )) : (
                    <p className="text-[12px] text-slate-500 italic">Nenhuma compra registrada.</p>
                  )}
                </div>
              </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/5 mb-8">
              <button className="w-full text-left text-rose-400 bg-rose-500/10 border border-rose-500/20 text-[14px] p-3.5 hover:bg-rose-500/20 rounded-xl transition-colors flex items-center gap-3 font-medium cursor-pointer">
                <Trash2 className="w-4 h-4"/> Apagar Conversa
              </button>
              <button className="w-full text-left text-slate-400 bg-white/5 border border-white/5 text-[14px] p-3.5 hover:bg-white/10 hover:text-slate-200 rounded-xl transition-colors flex items-center gap-3 font-medium cursor-pointer">
                <ShieldCheck className="w-4 h-4"/> Bloquear Contato
              </button>
          </div>
        </div>

        {/* Panel Content: AI */}
        <div className={`flex-1 flex flex-col ${(rightPanel === "ai" || (rightPanel === "none" && previousPanel === "ai")) ? 'block' : 'hidden'}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              
              <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl p-4 md:p-5 border border-blue-500/20 relative overflow-hidden group text-left">
                <Sparkles className="absolute -bottom-2 -right-2 w-24 h-24 text-blue-500/10 group-hover:scale-110 transition-transform duration-500" />
                <h4 className="text-blue-400 text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                  <Zap className="w-4 h-4 fill-blue-500/50"/> Análise da Conversa (Master AI)
                </h4>
                <p className="text-slate-200 text-[13.5px] leading-relaxed relative z-10">
                  {aiAnalysis || "O Axis Copilot está analisando as interações da conversa para sintetizar insights comerciais em tempo real..."}
                </p>
                {aiSuggestion && (
                  <div className="mt-3.5 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-200 leading-relaxed">
                    <strong className="text-blue-400 block mb-0.5">💡 Sugestão de Abordagem:</strong>
                    {aiSuggestion}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2 relative z-10">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Sentimento:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                    sentiment === "Positivo" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                    sentiment === "Negativo" ? "bg-rose-500/10 border-rose-500/30 text-rose-400" :
                    sentiment === "Analisando..." ? "bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse" :
                    "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  }`}>{sentiment || "Pendente"}</span>
                </div>
              </div>

              {/* AI Conversation List */}
              <div className="space-y-4">
                {aiMessages.map((aimsg) => (
                  <div key={aimsg.id} className={`flex w-full ${aimsg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
                    {aimsg.type === 'system' && (
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mr-2 shrink-0 self-end mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                    )}
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] sm:text-[14px] leading-snug shadow-sm text-left ${
                      aimsg.type === 'user' 
                        ? 'bg-[var(--color-surface-elevated)] text-white rounded-br-sm border border-white/5' 
                        : 'bg-blue-600/10 border border-blue-500/20 text-blue-50 rounded-bl-sm'
                    }`}>
                      {aimsg.text}
                    </div>
                  </div>
                ))}
                
                {aiTyping && (
                  <div className="flex w-full justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mr-2 shrink-0 self-end mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500/50" />
                      </div>
                     <div className="px-4 py-3.5 bg-blue-600/5 border border-blue-500/10 text-blue-300/70 rounded-2xl rounded-bl-sm text-[13px] font-medium flex items-center gap-1.5 shadow-sm">
                       Gerando resposta<span className="flex gap-0.5 ml-1"><span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span></span>
                     </div>
                  </div>
                )}
              </div>
          </div>

          {/* AI Chat Input */}
          <div className="p-3 sm:p-4 border-t border-white/5 bg-[#0F172A]/90 shrink-0 backdrop-blur-md">
            <div className="flex gap-2 items-end">
              <textarea 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Pergunte à Master AI..." 
                rows={1}
                className="flex-1 bg-[var(--color-surface-elevated)] border border-white/5 rounded-xl px-3.5 py-3 text-[14px] text-slate-200 outline-none focus:border-blue-500/50 resize-none max-h-[100px] overflow-y-auto shadow-inner w-full min-w-0 placeholder-slate-500" 
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    handleAiAsk(); 
                  }
                }}
              />
              <button 
                className={`p-3 rounded-xl shadow-md transition-all shrink-0 ${aiPrompt.trim() && !aiTyping ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95' : 'bg-[var(--color-surface-elevated)] text-slate-500 pointer-events-none'}`}
                onClick={handleAiAsk}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 translate-x-[1px] translate-y-[-1px]"/>
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
