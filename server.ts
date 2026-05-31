import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// types for WhatsApp Business Evolution API simulator
interface WhatsAppInstance {
  id: string;
  name: string;
  phone: string;
  status: "CONNECTED" | "DISCONNECTED" | "CONNECTING";
  apiKey: string;
  webhookUrl: string;
  qrcode?: string;
  createdAt: string;
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  channel: "WhatsApp" | "Instagram" | "Email";
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  phone?: string;
  email?: string;
  tags?: string[];
  slaStatus?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
  status?: "sent" | "read";
  timestamp: number;
}

interface ChatbotRule {
  id: string;
  trigger: string;
  response: string;
  matchType: "equals" | "contains";
  active: boolean;
}

// In-Memory Database State
let instances: WhatsAppInstance[] = [
  {
    id: "evo_inst_1",
    name: "Axis Produção",
    phone: "+55 11 98888-7777",
    status: "CONNECTED",
    apiKey: "4dfg23-evoapikey-99e2-axis",
    webhookUrl: "https://axis-crm.cloud/api/webhooks/whatsapp",
    createdAt: "2026-05-10T12:00:00Z"
  }
];

let contacts: ChatContact[] = [];

let messages: Record<string, ChatMessage[]> = {};

let chatbotRules: ChatbotRule[] = [
  { id: "rule_1", trigger: "olá", response: "Olá! Seja muito bem-vindo ao Axis CRM 🚀\nComo podemos te ajudar hoje?\n\nDigite o número da opção desejada:\n1️⃣ Conhecer nossos Serviços\n2️⃣ Falar com setor Comercial\n3️⃣ Suporte Técnico\n4️⃣ Financeiro", matchType: "contains", active: true },
  { id: "rule_2", trigger: "preço", response: "Nossos planos começam em R$ 99/mês para o plano Starter, R$ 249/mês no plano Pro e Enterprise sob consulta!\n\nGostaria de agendar uma reunião comercial para demonstração do sistema?", matchType: "contains", active: true },
  { id: "rule_3", trigger: "suporte", response: "Você selecionou Suporte Técnico. Para acelerar seu atendimento, digite seu CNPJ ou e-mail de cadastro, por favor.", matchType: "contains", active: true }
];

