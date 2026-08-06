import React, { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Zap, Settings, MessageSquare } from "lucide-react";
import { useData } from "../../../../contexts/DataContext";
import { toast } from "sonner";
import { Modal } from "../../../../components/ui/modal";
import { NovaIntegracaoModal } from "../../../../components/ui/modals/settings/NovaIntegracaoModal";
import { apiFetch } from "../../../../lib/apiClient";
import { HubspotIntegrationSection } from "./HubspotIntegrationSection";

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
  const [isNovaIntegracaoModalOpen, setIsNovaIntegracaoModalOpen] = useState(false);

  React.useEffect(() => {
    fetchInstances();
    fetchContacts();
  }, []);

  const fetchInstances = () => {
    apiFetch("/api/whatsapp/instances")
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
    apiFetch("/api/whatsapp/contacts")
      .then(res => res.json())
      .then(data => {
        setContacts(data);
        if (data.length > 0) setSelectedContactId(data[0].id);
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
    apiFetch(`/api/whatsapp/instances/${selectedInstanceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookUrl: url }),
    })
      .then(res => res.json())
      .then(() => {
        setEvolutionWebhookUrl(url);
        setWebhookUrl(url);
        toast.success("URL de Webhook salva com sucesso!");
        setSavingWebhook(false);
        setIsWebhookModalOpen(false);
        fetchInstances();
      })
      .catch(() => {
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
    apiFetch(`/api/whatsapp/instances/${selectedInstanceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookUrl }),
    })
      .then(res => res.json())
      .then(() => {
        toast.success("URL de Webhook da Evolution API salva com sucesso!");
        setSavingWebhook(false);
        fetchInstances();
      })
      .catch(() => {
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
    apiFetch("/api/whatsapp/simulate-incoming", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: selectedContactId, text: simulationText.trim() }),
    })
      .then(res => res.json())
      .then(() => {
        toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
          loading: "Evolution API empacotando evento 'messages.upsert'...",
          success: "Webhook notificado! Mensagem entregue ao CRM em tempo real! 📲⚡",
          error: "Erro no webhook",
        });
        setSimulating(false);
        setSimulationText("Gostaria de mais detalhes sobre o plano Pro!");
      })
      .catch(() => {
        toast.error("Falha ao simular envio do Webhook.");
        setSimulating(false);
      });
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newConnected = !item.connected;
          toast[newConnected ? "success" : "info"](`${item.nome} ${newConnected ? "conectado" : "desconectado"}.`);
          return { ...item, connected: newConnected, status: newConnected ? "Conectado" : "Desconectado" };
        }
        return item;
      })
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 p-1 sm:p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Integrações Globais</h1>
          <p className="text-xs sm:text-sm text-slate-400">Conecte seu CRM com ferramentas essenciais e configure a Evolution API.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setIsNovaIntegracaoModalOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-500 font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-xs h-10 flex-1 sm:flex-initial"
          >
            <Zap className="w-4 h-4" /> Nova Integração
          </Button>
          <Button
            onClick={() => { setModalWebhookUrl(evolutionWebhookUrl || webhookUrl); setIsWebhookModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-500 font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-xs h-10 flex-1 sm:flex-initial"
          >
            <Settings className="w-4 h-4" /> Configurar Webhook
          </Button>
        </div>
      </div>

      {/* Integrations grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {integrations.map((app, i) => (
          <Card key={i} className={`p-4 sm:p-5 bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl border transition-all duration-300 ${app.connected ? "border-[#2563EB]/30" : "border-white/10"} flex flex-col items-start gap-4`}>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${app.connected ? "bg-[#2563EB]/10 border-[#2563EB]/30" : "bg-white/5 border-white/10"}`}>
              <app.icon className={`w-6 h-6 ${app.connected ? "text-[#2563EB]" : "text-slate-500"}`} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">{app.nome}</h3>
              <p className="text-xs text-slate-400 mt-1">{app.desc}</p>
              {app.id === "wa" && app.connected && (
                <button
                  onClick={() => { setModalWebhookUrl(evolutionWebhookUrl || webhookUrl); setIsWebhookModalOpen(true); }}
                  className="text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1.5 mt-2.5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" /> Configurar Webhook
                </button>
              )}
            </div>
            <div className="mt-auto w-full pt-4 border-t border-white/5 flex justify-between items-center">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${app.connected ? "text-emerald-400" : "text-slate-500"}`}>{app.status}</span>
              <Button
                variant={app.connected ? "outline" : "default"}
                size="sm"
                onClick={() => handleToggleIntegration(app.id)}
                className={`h-8 min-w-[80px] text-xs ${app.connected ? "border-white/10 bg-transparent hover:bg-white/5 text-white" : "bg-[#2563EB] hover:bg-blue-600"}`}
              >
                {app.connected ? "Desconectar" : "Conectar"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <HubspotIntegrationSection />

      {/* WhatsApp / Evolution API section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Configuração da Evolution API (WhatsApp)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instance details & webhook input */}
          <Card className="p-4 sm:p-6 bg-[var(--color-surface-elevated)]/80 border border-white/10 space-y-6">
            <div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">Instância Ativa</span>
              {instances.map(inst => (
                <div key={inst.id} className="mt-3 space-y-2">
                  <h3 className="text-lg font-bold text-white">{inst.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                    <div>📞 Linha: <span className="text-slate-200">{inst.phone}</span></div>
                    <div>🌐 Status: <span className="text-emerald-400 font-bold">{inst.status}</span></div>
                    <div className="col-span-2 truncate">🔑 Token: <span className="text-slate-400">{inst.apiKey}</span></div>
                  </div>
                </div>
              ))}
              {instances.length === 0 && (
                <div className="text-slate-500 text-xs italic mt-2">Nenhuma instância WhatsApp ativa conectada no backend.</div>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-[11px] font-bold tracking-widest text-[#2563EB] uppercase block">URL de Callback do Webhook (Evolution API)</label>
              <p className="text-xs text-slate-400 leading-normal">A Evolution API enviará requisições POST para esta URL sempre que houver novas mensagens recebidas de clientes.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://sua-api.com/api/webhooks/whatsapp"
                  className="flex-1 bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none w-full"
                />
                <Button onClick={handleSaveWebhook} disabled={savingWebhook} className="bg-blue-600 hover:bg-blue-500 font-bold py-2 px-4 rounded-xl shrink-0 w-full sm:w-auto">
                  {savingWebhook ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Webhook simulator */}
          <Card className="p-4 sm:p-6 bg-[var(--color-surface-elevated)]/60 backdrop-blur-md border border-white/10 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider block w-fit">Testes em Ambiente de Desenvolvimento</span>
                <h3 className="text-lg font-bold text-white mt-1.5">Simulador de Eventos Webhook</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">Simule o recebimento de mensagens enviadas por clientes fictícios no WhatsApp para a Evolution API.</p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Cliente Emitindo Mensagem</label>
                  <select value={selectedContactId} onChange={e => setSelectedContactId(e.target.value)} className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none">
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone || "Sem telefone"})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Mensagem Enviada pelo WhatsApp</label>
                  <textarea
                    value={simulationText}
                    onChange={e => setSimulationText(e.target.value)}
                    rows={2}
                    className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="Digite a mensagem que o cliente enviará..."
                  />
                </div>
              </div>
            </div>
            <Button onClick={handleSimulateWebhook} disabled={simulating || contacts.length === 0} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl w-full flex items-center justify-center gap-2 text-xs sm:text-sm">
              <Zap className="w-4 h-4 fill-white" /> Disparar Webhook (Simular Entrada)
            </Button>
          </Card>
        </div>
      </div>

      {/* Webhook config modal */}
      {isWebhookModalOpen && (
        <Modal
          isOpen={isWebhookModalOpen}
          onClose={() => setIsWebhookModalOpen(false)}
          title="Configurar URL de Webhook"
          maxWidth="max-w-md"
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setIsWebhookModalOpen(false)} className="bg-transparent border border-white/15 px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                Cancelar
              </Button>
              <Button type="button" onClick={() => handleSaveWebhookFromModal(modalWebhookUrl)} disabled={savingWebhook} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold transition-all">
                {savingWebhook ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded font-black uppercase tracking-wider">Evolution API</span>
            <p className="text-xs text-slate-400 leading-relaxed">Digite a URL de callback que receberá notificações em tempo real sempre que mensagens forem disparadas ou recebidas.</p>
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">URL de Callback (POST)</label>
              <input
                type="text"
                value={modalWebhookUrl}
                onChange={e => setModalWebhookUrl(e.target.value)}
                placeholder="https://sua-api.com/api/webhooks/whatsapp"
                className="w-full bg-[var(--color-surface)] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </Modal>
      )}

      <NovaIntegracaoModal
        isOpen={isNovaIntegracaoModalOpen}
        onClose={() => setIsNovaIntegracaoModalOpen(false)}
        onSave={data => {
          setIntegrations([...integrations, { id: Date.now().toString(), ...data }]);
          toast.success(`Integração "${data.nome}" criada com sucesso!`);
          setIsNovaIntegracaoModalOpen(false);
        }}
      />
    </div>
  );
}
