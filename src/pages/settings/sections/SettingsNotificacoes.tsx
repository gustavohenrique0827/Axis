import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Target, Users, ShieldAlert, Clock, Mail, Award, Bell, Volume2, ChevronDown, ChevronUp, Save, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export function ConfigNotificacoesPreferencias() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem("axis_notification_prefs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Map back icons from IDs so they render correctly
        const iconMap: Record<string, any> = {
          novo_lead: Target,
          lead_distribuido: Users,
          tarefa_vencida: ShieldAlert,
          tarefa_proxima: Clock,
          proposta_aberta: Mail,
          venda_fechada: Award
        };
        return parsed.map((p: any) => ({
          ...p,
          icon: iconMap[p.id] || Target
        }));
      } catch (e) {
        // ignore
      }
    }
    return [];
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
    // Avoid serializing react components by stripping them
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
    <div className="w-full max-w-4xl mx-auto space-y-6 p-1 sm:p-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Preferências de Notificações</h1>
        <p className="text-xs sm:text-sm text-slate-400">Configure com precisão quais alertas você deseja receber e em quais canais de comunicação comercial.</p>
      </div>

      <div className="grid grid-cols-1 min-[450px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 flex flex-row items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Bell className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <h4 className="text-xs text-slate-300 truncate">In-App</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">Painel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggleChannelAll('inApp', !generalInApp)}
            className={`w-9 h-5 sm:w-10 sm:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${generalInApp ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            <div className={`bg-white w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md transform duration-200 ${generalInApp ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </Card>

        <Card className="p-3 sm:p-4 flex flex-row items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <h4 className="text-xs text-slate-300 truncate">E-mails</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">Entrada</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggleChannelAll('email', !generalEmail)}
            className={`w-9 h-5 sm:w-10 sm:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${generalEmail ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            <div className={`bg-white w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md transform duration-200 ${generalEmail ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </Card>

        <Card className="p-3 sm:p-4 flex flex-row items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <h4 className="text-xs text-slate-300 truncate">Whats</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">Mensagens</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleToggleChannelAll('whatsapp', !generalWhatsapp)}
            className={`w-9 h-5 sm:w-10 sm:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${generalWhatsapp ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            <div className={`bg-white w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md transform duration-200 ${generalWhatsapp ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </Card>

        <Card className="p-3 sm:p-4 flex flex-row items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <h4 className="text-xs text-slate-300 truncate">Sons</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">Alertas som</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            className={`w-9 h-5 sm:w-10 sm:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${soundEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            <div className={`bg-white w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shadow-md transform duration-200 ${soundEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <h3 className="text-sm text-slate-400">Disparadores por Categoria</h3>
          <span className="text-xs text-slate-500">Ajuste individual por canal</span>
        </div>

        <div className="divide-y divide-white/5">
          {Array.from(new Set(prefs.map((p: any) => p.category))).map((category: any) => (
              <div key={category}>
                  <button 
                    className="w-full p-4 flex flex-row items-center justify-between gap-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    onClick={() => setCollapsed(prev => ({...prev, [category]: !prev[category]}))}
                  >
                    <h4 className="font-medium text-sm sm:text-base text-slate-300">{category}</h4>
                    {collapsed[category] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
                  </button>
                  
                  {!collapsed[category] && (
                    <div className="divide-y divide-white/5">
                        {prefs.filter((p: any) => p.category === category).map((pref: any) => {
                          const IconComponent = pref.icon;
                          return (
                            <div key={pref.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors duration-150">
                              <div className="flex gap-3 sm:gap-4 items-start min-w-0 flex-1">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <span className="text-[10px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded leading-none">{pref.category}</span>
                                    <h4 className="text-xs sm:text-sm font-medium text-white leading-snug">{pref.title}</h4>
                                  </div>
                                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1 mr-2 sm:mr-4">{pref.description}</p>
                                </div>
                              </div>

                              <div className="flex gap-4 sm:gap-6 md:gap-8 justify-between md:justify-end items-center shrink-0 border-t border-white/5 pt-3 md:pt-0 md:border-none w-full md:w-auto">
                                <div className="flex flex-col items-center gap-1.5 min-w-[50px]">
                                  <span className="text-[10px] text-slate-500">Painel</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggle(pref.id, 'inApp')}
                                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 ${pref.inApp ? 'bg-blue-600' : 'bg-slate-800 border border-white/5'}`}
                                  >
                                    <div className={`bg-white w-3.5 h-3.5 rounded-full shadow transform duration-200 ${pref.inApp ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                  </button>
                                </div>

                                <div className="flex flex-col items-center gap-1.5 min-w-[50px]">
                                  <span className="text-[10px] text-slate-500">E-mail</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggle(pref.id, 'email')}
                                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 ${pref.email ? 'bg-blue-600' : 'bg-slate-800 border border-white/5'}`}
                                  >
                                    <div className={`bg-white w-3.5 h-3.5 rounded-full shadow transform duration-200 ${pref.email ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                  </button>
                                </div>

                                <div className="flex flex-col items-center gap-1.5 min-w-[50px]">
                                  <span className="text-[10px] text-slate-500">Whats</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggle(pref.id, 'whatsapp')}
                                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 ${pref.whatsapp ? 'bg-blue-600' : 'bg-slate-800 border border-white/5'}`}
                                  >
                                    <div className={`bg-white w-3.5 h-3.5 rounded-full shadow transform duration-200 ${pref.whatsapp ? 'translate-x-4' : 'translate-x-0'}`}></div>
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

        <div className="p-4 sm:p-5 bg-white/[0.01] border-t border-white/5 flex flex-col sm:flex-row justify-end gap-3 w-full">
          <Button 
            type="button"
            onClick={() => {
              setPrefs([]);
              setGeneralEmail(true);
              setGeneralInApp(true);
              setGeneralWhatsapp(true);
              toast.success("Configurações originais restauradas!");
            }}
            variant="ghost" 
            className="text-slate-400 hover:text-white text-xs sm:text-sm order-2 sm:order-1 self-center sm:self-auto"
          >
            Restaurar Padrão
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-[#2563EB] hover:bg-blue-600 px-6 text-xs sm:text-sm order-1 sm:order-2 w-full sm:w-auto flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Salvar Preferências
          </Button>
        </div>
      </Card>
    </div>
  );
}
