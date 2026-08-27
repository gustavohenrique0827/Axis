import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Target, Users, ShieldAlert, Clock, Mail, Award, Bell, Volume2, ChevronDown, ChevronUp, Save, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_NOTIFICATION_PREFS = [
  { id: "novo_lead", category: "Comercial / CRM", title: "Novo Lead Cadastrado", description: "Notificar quando um lead entrar pelo formulário ou anúncio", inApp: true, email: true, whatsapp: true },
  { id: "lead_distribuido", category: "Comercial / CRM", title: "Lead Atribuído", description: "Avisar o vendedor/SDR responsável no momento da distribuição", inApp: true, email: true, whatsapp: true },
  { id: "tarefa_vencida", category: "Produtividade", title: "Tarefa Vencida", description: "Alerta de atraso em atividades e reuniões agendadas", inApp: true, email: false, whatsapp: true },
  { id: "tarefa_proxima", category: "Produtividade", title: "Lembrete 15min Antes", description: "Aviso de reunião ou follow-up com cliente próximo de acontecer", inApp: true, email: false, whatsapp: true },
  { id: "proposta_aberta", category: "Vendas", title: "Proposta Visualizada", description: "Notificar em tempo real quando o cliente abrir a proposta de venda", inApp: true, email: true, whatsapp: false },
  { id: "venda_fechada", category: "Vendas", title: "Venda Fechada / Contrato Assinado", description: "Celebrar e disparar fluxo de onboarding financeiro", inApp: true, email: true, whatsapp: true },
];

const iconMap: Record<string, any> = {
  novo_lead: Target,
  lead_distribuido: Users,
  tarefa_vencida: ShieldAlert,
  tarefa_proxima: Clock,
  proposta_aberta: Mail,
  venda_fechada: Award
};

