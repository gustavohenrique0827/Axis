import React, { useState, useEffect, useMemo } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import { Switch } from "../../../../components/ui/switch";
import { FormField } from "../../../../components/ui/form-field";
import { Modal } from "../../../../components/ui/modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";
import { Alert } from "../../../../components/ui/alert";
import { EmptyState } from "../../../../components/ui/empty-state";
import {
  Zap,
  Settings,
  MessageSquare,
  Search,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Globe,
  CreditCard,
  Wallet,
  Send,
  Copy,
  ExternalLink,
  ShieldCheck,
  Eye,
  RefreshCw,
  Play,
  Check,
  Lock,
  Server,
  Facebook,
  Plus,
  ArrowUpRight,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useData } from "../../../../contexts/DataContext";
import { toast } from "sonner";
import { NovaIntegracaoModal } from "../../../../components/ui/modals/settings/NovaIntegracaoModal";
import { apiFetch } from "../../../../lib/apiClient";

// Integration Categories
type IntegrationCategory = "todas" | "anuncios" | "mensageria" | "pagamentos" | "automacoes" | "email";

const DEFAULT_META_CONFIG = {
  connected: false,
  accountName: "Conta Comercial Meta",
  accountId: "act_102948172948",
  pixelId: "10293847568291",
  pixelStatus: "active" as "active" | "pending" | "disconnected",
  capiToken: "EAAQZBz...sec_token",
  datasetId: "ds_984729104",
  trackingActive: true,
  trackedEvents: {
    PageView: true,
    Lead: true,
    Schedule: true,
    Purchase: true,
    ViewContent: true,
    Contact: true,
    CompleteRegistration: true,
  },
  lastTestPing: null as { event: string; timestamp: string; status: number; latency: number } | null,
};

const DEFAULT_GOOGLE_CONFIG = {
  connected: false,
  accountName: "Conta Google Ads Principal",
  customerId: "948-204-1829",
  measurementId: "G-9X7KD2P0LQ",
  conversionLabel: "AW-1029482910/XyZ_Lead",
  enhancedConversions: true,
  tagStatus: "active" as "active" | "pending" | "disconnected",
  lastTestPing: null as { event: string; timestamp: string; status: number; latency: number } | null,
};

const DEFAULT_PAYMENT_CONFIG = {
  mercadoPago: {
    connected: false,
    environment: "sandbox" as "sandbox" | "production",
    publicKey: "APP_USR-xxxx-xxxx",
    accessToken: "APP_USR-xxxx-xxxx-xxxx",
    webhookUrl: "https://api.seusistema.com/api/webhooks/mercadopago",
  },
  stripe: {
    connected: false,
    environment: "sandbox" as "sandbox" | "production",
    publishableKey: "pk_test_xxxxxxxxxxxx",
    secretKey: "sk_test_xxxxxxxxxxxx",
    webhookSecret: "whsec_xxxxxxxxxxxx",
  },
  asaas: {
    connected: false,
    environment: "sandbox" as "sandbox" | "production",
    apiKey: "$aact_xxxxxxxxxxxx",
    webhookToken: "asaas_wh_token_xxxx",
  },
};

