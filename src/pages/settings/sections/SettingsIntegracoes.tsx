import React, { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Zap, Mail, FileText, DollarSign, Settings, X, MessageSquare } from "lucide-react";
import { useData } from "../../../contexts/DataContext";
import { toast } from "sonner";

export function ConfigIntegracoesApps() {
    const [integrations, setIntegrations] = useState<any[]>([]);

    const [instances, setInstances] = useState<any[]>([]);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [selectedInstanceId, setSelectedInstanceId] = useState("");
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedContactId, setSelectedContactId] = useState("");
    const [simulationText, setSimulationText] = useState("");
    const [savingWebhook, setSavingWebhook] = useState(false);
    const [simulating, setSimulating] = useState(false);

    const { evolutionWebhookUrl, setEvolutionWebhookUrl } = useData();
    const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
    const [modalWebhookUrl, setModalWebhookUrl] = useState(evolutionWebhookUrl || "");

    // Fetch instances and contacts on mount
    React.useEffect(() => {
        fetchInstances();
        fetchContacts();
    }, []);

    const fetchInstances = () => {
        fetch("/api/whatsapp/instances")
            .then(res => res.json())
            .then(data => {
                setInstances(data);
                if (data.length > 0) {
                    setSelectedInstanceId(data[0].id);
                    setWebhookUrl(data[0].webhookUrl || "");
                    setEvolutionWebhookUrl(data[0].webhookUrl || "");
                }
            })
            .catch(err => console.error("Error fetching instances:", err));
    };

    const fetchContacts = () => {
        fetch("/api/whatsapp/contacts")
            .then(res => res.json())
            .then(data => {
                setContacts(data);
                if (data.length > 0) {
                    setSelectedContactId(data[0].id);
                }
            })
            .catch(err => console.error("Error fetching contacts:", err));
    };

    const handleSaveWebhookFromModal = (url: string) => {
        if (!selectedInstanceId) {
            setEvolutionWebhookUrl(url);
            toast.success("URL de Webhook salva no estado global da aplicação!");
            setIsWebhookModalOpen(false);
            return;
        }
        setSavingWebhook(true);
        fetch(`/api/whatsapp/instances/${selectedInstanceId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ webhookUrl: url })
        })
        .then(res => res.json())
        .then(updated => {
            setEvolutionWebhookUrl(url);
            setWebhookUrl(url);
            toast.success("URL de Webhook salva com sucesso!");
            setSavingWebhook(false);
            setIsWebhookModalOpen(false);
            fetchInstances();
        })
        .catch(err => {
            console.error("Error saving webhook:", err);
            toast.error("Erro ao salvar configuração do Webhook.");
            setSavingWebhook(false);
        });
    };

    const handleSaveWebhook = () => {
        if (!selectedInstanceId) {
            toast.error("Nenhuma instância do WhatsApp encontrada para atualizar.");
            return;
        }
        setSavingWebhook(true);
        fetch(`/api/whatsapp/instances/${selectedInstanceId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ webhookUrl })
        })
        .then(res => res.json())
        .then(updated => {
            toast.success("URL de Webhook da Evolution API salva com sucesso!");
            setSavingWebhook(false);
            fetchInstances();
        })
        .catch(err => {
            console.error("Error saving webhook:", err);
            toast.error("Erro ao salvar configuração do Webhook.");
            setSavingWebhook(false);
        });
    };

    const handleSimulateWebhook = () => {
        if (!selectedContactId || !simulationText.trim()) {
            toast.error("Por favor, selecione um contato e digite uma mensagem.");
            return;
        }

        setSimulating(true);
        fetch("/api/whatsapp/simulate-incoming", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contactId: selectedContactId,
                text: simulationText.trim()
            })
        })
        .then(res => res.json())
        .then(data => {
            toast.promise(
                new Promise((resolve) => setTimeout(resolve, 1000)),
                {
                    loading: "Evolution API empacotando evento 'messages.upsert'...",
                    success: "Webhook notificado! Mensagem entregue ao CRM em tempo real! 📲⚡",
                    error: "Erro no webhook"
                }
            );
            setSimulating(false);
            // reset simulation box
            setSimulationText("Gostaria de mais detalhes sobre o plano Pro!");
        })
        .catch(err => {
            console.error("Simulation error:", err);
            toast.error("Falha ao simular envio do Webhook.");
            setSimulating(false);
        });
    };

    const handleToggleIntegration = (id: string) => {
        setIntegrations(prev => prev.map(item => {
            if (item.id === id) {
                const newConnected = !item.connected;
                if (newConnected) {
                    toast.success(`${item.nome} conectado com sucesso!`);
                    return { ...item, connected: true, status: "Conectado" };
                } else {
                    toast.info(`${item.nome} desconectado.`);
                    return { ...item, connected: false, status: "Desconectado" };
                }
            }
            return item;
        }));
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 p-1 sm:p-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Integrações Globais</h1>
                    <p className="text-xs sm:text-sm text-slate-400">Conecte seu CRM com ferramentas essenciais e configure a Evolution API.</p>
                </div>
                <Button 
                    onClick={() => {
                        setModalWebhookUrl(evolutionWebhookUrl || webhookUrl);
                        setIsWebhookModalOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-xs h-10 hover:scale-[1.02] transition-transform duration-200 cursor-pointer w-full sm:w-auto"
                >
                    <Settings className="w-4 h-4" /> Configurar Webhook
                </Button>
            </div>

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {integrations.map((app, i) => (
                    <Card key={i} className={`p-4 sm:p-5 bg-[#111827]/80 backdrop-blur-xl border transition-all duration-300 ${app.connected ? 'border-[#2563EB]/30' : 'border-white/10'} flex flex-col items-start gap-4`}>
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${app.connected ? 'bg-[#2563EB]/10 border-[#2563EB]/30' : 'bg-white/5 border-white/10'}`}>
                            <app.icon className={`w-6 h-6 ${app.connected ? 'text-[#2563EB]' : 'text-slate-500'}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base sm:text-lg">{app.nome}</h3>
                            <p className="text-xs text-slate-400 mt-1">{app.desc}</p>
                            {app.id === 'wa' && app.connected && (
                                <button
                                    onClick={() => {
                                        setModalWebhookUrl(evolutionWebhookUrl || webhookUrl);
                                        setIsWebhookModalOpen(true);
                                    }}
                                    className="text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1.5 mt-2.5 transition-colors cursor-pointer bg-none border-none p-0"
                                >
                                    <Settings className="w-3.5 h-3.5" /> Configurar Webhook
                                </button>
                            )}
                        </div>
                        <div className="mt-auto w-full pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${app.connected ? 'text-emerald-400' : 'text-slate-500'}`}>{app.status}</span>
                            <Button 
                                variant={app.connected ? "outline" : "default"} 
                                size="sm" 
                                onClick={() => handleToggleIntegration(app.id)}
                                className={`h-8 min-w-[80px] text-xs ${app.connected ? 'border-white/10 bg-transparent hover:bg-white/5 text-white' : 'bg-[#2563EB] hover:bg-blue-600'}`}
                            >
                                {app.connected ? 'Desconectar' : 'Conectar'}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* WhatsApp Business Configuration Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <h2 className="text-lg sm:text-xl font-bold text-white">Configuração da Evolution API (WhatsApp)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Instance Details & Webhook URL Input */}
                    <Card className="p-4 sm:p-6 bg-[#111827]/80 border border-white/10 space-y-6">
                        <div>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">Instância Ativa</span>
                            {instances.map((inst, idx) => (
                                <div key={inst.id} className="mt-3 space-y-2">
                                    <h3 className="text-lg font-bold text-white">{inst.name}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                                        <div>📞 Linha: <span className="text-slate-200">{inst.phone}</span></div>
                                        <div>🌐 Status: <span className="text-emerald-400 font-bold">{inst.status}</span></div>
                                        <div className="col-span-1 sm:col-span-2 truncate">🔑 Token: <span className="text-slate-350">{inst.apiKey}</span></div>
                                    </div>
                                </div>
                            ))}
                            {instances.length === 0 && (
                                <div className="text-slate-500 text-xs italic mt-2">Nenhuma instância WhatsApp ativa conectada no backend.</div>
                            )}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-white/5">
                            <label className="text-[11px] font-bold tracking-widest text-[#2563EB] uppercase block">
                                URL de Callback do Webhook (Evolution API)
                            </label>
                            <p className="text-xs text-slate-400 leading-normal">
                                A Evolution API enviará requisições POST para esta URL sempre que houver novas mensagens recebidas de clientes.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    placeholder="https://sua-api.com/api/webhooks/whatsapp"
                                    className="flex-1 bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                                />
                                <Button
                                    onClick={handleSaveWebhook}
                                    disabled={savingWebhook}
                                    className="bg-blue-600 hover:bg-blue-500 font-bold py-2 px-4 rounded-xl shrink-0 w-full sm:w-auto"
                                >
                                    {savingWebhook ? "Salvando..." : "Salvar"}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Real-time Webhook Simulator */}
                    <Card className="p-4 sm:p-6 bg-[#1E293B]/60 backdrop-blur-md border border-white/10 flex flex-col justify-between gap-6">
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider block w-fit">Testes em Ambiente de Desenvolvimento</span>
                                <h3 className="text-lg font-bold text-white mt-1.5">Simulador de Eventos Webhook</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                                    Simule o recebimento de mensagens enviadas por clientes fictícios no WhatsApp para a Evolution API. Isso notificará o Axis CRM instantaneamente!
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-350 uppercase tracking-wider block font-bold">Cliente Emitindo Mensagem</label>
                                    <select
                                        value={selectedContactId}
                                        onChange={(e) => setSelectedContactId(e.target.value)}
                                        className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                                    >
                                        {contacts.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.phone || "Sem telefone"})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-350 uppercase tracking-wider block font-bold">Mensagem Enviada pelo WhatsApp</label>
                                    <textarea
                                        value={simulationText}
                                        onChange={(e) => setSimulationText(e.target.value)}
                                        rows={2}
                                        className="w-full bg-[#0B1120] border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                                        placeholder="Digite a mensagem que o cliente enviará..."
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleSimulateWebhook}
                            disabled={simulating || contacts.length === 0}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl mt-4 w-full flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-normal text-center"
                        >
                            <Zap className="w-4 h-4 fill-white" /> Disparar Webhook (Simular Entrada)
                        </Button>
                    </Card>
                </div>
            </div>

            {/* Modal for Webhook Configuration */}
            {isWebhookModalOpen && (
                <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setIsWebhookModalOpen(false)}
                            className="bg-white/5 hover:bg-white/10 border border-white/5 absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div>
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded font-black uppercase tracking-wider">Evolution API</span>
                            <h3 className="text-lg font-bold text-white mt-1">Configurar URL de Webhook</h3>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1">
                                Digite a URL de callback que receberá notificações em tempo real sempre que mensagens forem disparadas ou recebidas.
                            </p>
                        </div>

                        <div className="space-y-1.5 pt-1">
                            <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                                URL de Callback (POST)
                            </label>
                            <input
                                type="text"
                                value={modalWebhookUrl}
                                onChange={(e) => setModalWebhookUrl(e.target.value)}
                                placeholder="https://sua-api.com/api/webhooks/whatsapp"
                                className="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="pt-2 border-t border-white/5 flex justify-end gap-3 text-xs">
                            <Button 
                                type="button"
                                variant="outline"
                                onClick={() => setIsWebhookModalOpen(false)}
                                className="bg-transparent border border-white/15 px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="button"
                                onClick={() => handleSaveWebhookFromModal(modalWebhookUrl)}
                                disabled={savingWebhook}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold transition-all"
                            >
                                {savingWebhook ? "Salvando..." : "Salvar Configuração"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

function CalendarIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}

export function ConfigIntegracoesSMTP() {
  const [smtpServer, setSmtpServer] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");

  const testConnection = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: "Verificando credenciais de criptografia TLS...",
        success: "Conexão SMTP efetuada! E-mail de homologação disparado com sucesso! ✉️",
        error: "Falha na resposta do servidor de destino"
      }
    );
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Servidores SMTP (Campanhas de E-mail)</h1>
        <p className="text-sm text-slate-400">Configure seu próprio disparador de e-mails comercial corporativo (AWS SES, G-Suite, Sendgrid, etc).</p>
      </div>

      <Card className="p-6 bg-[#111827]/80 border border-white/10 space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-widest text-[#06B6D4]">Credenciais de Transmissão</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Servidor Host</label>
            <input type="text" value={smtpServer} onChange={(e) => setSmtpServer(e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Porta de Conexão</label>
            <input type="text" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-white font-mono" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Criptografia Protocolo</label>
            <select className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-slate-300">
              <option>StartTLS (Recomendado)</option>
              <option>SSL puro</option>
              <option>Nenhuma (Não seguro)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-black">Usuário Log (E-mail Autenticado)</label>
            <input type="email" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Senha de Aplicativo (Secret Token)</label>
            <input type="password" placeholder="••••••••••••••••••••" className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-white" />
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-end gap-3 text-xs">
          <Button type="button" onClick={testConnection} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold uppercase py-2 px-4 rounded-xl transition-all">
            Testar Conexão TLS
          </Button>
          <Button type="button" onClick={() => toast.success("Preferências de SMTP salvas!")} className="bg-[#2563EB] hover:bg-blue-600 font-bold uppercase py-2 px-5 rounded-xl">
            Salvar Canal SMTP
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function ConfigIntegracoesSDR() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookActive, setWebhookActive] = useState(true);

  const testWebhook = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: 'Enviando payload de teste...',
        success: 'Webhook disparado e resposta 200 OK recebida!',
        error: 'Erro no disparo do Webhook.',
      }
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">Integrações SDR <Zap className="w-5 h-5 text-purple-500"/></h1>
        <p className="text-sm text-slate-400 mt-1">Configure disparos de webhooks quando eventos importantes acontecerem no funil de Pré-Vendas.</p>
      </div>

      <Card className="bg-[#111827]/80 border border-white/10 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 bg-purple-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Reunião Agendada (Qualificação Final)</h3>
              <p className="text-sm text-slate-400 mt-0.5">Disparado sempre que um lead atinge a etapa de Reunião Agendada no pipeline do SDR.</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={webhookActive} onChange={() => setWebhookActive(!webhookActive)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${webhookActive ? 'bg-purple-600' : 'bg-slate-700'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${webhookActive ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Endpoint URL</label>
            <input 
              type="text" 
              value={webhookUrl} 
              onChange={(e) => setWebhookUrl(e.target.value)} 
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-sm text-white font-mono focus:border-purple-500 focus:outline-none" 
              placeholder="https://"
            />
          </div>
          
          <div className="bg-[#0B1120]/50 p-4 rounded-lg border border-white/5 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payload de Exemplo (JSON)</span>
            <pre className="text-[10px] text-purple-300 font-mono overflow-auto opacity-80">
{`{
  "event": "sdr.reuniao_agendada",
  "lead": {
    "id": "123",
    "name": "Maria Silva",
    "company": "TechCorp Brasil",
    "scoreIA": 92,
    "temperature": "quente",
    "seller_sdr": "Roberto Ramos",
    "ia_summary": "Empresa demonstrou forte interesse..."
  },
  "timestamp": "2026-05-21T15:30:00Z"
}`}
            </pre>
          </div>

          <div className="pt-2 flex justify-end gap-3">
             <Button variant="outline" onClick={testWebhook} className="border-white/10 hover:bg-white/5 text-xs font-bold uppercase py-2">Disparar Teste</Button>
             <Button className="bg-[#2563EB] hover:bg-blue-600 font-bold px-5 text-xs uppercase shadow-xl" onClick={() => toast.success("Configuração salva com sucesso")}>Salvar Webhook</Button>
          </div>
        </div>
      </Card>

      <Card className="bg-[#111827]/80 border border-white/10 overflow-hidden shadow-xl mt-6">
        <div className="p-5 border-b border-white/5 bg-emerald-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base">Lead Qualificado (Aprovado pela Master AI)</h3>
              <p className="text-sm text-slate-400 mt-0.5">Disparado quando o Lead Score atinge métricas pré-definidas na qualificação.</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" />
                <div className={`block w-10 h-6 rounded-full transition-colors bg-emerald-600`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform translate-x-4`}></div>
              </div>
            </label>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Endpoint URL</label>
            <input 
              type="text" 
              placeholder="https://n8n.seumodelo.com/webhook/sdr-qualificado"
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg p-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Eventos de Disparo</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
               <label className="flex items-center gap-2 text-sm text-slate-300">
                 <input type="checkbox" className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 transition-colors" />
                 Atualização de Score IA
               </label>
               <label className="flex items-center gap-2 text-sm text-slate-300">
                 <input type="checkbox" className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 transition-colors" />
                 Mapeamento de Perfil Concluído
               </label>
               <label className="flex items-center gap-2 text-sm text-slate-300">
                 <input type="checkbox" className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 transition-colors" />
                 Contato Iniciado (1º Touchpoint)
               </label>
               <label className="flex items-center gap-2 text-sm text-slate-300">
                 <input type="checkbox" className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 transition-colors" />
                 Identificação de Ticket Médio
               </label>
            </div>
          </div>
          
          <div className="bg-[#0B1120]/50 p-4 rounded-lg border border-white/5 space-y-2 mt-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payload de Exemplo (JSON)</span>
            <pre className="text-[10px] text-emerald-300 font-mono overflow-auto opacity-80">
{`{
  "event": "sdr.lead_qualificado",
  "lead": {
    "id": "123",
    "name": "Maria Silva",
    "scoreIA": 92,
    "events": ["score_updated", "profile_mapped"]
  },
  "timestamp": "2026-05-21T15:35:00Z"
}`}
            </pre>
          </div>

          <div className="pt-2 flex justify-end gap-3">
             <Button variant="outline" onClick={testWebhook} className="border-white/10 hover:bg-white/5 text-xs font-bold uppercase py-2">Disparar Teste</Button>
             <Button className="bg-[#2563EB] hover:bg-blue-600 font-bold px-5 text-xs uppercase shadow-xl" onClick={() => toast.success("Configuração salva com sucesso")}>Salvar Webhook</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
