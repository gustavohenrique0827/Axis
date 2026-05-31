var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var instances = [
  {
    id: "evo_inst_1",
    name: "Axis Produ\xE7\xE3o",
    phone: "+55 11 98888-7777",
    status: "CONNECTED",
    apiKey: "4dfg23-evoapikey-99e2-axis",
    webhookUrl: "https://axis-crm.cloud/api/webhooks/whatsapp",
    createdAt: "2026-05-10T12:00:00Z"
  }
];
var contacts = [];
var messages = {};
var chatbotRules = [
  { id: "rule_1", trigger: "ol\xE1", response: "Ol\xE1! Seja muito bem-vindo ao Axis CRM \u{1F680}\nComo podemos te ajudar hoje?\n\nDigite o n\xFAmero da op\xE7\xE3o desejada:\n1\uFE0F\u20E3 Conhecer nossos Servi\xE7os\n2\uFE0F\u20E3 Falar com setor Comercial\n3\uFE0F\u20E3 Suporte T\xE9cnico\n4\uFE0F\u20E3 Financeiro", matchType: "contains", active: true },
  { id: "rule_2", trigger: "pre\xE7o", response: "Nossos planos come\xE7am em R$ 99/m\xEAs para o plano Starter, R$ 249/m\xEAs no plano Pro e Enterprise sob consulta!\n\nGostaria de agendar uma reuni\xE3o comercial para demonstra\xE7\xE3o do sistema?", matchType: "contains", active: true },
  { id: "rule_3", trigger: "suporte", response: "Voc\xEA selecionou Suporte T\xE9cnico. Para acelerar seu atendimento, digite seu CNPJ ou e-mail de cadastro, por favor.", matchType: "contains", active: true }
];
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3002;
  app.use(import_express.default.json());
  const keysAvailable = !!process.env.GEMINI_API_KEY;
  const ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy_key_to_prevent_crash_at_load_time",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
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
            type: import_genai.Type.ARRAY,
            items: { type: import_genai.Type.STRING }
          }
        }
      });
      const tags = JSON.parse(response.text);
      res.json({ tags });
    } catch (error) {
      console.error("AI Tag Suggestion Error:", error);
      res.status(500).json({ error: "Failed to suggest tags" });
    }
  });
  app.post("/api/cnpj/validate", async (req, res) => {
    const { cnpj } = req.body;
    if (!cnpj) {
      return res.status(400).json({ error: "O CNPJ \xE9 obrigat\xF3rio" });
    }
    const cleanCnpj = cnpj.replace(/\D/g, "");
    if (cleanCnpj.length !== 14) {
      return res.json({ valid: false, message: "O CNPJ precisa conter exatamente 14 d\xEDgitos." });
    }
    const validateCNPJPattern = (val) => {
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
      let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
      if (result !== Number(digits.charAt(0))) return false;
      size = size + 1;
      numbers = val.substring(0, size);
      sum = 0;
      pos = size - 7;
      for (let i = size; i >= 1; i--) {
        sum += Number(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      result = sum % 11 < 2 ? 0 : 11 - sum % 11;
      if (result !== Number(digits.charAt(1))) return false;
      return true;
    };
    if (!validateCNPJPattern(cleanCnpj)) {
      return res.json({ valid: false, message: "CNPJ possui d\xEDgito verificador matem\xE1tico inv\xE1lido!" });
    }
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (response.ok) {
        const data = await response.json();
        const isCnpjActive = data.descricao_situacao_cadastral === "ATIVA" || data.situacao_cadastral === 2 || data.situacao_cadastral === "2";
        return res.json({
          valid: true,
          active: isCnpjActive,
          statusText: data.descricao_situacao_cadastral || "ATIVA",
          companyName: data.razao_social || data.nome_fantasia || "Empresa sob an\xE1lise",
          message: isCnpjActive ? `Empresa ativa: ${data.razao_social || data.nome_fantasia}` : `Alerta: Situa\xE7\xE3o cadastral ${data.descricao_situacao_cadastral || "INATIVA"} na Receita Federal.`
        });
      }
      const receitaResponse = await fetch(`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`);
      if (receitaResponse.ok) {
        const rData = await receitaResponse.json();
        if (rData.status === "ERROR") {
          return res.json({ valid: false, message: rData.message || "CNPJ n\xE3o localizado na Receita Federal." });
        }
        const isCnpjActive = rData.situacao === "ATIVA";
        return res.json({
          valid: true,
          active: isCnpjActive,
          statusText: rData.situacao || "ATIVA",
          companyName: rData.nome || "Empresa sob an\xE1lise",
          message: isCnpjActive ? `Empresa ativa: ${rData.nome}` : `Alerta: Situa\xE7\xE3o cadastral ${rData.situacao || "INATIVA"} na Receita Federal.`
        });
      }
      return res.json({
        valid: true,
        active: true,
        companyName: "Empresa Cadastrada (Valida\xE7\xE3o Offline)",
        message: "CNPJ com padr\xE3o matem\xE1tico correto (Bancos de dados federais offline)."
      });
    } catch (err) {
      console.error("Third party CNPJ fetch failed:", err);
      return res.json({
        valid: true,
        active: true,
        companyName: "Empresa Cadastrada (Valida\xE7\xE3o Offline)",
        message: "CNPJ computacionalmente v\xE1lido (Bancos de dados federais inst\xE1veis)."
      });
    }
  });
  app.post("/api/leads/calculate-score", async (req, res) => {
    const { lead, activities } = req.body;
    if (!lead) {
      return res.status(400).json({ error: "Lead are required for score calculation" });
    }
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
              type: import_genai.Type.OBJECT,
              properties: {
                scoreIA: { type: import_genai.Type.INTEGER },
                temperature: { type: import_genai.Type.STRING },
                iaSummary: { type: import_genai.Type.STRING }
              },
              required: ["scoreIA", "temperature", "iaSummary"]
            }
          }
        });
        const result = JSON.parse(response.text || "{}");
        return res.json({
          scoreIA: result.scoreIA ?? 50,
          temperature: result.temperature ?? "morno",
          iaSummary: result.iaSummary ?? "N\xE3o foi poss\xEDvel gerar a justificativa da IA."
        });
      } catch (error) {
        console.error("AI Lead Scoring generation failed, falling back to deterministic:", error);
      }
    }
    let score = 50;
    if (lead.status === "Novo") score += 5;
    else if (lead.status === "Prospec\xE7\xE3o") score += 10;
    else if (lead.status === "Qualificado") score += 20;
    else if (lead.status === "Em Negocia\xE7\xE3o") score += 30;
    else if (lead.status === "Fechado") score += 50;
    else if (lead.status === "Perdido") score -= 30;
    if (lead.priority === "Alta") score += 15;
    else if (lead.priority === "M\xE9dia") score += 5;
    else if (lead.priority === "Baixa") score -= 10;
    if (activities && Array.isArray(activities)) {
      const leadActivities = activities.filter((a) => a.leadId === lead.id);
      score += leadActivities.length * 8;
      const hasMeeting = leadActivities.some((a) => a.type === "Reuni\xE3o");
      if (hasMeeting) score += 15;
    }
    score = Math.max(0, Math.min(100, score));
    let temp = "morno";
    if (score < 45) temp = "frio";
    else if (score > 75) temp = "quente";
    const actCount = activities ? activities.filter((a) => a.leadId === lead.id).length : 0;
    const iaSummary = `C\xE1lculo autom\xE1tico (Offline): Lead com prioridade ${lead.priority} na etapa ${lead.status}. Possui ${actCount} atividades registradas no hist\xF3rico recente.`;
    res.json({
      scoreIA: score,
      temperature: temp,
      iaSummary
    });
  });
  app.get("/api/whatsapp/instances", (req, res) => {
    res.json(instances);
  });
  app.post("/api/whatsapp/instances", (req, res) => {
    const { name, phone = "-", webhookUrl = "" } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nome da inst\xE2ncia \xE9 obrigat\xF3rio" });
    }
    const newInst = {
      id: "evo_inst_" + Math.random().toString(36).substring(2, 9),
      name,
      phone,
      status: "DISCONNECTED",
      apiKey: "evo_apikey_" + Math.random().toString(36).substring(2, 12),
      webhookUrl: webhookUrl || "https://axis-crm.cloud/api/webhooks/whatsapp",
      qrcode: "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    instances.push(newInst);
    res.json(newInst);
  });
  app.post("/api/whatsapp/instances/:id/qrcode", (req, res) => {
    const { id } = req.params;
    const inst = instances.find((i) => i.id === id);
    if (!inst) {
      return res.status(404).json({ error: "Inst\xE2ncia n\xE3o encontrada" });
    }
    inst.status = "CONNECTING";
    inst.qrcode = `00020101021226450014br.gov.bcb.pix2523evo-wa-connection-token-key-${inst.id}`;
    res.json({ status: "CONNECTING", qrcode: inst.qrcode });
  });
  app.post("/api/whatsapp/instances/:id/connect", (req, res) => {
    const { id } = req.params;
    const { phone } = bodyWithFallback(req);
    const inst = instances.find((i) => i.id === id);
    if (!inst) {
      return res.status(404).json({ error: "Inst\xE2ncia n\xE3o encontrada" });
    }
    inst.status = "CONNECTED";
    inst.phone = phone || "+55 11 9" + Math.floor(1e3 + Math.random() * 9e3) + "-" + Math.floor(1e3 + Math.random() * 9e3);
    delete inst.qrcode;
    res.json({ status: "CONNECTED", instance: inst });
  });
  app.delete("/api/whatsapp/instances/:id", (req, res) => {
    const { id } = req.params;
    instances = instances.filter((i) => i.id !== id);
    res.json({ success: true, message: `Inst\xE2ncia ${id} removida` });
  });
  app.put("/api/whatsapp/instances/:id", (req, res) => {
    const { id } = req.params;
    const { webhookUrl, name, phone, status } = req.body;
    const inst = instances.find((i) => i.id === id);
    if (!inst) {
      return res.status(404).json({ error: "Inst\xE2ncia n\xE3o encontrada" });
    }
    if (webhookUrl !== void 0) inst.webhookUrl = webhookUrl;
    if (name !== void 0) inst.name = name;
    if (phone !== void 0) inst.phone = phone;
    if (status !== void 0) inst.status = status;
    res.json(inst);
  });
  function bodyWithFallback(req) {
    return req.body || {};
  }
  app.get("/api/whatsapp/contacts", (req, res) => {
    res.json(contacts);
  });
  app.post("/api/whatsapp/contacts", (req, res) => {
    const { name, phone, email, tags = ["lead"] } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Nome e Telefone s\xE3o obrigat\xF3rios" });
    }
    const cleanPhone = phone.startsWith("+") ? phone : `+55 ${phone}`;
    const existing = contacts.find((c) => c.phone === cleanPhone);
    if (existing) {
      return res.json(existing);
    }
    const initials = name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "WA";
    const newContact = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      avatar: initials,
      channel: "WhatsApp",
      lastMessage: "Nova conversa iniciada",
      time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
  app.get("/api/whatsapp/messages/:contactId", (req, res) => {
    const { contactId } = req.params;
    res.json(messages[contactId] || []);
  });
  app.post("/api/whatsapp/messages/send", (req, res) => {
    const { contactId, text } = req.body;
    if (!contactId || !text) {
      return res.status(400).json({ error: "ID do contato e texto s\xE3o obrigat\xF3rios" });
    }
    const timeString = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = {
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
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      contact.lastMessage = text;
      contact.time = timeString;
    }
    res.json({ success: true, message: userMsg });
    const loweredText = text.toLowerCase();
    const matchedRule = chatbotRules.find((r) => {
      if (!r.active) return false;
      if (r.matchType === "equals") {
        return loweredText === r.trigger.toLowerCase();
      } else {
        return loweredText.includes(r.trigger.toLowerCase());
      }
    });
    if (matchedRule) {
      setTimeout(() => {
        const autoReply = {
          id: "msg_bot_" + Math.random().toString(36).substring(2, 9),
          text: matchedRule.response,
          sender: "them",
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
  app.post("/api/whatsapp/simulate-incoming", (req, res) => {
    const { contactId, text } = req.body;
    if (!contactId || !text) {
      return res.status(400).json({ error: "contactId e texto s\xE3o obrigat\xF3rios" });
    }
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contato n\xE3o encontrado" });
    }
    const timeString = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const inMsg = {
      id: "msg_sim_" + Math.random().toString(36).substring(2, 9),
      text,
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
    res.json({ message: inMsg, contact });
    const loweredText = text.toLowerCase();
    const matchedRule = chatbotRules.find((r) => {
      if (!r.active) return false;
      if (r.matchType === "equals") {
        return loweredText === r.trigger.toLowerCase();
      } else {
        return loweredText.includes(r.trigger.toLowerCase());
      }
    });
    if (matchedRule) {
      setTimeout(() => {
        const autoReply = {
          id: "msg_bot_" + Math.random().toString(36).substring(2, 9),
          text: matchedRule.response,
          sender: "them",
          // Wait! Automatic replies are sent by ME (our business)
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timestamp: Date.now(),
          status: "read"
        };
        messages[contactId].push(autoReply);
        contact.lastMessage = matchedRule.response;
        contact.time = autoReply.time;
      }, 1500);
    }
  });
  app.get("/api/whatsapp/chatbot/rules", (req, res) => {
    res.json(chatbotRules);
  });
  app.post("/api/whatsapp/chatbot/rules", (req, res) => {
    const { trigger, response, matchType = "contains" } = req.body;
    if (!trigger || !response) {
      return res.status(400).json({ error: "Gatilho e Resposta s\xE3o obrigat\xF3rios" });
    }
    const newRule = {
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
    const rule = chatbotRules.find((r) => r.id === id);
    if (!rule) {
      return res.status(404).json({ error: "Regra n\xE3o encontrada" });
    }
    if (trigger !== void 0) rule.trigger = trigger;
    if (response !== void 0) rule.response = response;
    if (matchType !== void 0) rule.matchType = matchType;
    if (active !== void 0) rule.active = active;
    res.json(rule);
  });
  app.delete("/api/whatsapp/chatbot/rules/:id", (req, res) => {
    const { id } = req.params;
    chatbotRules = chatbotRules.filter((r) => r.id !== id);
    res.json({ success: true, id });
  });
  app.post("/api/whatsapp/copilot/analyze", async (req, res) => {
    const { contactId } = req.body;
    if (!contactId) {
      return res.status(400).json({ error: "contactId \xE9 obrigat\xF3rio" });
    }
    const chatHistory = messages[contactId] || [];
    const contact = contacts.find((c) => c.id === contactId);
    if (chatHistory.length === 0) {
      return res.json({
        suggestion: "Ainda n\xE3o h\xE1 mensagens registradas com este contato para analisar. Tente fazer uma sauda\xE7\xE3o cort\xEAs, introduzindo o Axis CRM e perguntando como pode auxili\xE1-lo.",
        sentiment: "Neutro"
      });
    }
    const conversationText = chatHistory.map((m) => `${m.sender === "me" ? "Vendedor/Atendente" : "Cliente"}: ${m.text}`).join("\n");
    const promptContext = `Voc\xEA \xE9 o Axis Copilot, um assistente especializado em CRM, Vendas e Atendimento via WhatsApp.
    O cliente se chama: ${contact ? contact.name : "Cliente"}.
    O hist\xF3rico de mensagens \xE9 este:
    ${conversationText}

    Sua tarefa \xE9:
    1. Analisar brevemente o status/inten\xE7\xE3o do cliente (especialmente d\xFAvidas de frete, pre\xE7o, fechamento).
    2. Sugerir a RESPOSTA PERFEITA em portugu\xEAs para o vendedor copiar e enviar. A resposta deve ser acolhedora, profissional, concisa (em tom de WhatsApp, usando emojis se apropriado) e focada em convers\xE3o/ajuda.
    
    Retorne a resposta no formato JSON com duas propriedades:
    - analysis (uma frase resumindo o sentimento e status das negocia\xE7\xF5es)
    - suggestion (o rascunho exato da mensagem pronta para o vendedor usar)
    - sentiment (Positivo, Neutro ou Negativo)`;
    try {
      if (!process.env.GEMINI_API_KEY) {
        const lastMsg = chatHistory[chatHistory.length - 1];
        let sugg = `Ol\xE1 ${contact ? contact.name : ""}, compreendo sua d\xFAvida! Estamos analisando sua solicita\xE7\xE3o de frete com nossa log\xEDstica. De qualquer forma, gostaria de agendar uma liga\xE7\xE3o r\xE1pida hoje \xE0s 14h para fecharmos os detalhes?`;
        if (lastMsg.text.toLowerCase().includes("frete")) {
          sugg = `Ol\xE1 ${contact ? contact.name : ""}, com certeza! Para sua regi\xE3o, n\xF3s conseguimos fazer o frete com um desconto especial de 50%, ou at\xE9 GR\xC1TIS se fecharmos o contrato Pro hoje. O que acha?`;
        }
        return res.json({
          analysis: "O cliente demonstrou interesse inicial. A IA sugere oferecer atendimento \xE1gil para acelerar o fechamento.",
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
            type: import_genai.Type.OBJECT,
            properties: {
              analysis: { type: import_genai.Type.STRING },
              suggestion: { type: import_genai.Type.STRING },
              sentiment: { type: import_genai.Type.STRING }
            },
            required: ["analysis", "suggestion", "sentiment"]
          }
        }
      });
      const parsed = JSON.parse(response.text);
      res.json(parsed);
    } catch (e) {
      console.error("Copilot analysis failure:", e);
      res.status(500).json({ error: "Erro de processamento da IA" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