export function ConfigNotificacoesPreferencias() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem("axis_notification_prefs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            icon: iconMap[p.id] || Target
          }));
        }
      }
    } catch {}
    return DEFAULT_NOTIFICATION_PREFS.map(p => ({ ...p, icon: iconMap[p.id] || Target }));
  });

  const [generalEmail, setGeneralEmail] = useState(true);
  const [generalWhatsapp, setGeneralWhatsapp] = useState(true);
  const [generalInApp, setGeneralInApp] = useState(true);

  const handleToggle = (id: string, channel: 'inApp' | 'email' | 'whatsapp') => {
    setPrefs((prev: any[]) => prev.map(p => {
      if (p.id === id) {
        return { ...p, [channel]: !p[channel] };
      }
      return p;
    }));
  };

  const handleSave = () => {
    const output = prefs.map(({ icon, ...p }: any) => p);
    localStorage.setItem("axis_notification_prefs", JSON.stringify(output));
    toast.success("Preferências de notificações salvas com sucesso!");
  };

  const handleToggleChannelAll = (channel: 'inApp' | 'email' | 'whatsapp', value: boolean) => {
    setPrefs((prev: any[]) => prev.map(p => ({ ...p, [channel]: value })));
    if (channel === 'inApp') setGeneralInApp(value);
    if (channel === 'email') setGeneralEmail(value);
    if (channel === 'whatsapp') setGeneralWhatsapp(value);
    toast.info(`Todas as notificações de ${channel === 'inApp' ? 'Plataforma' : channel === 'email' ? 'E-mail' : 'WhatsApp'} foram ${value ? 'ativadas' : 'desativadas'}.`);
  };

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("axis_whatsapp_sound") !== "false";
  });

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem("axis_whatsapp_sound", String(newVal));
    toast.info(`Alerta sonoro de nova mensagem ${newVal ? 'ativado' : 'desativado'}.`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-1 sm:p-2 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
          Preferências de Notificações <Bell className="w-5 h-5 text-[var(--color-primary-blue)]" />
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">Configure com precisão quais alertas você deseja receber e em quais canais de comunicação comercial.</p>
      </div>

      <div className="grid grid-cols-1 min-[450px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3.5 sm:p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] flex flex-row items-center justify-between gap-3 shadow-sm min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[var(--color-primary-blue)]/10 text-[var(--color-primary-blue)] shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-[var(--color-text-primary)] truncate">In-App</h4>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">Painel</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => handleToggleChannelAll('inApp', !generalInApp)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 border-none ${generalInApp ? 'bg-[var(--color-primary-blue)]' : 'bg-slate-700'}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${generalInApp ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </Card>

        <Card className="p-3.5 sm:p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] flex flex-row items-center justify-between gap-3 shadow-sm min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-[var(--color-text-primary)] truncate">E-mails</h4>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">Entrada</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => handleToggleChannelAll('email', !generalEmail)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 border-none ${generalEmail ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${generalEmail ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </Card>

        <Card className="p-3.5 sm:p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] flex flex-row items-center justify-between gap-3 shadow-sm min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-[var(--color-text-primary)] truncate">WhatsApp</h4>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">Mensagens</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => handleToggleChannelAll('whatsapp', !generalWhatsapp)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 border-none ${generalWhatsapp ? 'bg-cyan-500' : 'bg-slate-700'}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${generalWhatsapp ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </Card>

        <Card className="p-3.5 sm:p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] flex flex-row items-center justify-between gap-3 shadow-sm min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-[var(--color-text-primary)] truncate">Sons</h4>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">Alertas som</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={toggleSound}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 border-none ${soundEnabled ? 'bg-purple-500' : 'bg-slate-700'}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${soundEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </Card>
      </div>

      <Card className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <h3 className="text-xs font-bold text-[var(--color-primary-blue)] uppercase tracking-wider">Disparadores por Categoria</h3>
          <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Ajuste individual por canal</span>
        </div>

        <div className="divide-y divide-[var(--color-border-subtle)]">
          {Array.from(new Set(prefs.map((p: any) => p.category))).map((category: any) => (
              <div key={category}>
                  <button 
                    className="w-full p-4 flex flex-row items-center justify-between gap-4 bg-[var(--color-surface-sunken)] hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer border-none"
                    onClick={() => setCollapsed(prev => ({...prev, [category]: !prev[category]}))}
                  >
                    <h4 className="font-bold text-sm text-[var(--color-text-primary)]">{category}</h4>
                    {collapsed[category] ? <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" /> : <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />}
                  </button>
                  
                  {!collapsed[category] && (
                    <div className="divide-y divide-[var(--color-border-subtle)]">
                        {prefs.filter((p: any) => p.category === category).map((pref: any) => {
                          const IconComponent = pref.icon;
                          return (
                            <div key={pref.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--color-surface-sunken)]/50 transition-colors duration-150">
                              <div className="flex gap-3 sm:gap-4 items-start min-w-0 flex-1">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-primary-blue)] shrink-0 mt-0.5">
                                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]">{pref.category}</span>
                                    <h4 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] leading-snug">{pref.title}</h4>
                                  </div>
                                  <p className="text-xs text-[var(--color-text-muted)] mt-1 mr-2 sm:mr-4">{pref.description}</p>
                                </div>
                              </div>

                              <div className="flex gap-4 sm:gap-6 md:gap-8 justify-between md:justify-end items-center shrink-0 border-t border-[var(--color-border-subtle)] pt-3 md:pt-0 md:border-none w-full md:w-auto">
                                <div className="flex flex-col items-center gap-1.5 min-w-[50px]">
                                  <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Painel</span>
                                  <button 
                                    type="button"
                                    onClick={() => handleToggle(pref.id, 'inApp')}
                                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 border-none ${pref.inApp ? 'bg-[var(--color-primary-blue)]' : 'bg-slate-700'}`}
                                  >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${pref.inApp ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                  </button>
                                </div>

                                <div className="flex flex-col items-center gap-1.5 min-w-[50px]">
                                  <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">E-mail</span>
                                  <button 
                                    type="button"
                                    onClick={() => handleToggle(pref.id, 'email')}
                                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 border-none ${pref.email ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                  >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${pref.email ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                  </button>
                                </div>

                                <div className="flex flex-col items-center gap-1.5 min-w-[50px]">
                                  <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Whats</span>
                                  <button 
                                    type="button"
                                    onClick={() => handleToggle(pref.id, 'whatsapp')}
                                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 border-none ${pref.whatsapp ? 'bg-cyan-500' : 'bg-slate-700'}`}
                                  >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${pref.whatsapp ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
              </div>
          ))}
        </div>

        <div className="p-4 sm:p-5 bg-[var(--color-surface-sunken)] border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row justify-end gap-2.5 w-full">
          <Button 
            type="button"
            onClick={() => {
              const def = DEFAULT_NOTIFICATION_PREFS.map(p => ({ ...p, icon: iconMap[p.id] || Target }));
              setPrefs(def);
              setGeneralEmail(true);
              setGeneralInApp(true);
              setGeneralWhatsapp(true);
              localStorage.setItem("axis_notification_prefs", JSON.stringify(DEFAULT_NOTIFICATION_PREFS));
              toast.success("Configurações originais restauradas!");
            }}
            variant="ghost" 
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] order-2 sm:order-1"
          >
            Restaurar Padrão
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            className="h-9 px-5 text-xs font-bold gap-1.5 shadow-xs order-1 sm:order-2"
          >
            <Save className="w-3.5 h-3.5" /> Salvar Preferências
          </Button>
        </div>
      </Card>
    </div>
  );
}