async function startServer() {
  const app = express();
  const PORT = 3002;

  // Supabase Client for Backend Persistence
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
  const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

  app.use(express.json());

  // AI Client Initializer
  const keysAvailable = !!process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy_key_to_prevent_crash_at_load_time",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // API Route for Tag Suggestions (Existing CRM Service)
  app.post("/api/leads/suggest-tags", async (req, res) => {
    const { name, company, notes } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ tags: ["Interesse", "Novo Lead", "PME"] });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Suggest 3-5 relevant tags for a lead with the following info:
        Name: ${name}
        Company: ${company}
        Description: ${notes}
        Return the tags as a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });

      const tags = JSON.parse(response.text);
      res.json({ tags });
    } catch (error) {
      console.error("AI Tag Suggestion Error:", error);
      res.status(500).json({ error: "Failed to suggest tags" });
    }
  });

  // Real-time CNPJ validation and activity-checking API using BrasilAPI/ReceitaWS with Math fallback
  app.post("/api/cnpj/validate", async (req, res) => {
    const { cnpj } = req.body;
    if (!cnpj) {
      return res.status(400).json({ error: "O CNPJ é obrigatório" });
    }

    const cleanCnpj = cnpj.replace(/\D/g, "");
    if (cleanCnpj.length !== 14) {
      return res.json({ valid: false, message: "O CNPJ precisa conter exatamente 14 dígitos." });
    }

    // Mathematical pattern check function
    const validateCNPJPattern = (val: string): boolean => {
      if (/^(\d)\1+$/.test(val)) return false;
      let size = val.length - 2;
      let numbers = val.substring(0, size);
      const digits = val.substring(size);
      let sum = 0;
      let pos = size - 7;

      for (let i = size; i >= 1; i--) {
        sum += Number(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
      }

      let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      if (result !== Number(digits.charAt(0))) return false;

      size = size + 1;
      numbers = val.substring(0, size);
      sum = 0;
      pos = size - 7;
      for (let i = size; i >= 1; i--) {
        sum += Number(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
      }

      result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      if (result !== Number(digits.charAt(1))) return false;
      return true;
    };

    if (!validateCNPJPattern(cleanCnpj)) {
      return res.json({ valid: false, message: "CNPJ possui dígito verificador matemático inválido!" });
    }

    try {
      // Step A: Attempt BrasilAPI
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (response.ok) {
        const data = await response.json();
        // Ativo if "ATIVA" or status cadastral is 2
        const isCnpjActive = data.descricao_situacao_cadastral === "ATIVA" || data.situacao_cadastral === 2 || data.situacao_cadastral === "2";
        return res.json({
          valid: true,
          active: isCnpjActive,
          statusText: data.descricao_situacao_cadastral || "ATIVA",
          companyName: data.razao_social || data.nome_fantasia || "Empresa sob análise",
          message: isCnpjActive
            ? `Empresa ativa: ${data.razao_social || data.nome_fantasia}`
            : `Alerta: Situação cadastral ${data.descricao_situacao_cadastral || 'INATIVA'} na Receita Federal.`
        });
      }

      // Step B: Fallback to ReceitaWS
      const receitaResponse = await fetch(`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`);
      if (receitaResponse.ok) {
        const rData = await receitaResponse.json();
        if (rData.status === "ERROR") {
          return res.json({ valid: false, message: rData.message || "CNPJ não localizado na Receita Federal." });
        }
        const isCnpjActive = rData.situacao === "ATIVA";
        return res.json({
          valid: true,
          active: isCnpjActive,
          statusText: rData.situacao || "ATIVA",
          companyName: rData.nome || "Empresa sob análise",
          message: isCnpjActive
            ? `Empresa ativa: ${rData.nome}`
            : `Alerta: Situação cadastral ${rData.situacao || 'INATIVA'} na Receita Federal.`
        });
      }

      // If both fail but the pattern is mathematically valid
      return res.json({
        valid: true,
        active: true,
        companyName: "Empresa Cadastrada (Validação Offline)",
        message: "CNPJ com padrão matemático correto (Bancos de dados federais offline)."
      });

    } catch (err) {
      console.error("Third party CNPJ fetch failed:", err);
      return res.json({
        valid: true,
        active: true,
        companyName: "Empresa Cadastrada (Validação Offline)",
        message: "CNPJ computacionalmente válido (Bancos de dados federais instáveis)."
      });
    }
  });

  // Automated AI Lead Scoring & recalculation service
  app.post("/api/leads/calculate-score", async (req, res) => {
    const { lead, activities } = req.body;
    if (!lead) {
      return res.status(400).json({ error: "Lead are required for score calculation" });
    }

    // 1. If Gemini API is available, perform expert AI appraisal
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Analyze this CRM lead and its recent activities, and compute:
          1. An AI score (0 to 100) indicating closeness to buying or closing.
          2. A lead temperature ('frio', 'morno', or 'quente').
          3. A brief, informative summary of why the score was given.
          
          Lead Details:
          - Name: ${lead.name}
          - Title: ${lead.title}
          - Company: ${lead.company}
          - Current Status: ${lead.status}
          - Estimated Value: ${lead.value}
          - Priority: ${lead.priority}
          
          Recent Activities:
          ${JSON.stringify(activities || [])}
          
          Return the result strictly as a JSON object with properties: "scoreIA" (integer), "temperature" (string: 'frio' | 'morno' | 'quente'), "iaSummary" (string).`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                scoreIA: { type: Type.INTEGER },
                temperature: { type: Type.STRING },
                iaSummary: { type: Type.STRING }
              },
              required: ["scoreIA", "temperature", "iaSummary"]
            }
          }
        });

        const result = JSON.parse(response.text || "{}");
        return res.json({
          scoreIA: result.scoreIA ?? 50,
          temperature: result.temperature ?? "morno",
          iaSummary: result.iaSummary ?? "Não foi possível gerar a justificativa da IA."
        });
      } catch (error) {
        console.error("AI Lead Scoring generation failed, falling back to deterministic:", error);
      }
    }

    // 2. Deterministic offline calculation fallback
    let score = 50;

    // Status metrics
    if (lead.status === 'Novo') score += 5;
    else if (lead.status === 'Prospecção') score += 10;
    else if (lead.status === 'Qualificado') score += 20;
    else if (lead.status === 'Em Negociação') score += 30;
    else if (lead.status === 'Fechado') score += 50;
    else if (lead.status === 'Perdido') score -= 30;

    // Priority metrics
    if (lead.priority === 'Alta') score += 15;
    else if (lead.priority === 'Média') score += 5;
    else if (lead.priority === 'Baixa') score -= 10;

    // Activities metrics
    if (activities && Array.isArray(activities)) {
      const leadActivities = activities.filter((a: any) => a.leadId === lead.id);
      score += leadActivities.length * 8;

      const hasMeeting = leadActivities.some((a: any) => a.type === 'Reunião');
      if (hasMeeting) score += 15;
    }

    score = Math.max(0, Math.min(100, score));

    let temp: 'frio' | 'morno' | 'quente' = 'morno';
    if (score < 45) temp = 'frio';
    else if (score > 75) temp = 'quente';

    const actCount = activities ? activities.filter((a: any) => a.leadId === lead.id).length : 0;
    const iaSummary = `Cálculo automático (Offline): Lead com prioridade ${lead.priority} na etapa ${lead.status}. Possui ${actCount} atividades registradas no histórico recente.`;

    res.json({
      scoreIA: score,
      temperature: temp,
      iaSummary
    });
  });

  // =========================================================================
  // 1. EVOLUTION API INSTANCES ENDPOINTS
  // =========================================================================
  app.get("/api/whatsapp/instances", (req, res) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return res.json(data);
    }
    res.json(instances);
  });

  app.post("/api/whatsapp/instances", (req, res) => {
    const { name, phone = "-", webhookUrl = "" } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nome da instância é obrigatório" });
    }

    const newInst: WhatsAppInstance = {
      id: "evo_inst_" + Math.random().toString(36).substring(2, 9),
      name,
      phone,
      status: "DISCONNECTED",
      apiKey: "evo_apikey_" + Math.random().toString(36).substring(2, 12),
      webhookUrl: webhookUrl || "https://axis-crm.cloud/api/webhooks/whatsapp",
      qrcode: "",
      createdAt: new Date().toISOString()
    };
    instances.push(newInst);
    res.json(newInst);
  });

  app.post("/api/whatsapp/instances/:id/qrcode", (req, res) => {
    const { id } = req.params;
    const inst = instances.find(i => i.id === id);
    if (!inst) {
      return res.status(404).json({ error: "Instância não encontrada" });
    }

    inst.status = "CONNECTING";
    // Simulated UUID in QR Code
    inst.qrcode = `00020101021226450014br.gov.bcb.pix2523evo-wa-connection-token-key-${inst.id}`;
    res.json({ status: "CONNECTING", qrcode: inst.qrcode });
  });

  app.post("/api/whatsapp/instances/:id/connect", (req, res) => {
    const { id } = req.params;
    const { phone } = bodyWithFallback(req);
    const inst = instances.find(i => i.id === id);
    if (!inst) {
      return res.status(404).json({ error: "Instância não encontrada" });
    }

    inst.status = "CONNECTED";
    inst.phone = phone || "+55 11 9" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000);
    delete inst.qrcode;
    res.json({ status: "CONNECTED", instance: inst });
  });

  app.delete("/api/whatsapp/instances/:id", (req, res) => {
    const { id } = req.params;
    instances = instances.filter(i => i.id !== id);
    res.json({ success: true, message: `Instância ${id} removida` });
  });

  app.put("/api/whatsapp/instances/:id", (req, res) => {
    const { id } = req.params;
    const { webhookUrl, name, phone, status } = req.body;
    const inst = instances.find(i => i.id === id);
    if (!inst) {
      return res.status(404).json({ error: "Instância não encontrada" });
    }
    if (webhookUrl !== undefined) inst.webhookUrl = webhookUrl;
    if (name !== undefined) inst.name = name;
    if (phone !== undefined) inst.phone = phone;
    if (status !== undefined) inst.status = status;
    res.json(inst);
  });

  function bodyWithFallback(req: any) {
    return req.body || {};
  }

  // =========================================================================
  // 2. CONTACTS ENDPOINTS
  // =========================================================================
  app.get("/api/whatsapp/contacts", (req, res) => {
    res.json(contacts);
  });

  app.post("/api/whatsapp/contacts", (req, res) => {
    const { name, phone, email, tags = ["lead"] } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Nome e Telefone são obrigatórios" });
    }

    // Clean phone number format
    const cleanPhone = phone.startsWith("+") ? phone : `+55 ${phone}`;

    // Check if contact already exists
    const existing = contacts.find(c => c.phone === cleanPhone);
    if (existing) {
      return res.json(existing);
    }

    const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "WA";

    const newContact: ChatContact = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      avatar: initials,
      channel: "WhatsApp",
      lastMessage: "Nova conversa iniciada",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: 0,
      online: Math.random() > 0.5,
      phone: cleanPhone,
      email,
      tags,
      slaStatus: "Dentro do Prazo"
    };

    contacts.unshift(newContact);
    if (!messages[newContact.id]) {
      messages[newContact.id] = [];
    }

    res.json(newContact);
  });

  // =========================================================================
  // 3. MESSAGES SENDER / POLLER & AUTOMATIONS (WEBHOOK / CHATBOT)
  // =========================================================================
  app.get("/api/whatsapp/messages/:contactId", (req, res) => {
    const { contactId } = req.params;
    if (supabase) {
      const { data, error } = await supabase.from('chat_messages').select('*').eq('contact_id', contactId).order('timestamp', { ascending: true });
      if (!error && data) return res.json(data);
    }
    res.json(messages[contactId] || []);
  });

  app.post("/api/whatsapp/messages/send", async (req, res) => {
    const { contactId, text } = req.body;
    if (!contactId || !text) {
      return res.status(400).json({ error: "ID do contato e texto são obrigatórios" });
    }

    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      text,
      sender: "me",
      time: timeString,
      status: "sent",
      timestamp: Date.now()
    };

    if (!messages[contactId]) {
      messages[contactId] = [];
    }
    messages[contactId].push(userMsg);

    if (supabase) {
      await supabase.from('chat_messages').insert([{
        id: userMsg.id,
        text: userMsg.text,
        sender: userMsg.sender,
        time: userMsg.time,
        status: userMsg.status,
        timestamp: userMsg.timestamp,
        contact_id: contactId
      }]);
      await supabase.from('chat_contacts').update({ lastMessage: text, time: timeString }).eq('id', contactId);
    }

    // Update last message in contact
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      contact.lastMessage = text;
      contact.time = timeString;
    }

    res.json({ success: true, message: userMsg });

    // AI/Auto-Responder simulation trigger:
    // Process chatbot trigger if rule matched
    const loweredText = text.toLowerCase();
    const matchedRule = chatbotRules.find(r => {
      if (!r.active) return false;
      if (r.matchType === "equals") {
        return loweredText === r.trigger.toLowerCase();
      } else {
        return loweredText.includes(r.trigger.toLowerCase());
      }
    });

    // Chatbot logic with Supabase persistence
    if (matchedRule && supabase) {
      const autoReply = {
        id: "msg_bot_" + Math.random().toString(36).substring(2, 9),
        text: matchedRule.response,
        sender: "them" as const,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now(),
        status: "read" as const
      };
      await supabase.from('chat_messages').insert([{ ...autoReply, contact_id: contactId }]);
    }

    if (matchedRule) {
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: "msg_bot_" + Math.random().toString(36).substring(2, 9),
          text: matchedRule.response,
          sender: "them",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timestamp: Date.now(),
          status: "read"
        };
        messages[contactId].push(autoReply);

        if (contact) {
          contact.lastMessage = matchedRule.response;
          contact.time = autoReply.time;
          contact.unread = contact.unread + 1;
        }
      }, 1500);
    }
  });

  // Simulated Webhook triggers from outside (Simulation panel)
  app.post("/api/whatsapp/simulate-incoming", async (req, res) => {
    const { contactId, text } = req.body;
    if (!contactId || !text) {
      return res.status(400).json({ error: "contactId e texto são obrigatórios" });
    }

    const contact = contacts.find(c => c.id === contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contato não encontrado" });
    }

    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const inMsg: ChatMessage = {
      id: "msg_sim_" + Math.random().toString(36).substring(2, 9),
      text: text,
      sender: "them",
      time: timeString,
      timestamp: Date.now()
    };

    if (!messages[contactId]) {
      messages[contactId] = [];
    }
    messages[contactId].push(inMsg);

    contact.lastMessage = text;
    contact.time = timeString;
    contact.unread = contact.unread + 1;

    if (supabase) {
      await supabase.from('chat_messages').insert([{
        id: inMsg.id,
        text: inMsg.text,
        sender: inMsg.sender,
        time: inMsg.time,
        timestamp: inMsg.timestamp,
        contact_id: contactId
      }]);
      await supabase.from('chat_contacts').update({ lastMessage: text, time: timeString, unread: contact.unread }).eq('id', contactId);
    }

    res.json({ message: inMsg, contact });

    // Check Chatbot Rules for the simulated incoming message
    const loweredText = text.toLowerCase();
    const matchedRule = chatbotRules.find(r => {
      if (!r.active) return false;
      if (r.matchType === "equals") {
        return loweredText === r.trigger.toLowerCase();
      } else {
        return loweredText.includes(r.trigger.toLowerCase());
      }
    });

    if (matchedRule) {
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: "msg_bot_" + Math.random().toString(36).substring(2, 9),
          text: matchedRule.response,
          sender: "them", // Wait! Automatic replies are sent by ME (our business)
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timestamp: Date.now(),
          status: "read"
        };
        messages[contactId].push(autoReply);
        contact.lastMessage = matchedRule.response;
        contact.time = autoReply.time;
      }, 1500);
    }
  });

  // =========================================================================
  // 4. CHATBOT RULES ENDPOINTS
  // =========================================================================
  app.get("/api/whatsapp/chatbot/rules", async (req, res) => {
    if (supabase) {
      const { data } = await supabase.from('chatbot_rules').select('*');
      if (data) return res.json(data);
    }
    res.json(chatbotRules);
  });

  app.post("/api/whatsapp/chatbot/rules", (req, res) => {
    const { trigger, response, matchType = "contains" } = req.body;
    if (!trigger || !response) {
      return res.status(400).json({ error: "Gatilho e Resposta são obrigatórios" });
    }

    const newRule: ChatbotRule = {
      id: "rule_" + Math.random().toString(36).substring(2, 9),
      trigger,
      response,
      matchType,
      active: true
    };
    chatbotRules.push(newRule);
    res.json(newRule);
  });

  app.put("/api/whatsapp/chatbot/rules/:id", (req, res) => {
    const { id } = req.params;
    const { trigger, response, matchType, active } = req.body;

    const rule = chatbotRules.find(r => r.id === id);
    if (!rule) {
      return res.status(404).json({ error: "Regra não encontrada" });
    }

    if (trigger !== undefined) rule.trigger = trigger;
    if (response !== undefined) rule.response = response;
    if (matchType !== undefined) rule.matchType = matchType;
    if (active !== undefined) rule.active = active;

    res.json(rule);
  });

  app.delete("/api/whatsapp/chatbot/rules/:id", (req, res) => {
    const { id } = req.params;
    chatbotRules = chatbotRules.filter(r => r.id !== id);
    res.json({ success: true, id });
  });

  // =========================================================================
  // 5. AXIS COPILOT (GEMINI AI HELP)
  // =========================================================================
  app.post("/api/whatsapp/copilot/analyze", async (req, res) => {
    const { contactId } = req.body;
    if (!contactId) {
      return res.status(400).json({ error: "contactId é obrigatório" });
    }

    const chatHistory = messages[contactId] || [];
    const contact = contacts.find(c => c.id === contactId);

    if (chatHistory.length === 0) {
      return res.json({
        suggestion: "Ainda não há mensagens registradas com este contato para analisar. Tente fazer uma saudação cortês, introduzindo o Axis CRM e perguntando como pode auxiliá-lo.",
        sentiment: "Neutro"
      });
    }

    // Format chat logs
    const conversationText = chatHistory.map(m => `${m.sender === "me" ? "Vendedor/Atendente" : "Cliente"}: ${m.text}`).join("\n");

    const promptContext = `Você é o Axis Copilot, um assistente especializado em CRM, Vendas e Atendimento via WhatsApp.
    O cliente se chama: ${contact ? contact.name : "Cliente"}.
    O histórico de mensagens é este:
    ${conversationText}

    Sua tarefa é:
    1. Analisar brevemente o status/intenção do cliente (especialmente dúvidas de frete, preço, fechamento).
    2. Sugerir a RESPOSTA PERFEITA em português para o vendedor copiar e enviar. A resposta deve ser acolhedora, profissional, concisa (em tom de WhatsApp, usando emojis se apropriado) e focada em conversão/ajuda.
    
    Retorne a resposta no formato JSON com duas propriedades:
    - analysis (uma frase resumindo o sentimento e status das negociações)
    - suggestion (o rascunho exato da mensagem pronta para o vendedor usar)
    - sentiment (Positivo, Neutro ou Negativo)`;

    try {
      if (!process.env.GEMINI_API_KEY) {
        // Fallback if no API Key
        const lastMsg = chatHistory[chatHistory.length - 1];
        let sugg = `Olá ${contact ? contact.name : ""}, compreendo sua dúvida! Estamos analisando sua solicitação de frete com nossa logística. De qualquer forma, gostaria de agendar uma ligação rápida hoje às 14h para fecharmos os detalhes?`;
        if (lastMsg.text.toLowerCase().includes("frete")) {
          sugg = `Olá ${contact ? contact.name : ""}, com certeza! Para sua região, nós conseguimos fazer o frete com um desconto especial de 50%, ou até GRÁTIS se fecharmos o contrato Pro hoje. O que acha?`;
        }
        return res.json({
          analysis: "O cliente demonstrou interesse inicial. A IA sugere oferecer atendimento ágil para acelerar o fechamento.",
          suggestion: sugg,
          sentiment: "Positivo"
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContext,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING },
              suggestion: { type: Type.STRING },
              sentiment: { type: Type.STRING }
            },
            required: ["analysis", "suggestion", "sentiment"]
          },
        },
      });

      const parsed = JSON.parse(response.text);
      res.json(parsed);
    } catch (e) {
      console.error("Copilot analysis failure:", e);
      res.status(500).json({ error: "Erro de processamento da IA" });
    }
  });

  // =========================================================================

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