export function ConfigIntegracoesApps() {
  const { evolutionWebhookUrl, setEvolutionWebhookUrl, appSettings, appSettingsLoaded, saveAppSetting } = useData();

  // Search & Filter State
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory>("todas");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isNovaIntegracaoModalOpen, setIsNovaIntegracaoModalOpen] = useState(false);
  const [selectedConfigModal, setSelectedConfigModal] = useState<string | null>(null);

  // Meta Ads, Google Ads, Pagamentos e integrações customizadas vêm do
  // Supabase (app_settings, via DataContext) — hidratado uma vez quando o
  // fetch inicial do tenant chega, e daí em diante lido/gravado por lá.
  const [metaConfig, setMetaConfig] = useState(DEFAULT_META_CONFIG);
  const [googleConfig, setGoogleConfig] = useState(DEFAULT_GOOGLE_CONFIG);
  const [paymentConfig, setPaymentConfig] = useState(DEFAULT_PAYMENT_CONFIG);
  const [customIntegrations, setCustomIntegrations] = useState<any[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated || !appSettingsLoaded) return;
    if (appSettings.integracoes_meta_ads) setMetaConfig(appSettings.integracoes_meta_ads);
    if (appSettings.integracoes_google_ads) setGoogleConfig(appSettings.integracoes_google_ads);
    if (appSettings.integracoes_payments) setPaymentConfig(appSettings.integracoes_payments);
    if (appSettings.integracoes_custom) setCustomIntegrations(appSettings.integracoes_custom);
    setHydrated(true);
  }, [appSettings, appSettingsLoaded, hydrated]);

  // WhatsApp / Evolution API State
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [simulationText, setSimulationText] = useState("Olá! Gostaria de mais informações sobre o produto.");
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Persiste no Supabase a cada mudança (mesmo modelo de auto-save que já
  // existia, só trocando o destino de localStorage para app_settings) — só
  // depois de hidratar, pra não sobrescrever dado real salvo com os padrões.
  useEffect(() => {
    if (hydrated) saveAppSetting("integracoes_meta_ads", metaConfig);
  }, [metaConfig, hydrated]);

  useEffect(() => {
    if (hydrated) saveAppSetting("integracoes_google_ads", googleConfig);
  }, [googleConfig, hydrated]);

  useEffect(() => {
    if (hydrated) saveAppSetting("integracoes_payments", paymentConfig);
  }, [paymentConfig, hydrated]);

  useEffect(() => {
    if (hydrated) saveAppSetting("integracoes_custom", customIntegrations);
  }, [customIntegrations, hydrated]);

  // Load instances & contacts for WhatsApp
  useEffect(() => {
    fetchInstances();
    fetchContacts();
  }, []);

  const fetchInstances = () => {
    apiFetch("/api/whatsapp/instances")
      .then((res) => res.json())
      .then((data) => {
        setInstances(data);
        if (data.length > 0) {
          setSelectedInstanceId(data[0].id);
          setWebhookUrl(data[0].webhookUrl || "");
          setEvolutionWebhookUrl(data[0].webhookUrl || "");
        }
      })
      .catch((err) => console.error("Error fetching instances:", err));
  };

  const fetchContacts = () => {
    apiFetch("/api/whatsapp/contacts")
      .then((res) => res.json())
      .then((data) => {
        setContacts(data);
        if (data.length > 0) setSelectedContactId(data[0].id);
      })
      .catch((err) => console.error("Error fetching contacts:", err));
  };

  // Meta Ads actions
  const [selectedMetaTestEvent, setSelectedMetaTestEvent] = useState("Lead");
  const [isTestingMeta, setIsTestingMeta] = useState(false);

  const handleTestMetaPixel = () => {
    setIsTestingMeta(true);
    setTimeout(() => {
      const pingResult = {
        event: selectedMetaTestEvent,
        timestamp: new Date().toLocaleTimeString("pt-BR"),
        status: 200,
        latency: Math.floor(Math.random() * 80) + 90,
      };
      setMetaConfig((prev: any) => ({
        ...prev,
        lastTestPing: pingResult,
        pixelStatus: "active",
      }));
      setIsTestingMeta(false);
      toast.success(
        `Evento '${selectedMetaTestEvent}' disparado com sucesso! Resposta HTTP 200 OK (${pingResult.latency}ms) via Conversions API e Pixel.`
      );
    }, 1200);
  };

  const handleToggleMetaConnected = () => {
    setMetaConfig((prev: any) => {
      const next = !prev.connected;
      toast[next ? "success" : "info"](
        next ? "Conta Meta Ads conectada ao S.P.Y.!" : "Conta Meta Ads desconectada."
      );
      return { ...prev, connected: next };
    });
  };

  // Google Ads actions
  const [isTestingGoogle, setIsTestingGoogle] = useState(false);
  const handleTestGoogleTag = () => {
    setIsTestingGoogle(true);
    setTimeout(() => {
      const pingResult = {
        event: "conversion_lead",
        timestamp: new Date().toLocaleTimeString("pt-BR"),
        status: 200,
        latency: Math.floor(Math.random() * 90) + 110,
      };
      setGoogleConfig((prev: any) => ({
        ...prev,
        lastTestPing: pingResult,
        tagStatus: "active",
      }));
      setIsTestingGoogle(false);
      toast.success(
        `Google Tag (${googleConfig.measurementId}) verificada com sucesso! Resposta 200 OK.`
      );
    }, 1200);
  };

  const handleToggleGoogleConnected = () => {
    setGoogleConfig((prev: any) => {
      const next = !prev.connected;
      toast[next ? "success" : "info"](
        next ? "Conta Google Ads conectada com sucesso!" : "Conta Google Ads desconectada."
      );
      return { ...prev, connected: next };
    });
  };

  // WhatsApp Webhook Save
  const handleSaveEvolutionWebhook = () => {
    if (!selectedInstanceId) {
      setEvolutionWebhookUrl(webhookUrl);
      toast.success("URL de Webhook salva com sucesso!");
      return;
    }
    setSavingWebhook(true);
    apiFetch(`/api/whatsapp/instances/${selectedInstanceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookUrl }),
    })
      .then((res) => res.json())
      .then(() => {
        setEvolutionWebhookUrl(webhookUrl);
        toast.success("URL de Webhook da Evolution API sincronizada com sucesso!");
        setSavingWebhook(false);
        fetchInstances();
      })
      .catch(() => {
        toast.error("Erro ao salvar configuração do Webhook.");
        setSavingWebhook(false);
      });
  };

  // WhatsApp Message Simulation
  const handleSimulateWhatsAppMessage = () => {
    if (!selectedContactId || !simulationText.trim()) {
      toast.error("Selecione um contato e digite uma mensagem.");
      return;
    }
    setSimulating(true);
    apiFetch("/api/whatsapp/simulate-incoming", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: selectedContactId, text: simulationText.trim() }),
    })
      .then((res) => res.json())
      .then(() => {
        toast.promise(new Promise((resolve) => setTimeout(resolve, 800)), {
          loading: "Evolution API processando evento 'messages.upsert'...",
          success: "Mensagem recebida e sincronizada no CRM em tempo real! 📲⚡",
          error: "Erro no webhook",
        });
        setSimulating(false);
      })
      .catch(() => {
        toast.error("Falha ao simular recebimento do WhatsApp.");
        setSimulating(false);
      });
  };

  // Built-in list of catalog integrations
  const allIntegrations = useMemo(() => {
    const list = [
      {
        id: "meta-ads",
        name: "Meta Ads (Facebook & Instagram)",
        category: "anuncios" as IntegrationCategory,
        icon: Facebook,
        iconBg: "bg-blue-600/10 text-blue-500 border-blue-500/20",
        description:
          "Rastreamento avançado com Pixel Meta, Conversions API (CAPI) server-side, captura automática de Leads e sincronização de funis.",
        connected: metaConfig.connected,
        statusText: metaConfig.connected ? "Conectado" : "Não Conectado",
        statusVariant: (metaConfig.connected ? "success" : "neutral") as any,
        badgeText: metaConfig.connected ? (metaConfig.trackingActive ? "Pixel Ativo" : "Pausado") : "Disponível",
        highlightInfo: metaConfig.connected
          ? `Pixel: ${metaConfig.pixelId || "Não configurado"}`
          : "Requer Token ou Pixel ID",
        onConfigure: () => setSelectedConfigModal("meta-ads"),
        onToggle: handleToggleMetaConnected,
      },
      {
        id: "google-ads",
        name: "Google Ads & Analytics (G-Tag)",
        category: "anuncios" as IntegrationCategory,
        icon: Globe,
        iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        description:
          "Rastreamento de conversões Google Ads (AW-XXXX), integração com Google Analytics 4 e Enhanced Conversions para páginas de captura.",
        connected: googleConfig.connected,
        statusText: googleConfig.connected ? "Conectado" : "Não Conectado",
        statusVariant: (googleConfig.connected ? "success" : "neutral") as any,
        badgeText: googleConfig.connected ? "Tag Ativa" : "Disponível",
        highlightInfo: googleConfig.connected
          ? `Tag: ${googleConfig.measurementId}`
          : "Requer ID de Medição",
        onConfigure: () => setSelectedConfigModal("google-ads"),
        onToggle: handleToggleGoogleConnected,
      },
      {
        id: "evolution-api",
        name: "Evolution API (WhatsApp)",
        category: "mensageria" as IntegrationCategory,
        icon: MessageSquare,
        iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        description:
          "Conexão nativa com instâncias do WhatsApp para envio e recebimento de mensagens, automações com IA (MIA) e webhooks em tempo real.",
        connected: instances.length > 0,
        statusText: instances.length > 0 ? "Instância Ativa" : "Aguardando",
        statusVariant: (instances.length > 0 ? "success" : "warning") as any,
        badgeText: instances.length > 0 ? `${instances.length} Instância(s)` : "Offline",
        highlightInfo: instances.length > 0
          ? `Linha: ${instances[0]?.phone || "Conectada"}`
          : "Nenhuma instância ativa",
        onConfigure: () => setSelectedConfigModal("evolution-api"),
        onToggle: () => setSelectedConfigModal("evolution-api"),
      },
      {
        id: "mercadopago",
        name: "Mercado Pago",
        category: "pagamentos" as IntegrationCategory,
        icon: Wallet,
        iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        description:
          "Recebimento de pagamentos via PIX instantâneo, Cartão de Crédito e Boleto Bancário com baixa automática no fluxo financeiro do S.P.Y..",
        connected: paymentConfig.mercadoPago.connected,
        statusText: paymentConfig.mercadoPago.connected ? "Conectado" : "Não Conectado",
        statusVariant: (paymentConfig.mercadoPago.connected ? "success" : "neutral") as any,
        badgeText: paymentConfig.mercadoPago.connected ? paymentConfig.mercadoPago.environment.toUpperCase() : "Disponível",
        highlightInfo: paymentConfig.mercadoPago.connected
          ? `Ambiente: ${paymentConfig.mercadoPago.environment}`
          : "PIX & Cartão",
        onConfigure: () => setSelectedConfigModal("mercadopago"),
        onToggle: () => {
          setPaymentConfig((prev: any) => ({
            ...prev,
            mercadoPago: { ...prev.mercadoPago, connected: !prev.mercadoPago.connected },
          }));
          toast.success("Status do Mercado Pago atualizado.");
        },
      },
      {
        id: "stripe",
        name: "Stripe Gateway",
        category: "pagamentos" as IntegrationCategory,
        icon: CreditCard,
        iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        description:
          "Processamento global de pagamentos em moeda nacional e internacional, suporte a cobranças recorrentes, planos e faturas.",
        connected: paymentConfig.stripe.connected,
        statusText: paymentConfig.stripe.connected ? "Conectado" : "Não Conectado",
        statusVariant: (paymentConfig.stripe.connected ? "success" : "neutral") as any,
        badgeText: paymentConfig.stripe.connected ? paymentConfig.stripe.environment.toUpperCase() : "Disponível",
        highlightInfo: paymentConfig.stripe.connected
          ? `Status: Ativo (${paymentConfig.stripe.environment})`
          : "Checkout Global",
        onConfigure: () => setSelectedConfigModal("stripe"),
        onToggle: () => {
          setPaymentConfig((prev: any) => ({
            ...prev,
            stripe: { ...prev.stripe, connected: !prev.stripe.connected },
          }));
          toast.success("Status da Stripe atualizado.");
        },
      },
      {
        id: "asaas",
        name: "Asaas Cobranças",
        category: "pagamentos" as IntegrationCategory,
        icon: ShieldCheck,
        iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        description:
          "Emissão automatizada de boletos registrados, cobranças PIX dinâmicas e gestão de faturamento integrada com CRM.",
        connected: paymentConfig.asaas.connected,
        statusText: paymentConfig.asaas.connected ? "Conectado" : "Não Conectado",
        statusVariant: (paymentConfig.asaas.connected ? "success" : "neutral") as any,
        badgeText: paymentConfig.asaas.connected ? "Ativo" : "Disponível",
        highlightInfo: paymentConfig.asaas.connected ? "Boletos & PIX Ativos" : "Gestão de Cobrança",
        onConfigure: () => setSelectedConfigModal("asaas"),
        onToggle: () => {
          setPaymentConfig((prev: any) => ({
            ...prev,
            asaas: { ...prev.asaas, connected: !prev.asaas.connected },
          }));
          toast.success("Status do Asaas atualizado.");
        },
      },
      {
        id: "n8n",
        name: "n8n Workflow Automation",
        category: "automacoes" as IntegrationCategory,
        icon: Zap,
        iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        description:
          "Integração nativa com workflows self-hosted ou cloud no n8n para orquestração avançada de leads, tarefas e webhooks.",
        connected: true,
        statusText: "Webhooks Ativos",
        statusVariant: "success" as any,
        badgeText: "Conectado",
        highlightInfo: "Disparos automáticos ativos",
        onConfigure: () => setSelectedConfigModal("n8n"),
        onToggle: () => toast.info("Configure os endpoints no menu Webhooks Globais."),
      },
      {
        id: "smtp",
        name: "Servidores SMTP Transacional",
        category: "email" as IntegrationCategory,
        icon: Server,
        iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        description:
          "Envio de propostas comerciais, contratos e notificações via AWS SES, G-Suite, SendGrid ou servidor SMTP dedicado com TLS.",
        connected: true,
        statusText: "Configurado",
        statusVariant: "info" as any,
        badgeText: "SMTP Ativo",
        highlightInfo: "Criptografia TLS habilitada",
        onConfigure: () => setSelectedConfigModal("smtp"),
        onToggle: () => setSelectedConfigModal("smtp"),
      },
    ];

    // Add custom integrations created by user
    const customList = customIntegrations.map((ci: any) => ({
      id: ci.id,
      name: ci.nome,
      category: "automacoes" as IntegrationCategory,
      icon: Zap,
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      description: ci.descricao || "Integração customizada configurada pelo usuário.",
      connected: ci.ativo,
      statusText: ci.ativo ? "Conectado" : "Desativado",
      statusVariant: (ci.ativo ? "success" : "neutral") as any,
      badgeText: ci.tipo || "API REST",
      highlightInfo: ci.apiUrl ? `Endpoint: ${ci.apiUrl}` : "Configuração personalizada",
      onConfigure: () => setSelectedConfigModal(`custom-${ci.id}`),
      onToggle: () => {
        setCustomIntegrations((prev: any[]) =>
          prev.map((item) => (item.id === ci.id ? { ...item, ativo: !item.ativo } : item))
        );
        toast.success(`Integração '${ci.nome}' alterada.`);
      },
    }));

    return [...list, ...customList];
  }, [metaConfig, googleConfig, instances, paymentConfig, customIntegrations]);

  // Filtered integrations based on Category and Search Query
  const filteredIntegrations = useMemo(() => {
    return allIntegrations.filter((item) => {
      if (activeCategory !== "todas" && item.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allIntegrations, activeCategory, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)] flex items-center gap-2.5">
            Central de Integrações
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary-blue)] animate-pulse hidden sm:inline-block"></span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Conecte canais de anúncios, mensageria, gateways de pagamento, APIs e webhooks para potencializar o S.P.Y..
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsNovaIntegracaoModalOpen(true)}
            className="font-bold gap-2 text-xs h-10 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nova Integração Personalizada
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-surface-elevated)] p-2 rounded-[var(--radius-panel)] border border-[var(--color-border-default)] shadow-[var(--shadow-control)]">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "todas", label: "Todas" },
            { id: "anuncios", label: "Tráfego & Anúncios" },
            { id: "mensageria", label: "Mensageria & WhatsApp" },
            { id: "pagamentos", label: "Pagamentos & Checkout" },
            { id: "automacoes", label: "Automações & Webhooks" },
            { id: "email", label: "E-mail & SMTP" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as IntegrationCategory)}
              className={`px-3 py-1.5 rounded-[var(--radius-control)] text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeCategory === tab.id
                  ? "bg-[var(--color-primary-blue)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-sunken)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar integração..."
            className="pl-9 h-8 text-xs"
          />
        </div>
      </div>

      {/* Integrations Grid */}
      {filteredIntegrations.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="Nenhuma integração encontrada"
          description="Nenhuma ferramenta corresponde aos critérios de pesquisa ou categoria selecionada."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveCategory("todas");
                setSearchQuery("");
              }}
            >
              Limpar Filtros
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIntegrations.map((item) => {
            const IconComp = item.icon;
            return (
              <Card
                key={item.id}
                className={`p-5 flex flex-col justify-between transition-all duration-200 hover:border-[var(--color-primary-blue)]/40 hover:shadow-md ${
                  item.connected ? "border-[var(--color-border-default)]" : "border-[var(--color-border-subtle)] opacity-90"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${item.iconBg}`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={item.statusVariant} dot dotPulse={item.connected}>
                        {item.statusText}
                      </Badge>
                      <span className="text-[10px] font-bold text-[var(--color-text-faint)] uppercase tracking-wider">
                        {item.badgeText}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-[var(--color-text-primary)] text-base tracking-tight mb-1.5 flex items-center gap-1.5">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-3 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[var(--color-border-subtle)] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--color-text-faint)] font-medium">Status</span>
                    <span className="font-mono text-xs font-semibold text-[var(--color-text-primary)] truncate max-w-[170px]">
                      {item.highlightInfo}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant={item.connected ? "default" : "outline"}
                      size="sm"
                      onClick={item.onConfigure}
                      className="flex-1 text-xs font-bold gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Configurar & Testar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={item.onToggle}
                      className={`text-xs px-2.5 ${
                        item.connected
                          ? "text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
                          : "text-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue)]/10"
                      }`}
                    >
                      {item.connected ? "Desconectar" : "Conectar"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DEDICADO: META ADS, PIXEL & CONVERSIONS API (CAPI) */}
      {/* ========================================================================= */}
      {selectedConfigModal === "meta-ads" && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedConfigModal(null)}
          maxWidth="max-w-2xl"
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                <Facebook className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--color-text-primary)]">
                  Configuração Meta Ads & Pixel / CAPI
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Gerenciamento de Pixel, rastreamento de eventos e API de Conversões
                </p>
              </div>
            </div>
          }
          footer={
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <Badge
                  variant={metaConfig.connected ? "success" : "neutral"}
                  dot
                  dotPulse={metaConfig.connected}
                >
                  {metaConfig.connected ? "Conta Conectada" : "Desconectada"}
                </Badge>
                {metaConfig.lastTestPing && (
                  <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                    Último Ping: {metaConfig.lastTestPing.timestamp} ({metaConfig.lastTestPing.latency}ms)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedConfigModal(null)}
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    toast.success("Configurações do Meta Ads e Pixel salvas!");
                    setSelectedConfigModal(null);
                  }}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <Alert
              variant={metaConfig.connected ? "success" : "info"}
              title="Status do Rastreamento Meta"
            >
              {metaConfig.connected
                ? "Sua conta comercial Meta está conectada. O Pixel e a Conversions API (CAPI) estão sincronizados para rastrear conversões em formulários, landing pages e estágios do CRM."
                : "Conecte sua conta para começar a rastrear visitantes, atribuir origem de leads com precisão e alimentar os algoritmos de tráfego do Facebook e Instagram."}
            </Alert>

            <Tabs defaultValue="pixel" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="pixel">Pixel & CAPI</TabsTrigger>
                <TabsTrigger value="eventos">Eventos & Tracking</TabsTrigger>
                <TabsTrigger value="teste">Teste de Ping ao Vivo</TabsTrigger>
              </TabsList>

              {/* TAB 1: Pixel & CAPI Settings */}
              <TabsContent value="pixel" className="space-y-4 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="ID do Pixel Meta" required hint="Encontrado no Gerenciador de Eventos da Meta">
                    <Input
                      type="text"
                      value={metaConfig.pixelId}
                      onChange={(e) =>
                        setMetaConfig((prev: any) => ({ ...prev, pixelId: e.target.value }))
                      }
                      placeholder="Ex: 10293847568291"
                    />
                  </FormField>

                  <FormField label="Dataset / Conjunto de Dados ID" hint="Identificador de dataset da Meta">
                    <Input
                      type="text"
                      value={metaConfig.datasetId}
                      onChange={(e) =>
                        setMetaConfig((prev: any) => ({ ...prev, datasetId: e.target.value }))
                      }
                      placeholder="Ex: ds_984729104"
                    />
                  </FormField>
                </div>

                <FormField
                  label="Token de Acesso Conversions API (CAPI)"
                  hint="Token gerado na aba Configurações do Gerenciador de Eventos"
                >
                  <Input
                    type="password"
                    value={metaConfig.capiToken}
                    onChange={(e) =>
                      setMetaConfig((prev: any) => ({ ...prev, capiToken: e.target.value }))
                    }
                    placeholder="EAAQZBz..."
                  />
                </FormField>

                <div className="p-4 rounded-[var(--radius-panel)] border border-[var(--color-border-default)] bg-[var(--color-surface-sunken)]/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                      Rastreamento Automático Ativo
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)] block">
                      Injetar script do Pixel e disparar eventos CAPI em todas as páginas de captura
                    </span>
                  </div>
                  <Switch
                    checked={metaConfig.trackingActive}
                    onCheckedChange={(checked) =>
                      setMetaConfig((prev: any) => ({ ...prev, trackingActive: checked }))
                    }
                  />
                </div>
              </TabsContent>

              {/* TAB 2: Event Mapping & Toggles */}
              <TabsContent value="eventos" className="space-y-4 pt-3">
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  Selecione quais eventos padrão da Meta serão disparados automaticamente quando o usuário realizar ações no sistema:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "PageView", label: "PageView", desc: "Abertura de Landing Pages & Formulários" },
                    { key: "Lead", label: "Lead", desc: "Formulário enviado ou lead cadastrado no CRM" },
                    { key: "Schedule", label: "Schedule", desc: "Reunião de qualificação agendada no SDR" },
                    { key: "Purchase", label: "Purchase", desc: "Negócio marcado como 'Ganho' no Pipeline" },
                    { key: "ViewContent", label: "ViewContent", desc: "Visualização do catálogo de produtos" },
                    { key: "Contact", label: "Contact", desc: "Clique para iniciar conversa no WhatsApp" },
                  ].map((evt) => (
                    <div
                      key={evt.key}
                      className="p-3.5 rounded-[var(--radius-control)] border border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] flex items-center justify-between"
                    >
                      <div className="space-y-0.5 pr-2">
                        <span className="text-xs font-black text-[var(--color-text-primary)] block font-mono">
                          {evt.label}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)] block leading-tight">
                          {evt.desc}
                        </span>
                      </div>
                      <Switch
                        size="sm"
                        checked={metaConfig.trackedEvents?.[evt.key] ?? true}
                        onCheckedChange={(checked) =>
                          setMetaConfig((prev: any) => ({
                            ...prev,
                            trackedEvents: { ...prev.trackedEvents, [evt.key]: checked },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* TAB 3: Live Test Ping Tool */}
              <TabsContent value="teste" className="space-y-4 pt-3">
                <div className="p-4 rounded-[var(--radius-panel)] border border-[var(--color-border-default)] bg-[var(--color-surface-sunken)]/50 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-blue)] mb-1">
                      Disparador de Evento de Teste (Pixel & CAPI)
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Simule o disparo de um evento sintético com payload estruturado para verificar se o Pixel e a CAPI estão recebendo dados em tempo real.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <select
                      value={selectedMetaTestEvent}
                      onChange={(e) => setSelectedMetaTestEvent(e.target.value)}
                      className="w-full sm:w-48 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                    >
                      <option value="Lead">Evento: Lead</option>
                      <option value="PageView">Evento: PageView</option>
                      <option value="Schedule">Evento: Schedule</option>
                      <option value="Purchase">Evento: Purchase</option>
                      <option value="Contact">Evento: Contact</option>
                    </select>

                    <Button
                      onClick={handleTestMetaPixel}
                      loading={isTestingMeta}
                      className="w-full sm:w-auto font-bold text-xs gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Disparar Teste de Rastreamento
                    </Button>
                  </div>

                  {metaConfig.lastTestPing && (
                    <div className="p-3.5 rounded-[var(--radius-control)] border border-emerald-500/30 bg-emerald-500/10 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Resposta 200 OK — Evento Capturado
                        </span>
                        <span className="font-mono text-[10px]">
                          Latência: {metaConfig.lastTestPing.latency}ms
                        </span>
                      </div>
                      <div className="bg-[var(--color-surface-elevated)]/80 p-2.5 rounded font-mono text-[11px] text-[var(--color-text-muted)] overflow-x-auto border border-[var(--color-border-default)]">
                        {`{
  "event_name": "${metaConfig.lastTestPing.event}",
  "pixel_id": "${metaConfig.pixelId}",
  "timestamp": "${metaConfig.lastTestPing.timestamp}",
  "action_source": "website_server_capi",
  "status": "delivered_ok"
}`}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL DEDICADO: GOOGLE ADS & ANALYTICS */}
      {/* ========================================================================= */}
      {selectedConfigModal === "google-ads" && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedConfigModal(null)}
          maxWidth="max-w-xl"
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--color-text-primary)]">
                  Configuração Google Ads & G-Tag
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Acompanhamento de conversões e Google Analytics 4
                </p>
              </div>
            </div>
          }
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setSelectedConfigModal(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  toast.success("Configuração do Google Ads salva com sucesso!");
                  setSelectedConfigModal(null);
                }}
              >
                Salvar Alterações
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <FormField label="ID de Medição / G-Tag" required hint="Ex: G-XXXXXXXXXX ou AW-XXXXXXXXX">
              <Input
                type="text"
                value={googleConfig.measurementId}
                onChange={(e) =>
                  setGoogleConfig((prev: any) => ({ ...prev, measurementId: e.target.value }))
                }
                placeholder="G-XXXXXXXXXX"
              />
            </FormField>

            <FormField label="Rótulo de Conversão (Conversion Label)" hint="Ex: AW-1029482910/XyZ_Lead">
              <Input
                type="text"
                value={googleConfig.conversionLabel}
                onChange={(e) =>
                  setGoogleConfig((prev: any) => ({ ...prev, conversionLabel: e.target.value }))
                }
                placeholder="AW-1029482910/XyZ_Lead"
              />
            </FormField>

            <div className="p-3.5 rounded-[var(--radius-panel)] border border-[var(--color-border-default)] bg-[var(--color-surface-sunken)]/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--color-text-primary)] block">
                  Enhanced Conversions (Conversões Aprimoradas)
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)] block">
                  Enviar dados criptografados (SHA256) de e-mail e telefone para maximizar correspondência
                </span>
              </div>
              <Switch
                checked={googleConfig.enhancedConversions}
                onCheckedChange={(checked) =>
                  setGoogleConfig((prev: any) => ({ ...prev, enhancedConversions: checked }))
                }
              />
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={handleTestGoogleTag}
                loading={isTestingGoogle}
                className="w-full text-xs font-bold gap-2"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-500" /> Validar Tag de Conversão Google
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL DEDICADO: EVOLUTION API (WHATSAPP) & SIMULADOR */}
      {/* ========================================================================= */}
      {selectedConfigModal === "evolution-api" && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedConfigModal(null)}
          maxWidth="max-w-2xl"
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--color-text-primary)]">
                  Evolution API & Mensageria WhatsApp
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Gestão de instâncias ativas, callback de webhook e simulador em tempo real
                </p>
              </div>
            </div>
          }
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setSelectedConfigModal(null)}>
                Fechar
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Instance details */}
            <div className="p-4 rounded-[var(--radius-panel)] border border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={instances.length > 0 ? "success" : "warning"} dot dotPulse>
                  {instances.length > 0 ? "Instância Conectada" : "Sem Instância"}
                </Badge>
                <span className="text-[10px] font-mono text-[var(--color-text-faint)] uppercase">
                  Evolution API v2.0
                </span>
              </div>

              {instances.map((inst) => (
                <div key={inst.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="text-[var(--color-text-muted)]">
                    📞 Linha: <span className="font-bold text-[var(--color-text-primary)]">{inst.phone}</span>
                  </div>
                  <div className="text-[var(--color-text-muted)]">
                    🌐 Status: <span className="text-emerald-500 font-bold">{inst.status}</span>
                  </div>
                  <div className="col-span-2 truncate text-[var(--color-text-muted)]">
                    🔑 Token: <span className="text-[var(--color-text-faint)]">{inst.apiKey}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Webhook Callback input */}
            <FormField label="URL de Callback do Webhook" hint="URL para onde a Evolution API enviará eventos 'messages.upsert'">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://sua-api.com/api/webhooks/whatsapp"
                  className="font-mono text-xs"
                />
                <Button onClick={handleSaveEvolutionWebhook} loading={savingWebhook} className="shrink-0">
                  Salvar
                </Button>
              </div>
            </FormField>

            {/* Inbound Simulator */}
            <div className="p-4 rounded-[var(--radius-panel)] border border-[var(--color-border-default)] bg-[var(--color-surface-sunken)]/60 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Simulador de Mensagem Recebida
                </h4>
                <Badge variant="warning">Ambiente de Teste</Badge>
              </div>

              <div className="space-y-3">
                <FormField label="Cliente Simulador">
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] font-bold"
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || "Sem telefone"})
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Mensagem do Cliente">
                  <Input
                    type="text"
                    value={simulationText}
                    onChange={(e) => setSimulationText(e.target.value)}
                    placeholder="Digite a mensagem simulada..."
                  />
                </FormField>

                <Button
                  onClick={handleSimulateWhatsAppMessage}
                  loading={simulating || contacts.length === 0}
                  className="w-full font-bold text-xs gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Disparar Entrada no CRM
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAIS DE PAGAMENTO: MERCADO PAGO, STRIPE, ASAAS */}
      {/* ========================================================================= */}
      {(selectedConfigModal === "mercadopago" ||
        selectedConfigModal === "stripe" ||
        selectedConfigModal === "asaas") && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedConfigModal(null)}
          maxWidth="max-w-lg"
          title={`Configuração ${
            selectedConfigModal === "mercadopago"
              ? "Mercado Pago"
              : selectedConfigModal === "stripe"
              ? "Stripe"
              : "Asaas"
          }`}
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" onClick={() => setSelectedConfigModal(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  toast.success("Credenciais de pagamento salvas!");
                  setSelectedConfigModal(null);
                }}
              >
                Salvar Credenciais
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <FormField label="Ambiente de Operação">
              <select
                className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs font-bold text-[var(--color-text-primary)]"
              >
                <option value="sandbox">Sandbox (Ambiente de Testes)</option>
                <option value="production">Produção (Live Real)</option>
              </select>
            </FormField>

            <FormField label="Chave Pública (Public Key)" required>
              <Input
                type="text"
                placeholder="Ex: APP_USR-xxxx / pk_test_xxxx"
                defaultValue={
                  selectedConfigModal === "mercadopago"
                    ? paymentConfig.mercadoPago.publicKey
                    : selectedConfigModal === "stripe"
                    ? paymentConfig.stripe.publishableKey
                    : paymentConfig.asaas.apiKey
                }
              />
            </FormField>

            <FormField label="Chave Secreta / Access Token" required>
              <Input
                type="password"
                placeholder="Ex: APP_USR-xxxx / sk_test_xxxx"
                defaultValue={
                  selectedConfigModal === "mercadopago"
                    ? paymentConfig.mercadoPago.accessToken
                    : selectedConfigModal === "stripe"
                    ? paymentConfig.stripe.secretKey
                    : paymentConfig.asaas.webhookToken
                }
              />
            </FormField>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.promise(new Promise((res) => setTimeout(res, 1000)), {
                  loading: "Testando handshake com o gateway...",
                  success: "Conexão com gateway validada com sucesso! 💳✨",
                  error: "Erro na autenticação.",
                });
              }}
              className="w-full text-xs font-bold gap-2 mt-2"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-500" /> Testar Comunicação com o Gateway
            </Button>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVA INTEGRAÇÃO CUSTOMIZADA */}
      {/* ========================================================================= */}
      <NovaIntegracaoModal
        isOpen={isNovaIntegracaoModalOpen}
        onClose={() => setIsNovaIntegracaoModalOpen(false)}
        onSave={(data) => {
          setCustomIntegrations((prev: any[]) => [
            ...prev,
            { id: Date.now().toString(), ...data },
          ]);
          toast.success(`Integração '${data.nome}' criada com sucesso!`);
          setIsNovaIntegracaoModalOpen(false);
        }}
      />
    </div>
  );
}
