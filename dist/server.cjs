var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_genai = require("@google/genai");
var import_supabase_js = require("@supabase/supabase-js");
var import_crypto = require("crypto");
var import_axios = __toESM(require("axios"), 1);
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
var sources = [
  { id: "1", name: "Instagram" },
  { id: "2", name: "WhatsApp" },
  { id: "3", name: "Indica\xE7\xE3o" },
  { id: "4", name: "Site" },
  { id: "5", name: "Google Ads" }
];
var customFields = [
  { id: "1", label: "CPF/CNPJ", type: "text", required: true },
  { id: "2", label: "Setor", type: "select", options: ["Varejo", "Servi\xE7os", "Ind\xFAstria"] }
];
var taskCategories = [
  { id: "1", name: "Follow-up", color: "bg-blue-500" },
  { id: "2", name: "Reuni\xE3o", color: "purple" },
  { id: "3", name: "Proposta", color: "emerald" }
];
var templates = [
  { id: "1", name: "Sauda\xE7\xE3o Inicial", content: "Ol\xE1 {{name}}, como posso ajudar?", category: "Vendas" }
];
var supabaseUrl = process.env.VITE_SUPABASE_URL || "";
var supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
var supabase = supabaseUrl && supabaseKey ? (0, import_supabase_js.createClient)(supabaseUrl, supabaseKey) : null;
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy_key_to_prevent_crash_at_load_time",
  httpOptions: { headers: { "User-Agent": "aistudio-build" } }
});
var validApiKeys = new Set(
  (process.env.AXIS_API_KEYS || "").split(",").map((k) => k.trim()).filter(Boolean)
);
var FORM_TENANT_ID = process.env.AXIS_FORM_TENANT_ID || "";
var FORM_CLIENT_ID = process.env.AXIS_FORM_CLIENT_ID || "";
async function callGroq(prompt) {
  const key = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY n\xE3o configurada.");
  const res = await import_axios.default.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    },
    {
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      timeout: 2e4
    }
  );
  return res.data.choices?.[0]?.message?.content ?? "";
}
async function callGemini(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt
  });
  let text = "";
  try {
    text = typeof response.text === "function" ? response.text() : response.text ?? "";
  } catch {
    text = response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
  return text;
}
async function generateAI(prompt) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const text = await callGemini(prompt);
      if (text.trim()) return text;
      throw new Error("Gemini retornou vazio.");
    } catch (err) {
      console.warn("[AI] Gemini falhou, usando Groq:", err?.message?.slice(0, 100));
    }
  }
  return callGroq(prompt);
}
function extractJSON(raw) {
  let text = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Sem JSON v\xE1lido na resposta: " + text.slice(0, 200));
  return JSON.parse(text.slice(start, end + 1));
}
var app = (0, import_express.default)();
app.use((req, res, next) => {
  if (req.body !== void 0) return next();
  import_express.default.json({ limit: "5mb" })(req, res, next);
});
var allowedOrigin = process.env.AXIS_CORS_ORIGIN || "*";
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
function requireApiKey(req, res, next) {
  if (validApiKeys.size === 0) {
    return res.status(503).json({ error: "Nenhuma API Key configurada. Defina AXIS_API_KEYS no .env." });
  }
  const key = req.headers["x-api-key"];
  if (!key || !validApiKeys.has(key)) {
    return res.status(401).json({ error: "API Key inv\xE1lida ou ausente." });
  }
  next();
}
app.post("/api/v1/leads", requireApiKey, async (req, res) => {
  const {
    name,
    company = "",
    email = "",
    phone = "",
    cnpj = "",
    title = "",
    seller = "",
    source = "",
    status = "Novo",
    priority = "M\xE9dia",
    value = 0,
    stageId = "sdr-1",
    pipelineId = "sdr",
    lead_interesse_cliente = "",
    customFields: customFields2 = {},
    clientId = FORM_CLIENT_ID,
    clientName = "",
    productIds = [],
    tenantId = FORM_TENANT_ID,
    tenantName = ""
  } = req.body;
  if (!name) return res.status(400).json({ error: "O campo 'name' \xE9 obrigat\xF3rio." });
  if (!email && !phone) return res.status(400).json({ error: "Informe ao menos 'email' ou 'phone'." });
  const id = (0, import_crypto.randomUUID)();
  const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const rawValue = typeof value === "string" ? parseFloat(value.replace(/[^\d.,]/g, "").replace(",", ".")) || 0 : value ?? 0;
  const newLead = {
    id,
    name,
    company,
    email,
    phone,
    cnpj,
    title,
    seller,
    source,
    status,
    priority,
    value: rawValue,
    stageId,
    pipelineId,
    lead_interesse_cliente,
    customFields: customFields2,
    clientId,
    clientName,
    productIds,
    tenant_id: tenantId || null,
    tenantName,
    scoreIA: 50,
    date: now,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (!supabase) return res.status(503).json({ error: "Banco de dados n\xE3o configurado no servidor." });
  const { data, error } = await supabase.from("leads").insert(newLead).select().maybeSingle();
  if (error) {
    console.error("[API v1] Erro ao criar lead:", error.message);
    return res.status(500).json({ error: "Falha ao salvar lead no banco.", details: error.message });
  }
  return res.status(201).json({ success: true, lead: data ?? newLead });
});
app.get("/api/v1/leads", requireApiKey, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Banco de dados n\xE3o configurado no servidor." });
  const { tenantId, tenantName, seller, status, limit = "100", offset = "0" } = req.query;
  let query = supabase.from("leads").select("*").order("createdAt", { ascending: false }).limit(parseInt(limit)).range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
  if (tenantId) query = query.eq("tenant_id", tenantId);
  else if (tenantName) query = query.eq("tenantName", tenantName);
  if (seller) query = query.eq("seller", seller);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: "Falha ao buscar leads.", details: error.message });
  return res.json({ success: true, count: data?.length ?? 0, leads: data ?? [] });
});
app.post("/api/leads/suggest-tags", async (req, res) => {
  const { name, company, notes } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.json({ tags: ["Interesse", "Novo Lead", "PME"] });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Suggest 3-5 relevant tags for a lead with the following info:
      Name: ${name}
      Company: ${company}
      Description: ${notes}
      Return the tags as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } }
      }
    });
    res.json({ tags: JSON.parse(response.text ?? "[]") });
  } catch (error) {
    console.error("AI Tag Suggestion Error:", error);
    res.status(500).json({ error: "Failed to suggest tags" });
  }
});
app.post("/api/cnpj/validate", async (req, res) => {
  const { cnpj } = req.body;
  if (!cnpj) return res.status(400).json({ error: "O CNPJ \xE9 obrigat\xF3rio" });
  const cleanCnpj = cnpj.replace(/\D/g, "");
  if (cleanCnpj.length !== 14) return res.json({ valid: false, message: "O CNPJ precisa conter exatamente 14 d\xEDgitos." });
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
    size += 1;
    numbers = val.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += Number(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    return result === Number(digits.charAt(1));
  };
  if (!validateCNPJPattern(cleanCnpj)) return res.json({ valid: false, message: "CNPJ possui d\xEDgito verificador matem\xE1tico inv\xE1lido!" });
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
      if (rData.status === "ERROR") return res.json({ valid: false, message: rData.message || "CNPJ n\xE3o localizado na Receita Federal." });
      const isCnpjActive = rData.situacao === "ATIVA";
      return res.json({
        valid: true,
        active: isCnpjActive,
        statusText: rData.situacao || "ATIVA",
        companyName: rData.nome || "Empresa sob an\xE1lise",
        message: isCnpjActive ? `Empresa ativa: ${rData.nome}` : `Alerta: Situa\xE7\xE3o cadastral ${rData.situacao || "INATIVA"} na Receita Federal.`
      });
    }
    return res.json({ valid: true, active: true, companyName: "Empresa Cadastrada (Valida\xE7\xE3o Offline)", message: "CNPJ com padr\xE3o matem\xE1tico correto (Bancos de dados federais offline)." });
  } catch {
    return res.json({ valid: true, active: true, companyName: "Empresa Cadastrada (Valida\xE7\xE3o Offline)", message: "CNPJ computacionalmente v\xE1lido (Bancos de dados federais inst\xE1veis)." });
  }
});
app.post("/api/leads/calculate-score", async (req, res) => {
  const { lead, activities } = req.body;
  if (!lead) return res.status(400).json({ error: "Lead data is required for score calculation" });
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
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
      console.error("AI Lead Scoring failed, falling back to deterministic:", error);
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
    if (leadActivities.some((a) => a.type === "Reuni\xE3o")) score += 15;
  }
  score = Math.max(0, Math.min(100, score));
  let temp = "morno";
  if (score < 45) temp = "frio";
  else if (score > 75) temp = "quente";
  const actCount = activities ? activities.filter((a) => a.leadId === lead.id).length : 0;
  return res.json({
    scoreIA: score,
    temperature: temp,
    iaSummary: `C\xE1lculo autom\xE1tico (Offline): Lead com prioridade ${lead.priority} na etapa ${lead.status}. Possui ${actCount} atividades registradas no hist\xF3rico recente.`
  });
});
app.post("/api/ai/performance-audit", async (req, res) => {
  const { mrr, cac, ltv, leadsCount, dealsCount } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Chave de IA n\xE3o configurada." });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Voc\xEA \xE9 o Master IA do Axis CRM. Analise estes indicadores:
      MRR: ${mrr}, CAC: ${cac}, LTV: ${ltv}, Leads: ${leadsCount}, Fechamentos: ${dealsCount}.
      Gere 3 recomenda\xE7\xF5es estrat\xE9gicas baseadas em dados para otimizar o ROI.
      Retorne estritamente um JSON array de objetos: [{"title": string, "desc": string, "impact": string, "color": "text-blue-400" | "text-emerald-400" | "text-purple-400"}].`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              title: { type: import_genai.Type.STRING },
              desc: { type: import_genai.Type.STRING },
              impact: { type: import_genai.Type.STRING },
              color: { type: import_genai.Type.STRING }
            },
            required: ["title", "desc", "impact", "color"]
          }
        }
      }
    });
    res.json(JSON.parse(response.text ?? "[]"));
  } catch {
    res.status(500).json({ error: "Falha na auditoria cerebral." });
  }
});
app.post("/api/ai/pipeline-audit", async (req, res) => {
  const { stageName, leads } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "IA Offline" });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Analise a etapa "${stageName}" do funil com estes leads:
      ${JSON.stringify(leads.map((l) => ({ name: l.name, score: l.scoreIA, temp: l.temperature })))}
      Forne\xE7a um insight r\xE1pido e uma a\xE7\xE3o imediata para o vendedor.
      Retorne JSON: {"insight": string, "action": string}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: { insight: { type: import_genai.Type.STRING }, action: { type: import_genai.Type.STRING } },
          required: ["insight", "action"]
        }
      }
    });
    res.json(JSON.parse(response.text ?? "{}"));
  } catch {
    res.status(500).json({ error: "Falha ao auditar funil." });
  }
});
app.post("/api/ai/marketing-advisor", async (req, res) => {
  const { leads, spent } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "IA Offline" });
  try {
    const sourceData = leads.reduce((acc, l) => {
      const src = l.source || "Org\xE2nico";
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {});
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `An\xE1lise de Marketing:
      Gasto Total: R$ ${spent}
      Convers\xE3o por Origem: ${JSON.stringify(sourceData)}
      Sugira onde realocar verba para diminuir o CAC.
      Retorne JSON: {"suggestion": string, "rationale": string}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: { suggestion: { type: import_genai.Type.STRING }, rationale: { type: import_genai.Type.STRING } },
          required: ["suggestion", "rationale"]
        }
      }
    });
    res.json(JSON.parse(response.text ?? "{}"));
  } catch {
    res.status(500).json({ error: "Falha na an\xE1lise de marketing." });
  }
});
app.post("/api/ai/settings-audit", async (req, res) => {
  const { type, config } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "IA Offline" });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Voc\xEA \xE9 o Auditor Master do Axis CRM. Analise esta configura\xE7\xE3o de ${type}:
      ${JSON.stringify(config)}
      Identifique poss\xEDveis gargalos, regras redundantes ou melhorias na l\xF3gica.
      Retorne estritamente um JSON: {"audit": string, "suggestions": string[]}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            audit: { type: import_genai.Type.STRING },
            suggestions: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } }
          },
          required: ["audit", "suggestions"]
        }
      }
    });
    res.json(JSON.parse(response.text ?? "{}"));
  } catch {
    res.status(500).json({ error: "Falha ao auditar configura\xE7\xF5es." });
  }
});
app.get("/api/settings/:category", async (req, res) => {
  const { category } = req.params;
  if (supabase) {
    const tableName = `crm_${category.replace("-", "_")}`;
    const { data, error } = await supabase.from(tableName).select("*");
    if (!error && data) return res.json(data);
  }
  switch (category) {
    case "sources":
      return res.json(sources);
    case "fields":
    case "custom-fields":
    case "custom_lead_fields":
      return res.json(customFields);
    case "task-categories":
    case "categories":
      return res.json(taskCategories);
    case "templates":
      return res.json(templates);
    default:
      return res.status(404).json({ error: "Categoria n\xE3o encontrada" });
  }
});
app.post("/api/settings/:category", async (req, res) => {
  const { category } = req.params;
  const item = req.body;
  const id = Math.random().toString(36).substring(2, 9);
  const newItem = { id, ...item };
  if (supabase) {
    const tableName = `crm_${category.replace("-", "_")}`;
    const { data, error } = await supabase.from(tableName).insert([newItem]).select();
    if (!error && data) return res.json(data[0]);
  }
  switch (category) {
    case "sources":
      const newSource = { id, name: item.name || item.nome };
      sources.push(newSource);
      return res.json(newSource);
    case "fields":
    case "custom-fields":
    case "custom_lead_fields":
      customFields.push(newItem);
      return res.json(newItem);
    case "task-categories":
      taskCategories.push(newItem);
      return res.json(newItem);
    case "templates":
      templates.push(newItem);
      return res.json(newItem);
    default:
      return res.status(404).json({ error: "Categoria inv\xE1lida" });
  }
});
app.delete("/api/settings/:category/:id", async (req, res) => {
  const { category, id } = req.params;
  if (supabase) {
    const tableName = `crm_${category.replace("-", "_")}`;
    await supabase.from(tableName).delete().eq("id", id);
  }
  switch (category) {
    case "sources":
      sources = sources.filter((s) => s.id !== id);
      break;
    case "fields":
    case "custom-fields":
    case "custom_lead_fields":
      customFields = customFields.filter((f) => f.id !== id);
      break;
    case "task-categories":
    case "categories":
      taskCategories = taskCategories.filter((c) => c.id !== id);
      break;
    case "templates":
      templates = templates.filter((t) => t.id !== id);
      break;
  }
  res.json({ success: true });
});
app.post("/api/ai/suggest-new-config", async (req, res) => {
  const { type } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.json({ suggestion: null });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Voc\xEA \xE9 um consultor de CRM. Sugira um exemplo para "${type}".
      N\xC3O inclua campos como 'target'. Use os campos exatos abaixo.
      Responda APENAS com JSON:
      - Se for "Campo Personalizado": {"name": "Data de Anivers\xE1rio", "type": "Data", "required": false}
      - Se for "Origem": {"nome": "Indica\xE7\xE3o Parceiro Premium"}
      - Se for "Categoria de Tarefa": {"nome": "Follow-up Estrat\xE9gico", "cor": "bg-purple-500"}
      - Se for "Modelo": {"name": "Boas-vindas", "content": "Ol\xE1 {{name}}, seja bem-vindo!", "category": "Vendas"}`,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text ?? "{}"));
  } catch {
    res.status(500).json({ error: "Erro na sugest\xE3o da IA" });
  }
});
app.post("/api/ai/generic-insight", async (req, res) => {
  const { context, data } = req.body;
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ insight: "A Master IA est\xE1 em modo offline no momento. Conecte sua API Key para obter insights estrat\xE9gicos." });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Voc\xEA \xE9 o c\xE9rebro anal\xEDtico do Axis CRM.
      Contexto da solicita\xE7\xE3o: ${context}.
      Dados brutos para an\xE1lise: ${JSON.stringify(data)}.
      Sua tarefa: Forne\xE7a um insight estrat\xE9gico curto, direto e acion\xE1vel em portugu\xEAs (m\xE1ximo 3 frases).
      Foque em melhoria de ROI, convers\xE3o ou reten\xE7\xE3o.`
    });
    res.json({ insight: response.text ?? "" });
  } catch (error) {
    console.error("Erro na Master IA:", error);
    res.status(500).json({ error: "Falha ao processar insight cerebral." });
  }
});
app.post("/api/ai/reuniao-copilot", async (req, res) => {
  const { transcript, leadContext } = req.body ?? {};
  const hasAI = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!hasAI) return res.json({ analysis: null, error: "Nenhuma chave de IA configurada." });
  if (!transcript?.trim()) return res.status(400).json({ error: "Transcri\xE7\xE3o vazia." });
  try {
    const leadInfo = leadContext ? `
CONTEXTO DO LEAD:
- Nome: ${leadContext.name ?? "?"} | Empresa: ${leadContext.company ?? "?"}
- Score: ${leadContext.scoreIA ?? "N/A"} | Temperatura: ${leadContext.temperature ?? "N/A"}
- SDR Summary: ${leadContext.iaSummary ?? "Sem relat\xF3rio"}
- Interesse: ${leadContext.lead_interesse ?? "N\xE3o informado"}
- Pauta: ${leadContext.pauta ?? "N\xE3o definida"}` : "";
    const prompt = `Voc\xEA \xE9 o Copilot de vendas Axis CRM. Analise a transcri\xE7\xE3o e retorne SOMENTE o JSON, sem markdown.${leadInfo}

TRANSCRI\xC7\xC3O: "${transcript.slice(0, 4e3)}"

Responda APENAS com este JSON:
{"bant":{"budget":{"status":"identificado","nota":"..."},"authority":{"status":"parcial","nota":"..."},"need":{"status":"identificado","nota":"..."},"timeline":{"status":"nao_identificado","nota":"..."}},"score_fechamento":65,"objecoes_detectadas":["..."],"proxima_acao":"...","pergunta_poderosa":"...","alerta":""}`;
    const raw = await generateAI(prompt);
    const data = extractJSON(raw);
    return res.json({ analysis: data });
  } catch (err) {
    console.error("[Copilot Reuni\xE3o]", err?.message);
    return res.status(500).json({ error: "Erro ao analisar transcri\xE7\xE3o: " + (err?.message ?? "desconhecido") });
  }
});
app.post("/api/ai/lead-copilot", async (req, res) => {
  const { leadContext } = req.body ?? {};
  const hasAI = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!hasAI) return res.json({ analysis: null, error: "Nenhuma chave de IA configurada." });
  if (!leadContext) return res.status(400).json({ error: "Contexto do lead ausente." });
  try {
    const prompt = `Voc\xEA \xE9 o Copilot de CRM do Axis. Analise o perfil do lead e retorne SOMENTE o JSON, sem markdown, sem texto extra.

PERFIL DO LEAD:
Nome: ${leadContext.name ?? "N\xE3o informado"}
Empresa: ${leadContext.company ?? "N\xE3o informado"}
Score IA: ${leadContext.scoreIA ?? "N/A"}
Temperatura: ${leadContext.temperature ?? "N/A"}
Est\xE1gio: ${leadContext.stage ?? "Desconhecido"}
Interesse declarado: ${leadContext.lead_interesse ?? "N\xE3o informado"}
Resumo SDR: ${leadContext.iaSummary ?? "Sem hist\xF3rico"}
Produto de interesse: ${leadContext.product ?? "N\xE3o definido"}

Responda APENAS com este JSON:
{"resumo_curto":"...","probabilidade_fechamento":70,"recomendacao_proximo_passo":"...","abordagem_ideal":"...","pergunta_abertura":"...","objecoes_previstas":["...","..."],"alerta":""}`;
    const raw = await generateAI(prompt);
    const data = extractJSON(raw);
    return res.json({ analysis: data });
  } catch (err) {
    console.error("[Copilot Lead] Erro:", err?.message);
    return res.json({
      analysis: {
        resumo_curto: "An\xE1lise indispon\xEDvel no momento. Tente novamente.",
        probabilidade_fechamento: null,
        recomendacao_proximo_passo: "Clique em 'Analisar Lead' para tentar novamente.",
        abordagem_ideal: null,
        pergunta_abertura: null,
        objecoes_previstas: [],
        alerta: "Falha ao conectar com a IA: " + (err?.message ?? "erro desconhecido")
      }
    });
  }
});
app.post("/api/ai/reuniao-relatorio", async (req, res) => {
  const { transcript, notes, leadContext, pauta, reuniaoId } = req.body ?? {};
  const hasAI = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!hasAI) return res.json({ relatorio: "Relat\xF3rio n\xE3o dispon\xEDvel \u2014 configure uma chave de IA." });
  try {
    const relatorio = await generateAI(`Voc\xEA \xE9 o analista de vendas do Axis CRM. Gere um relat\xF3rio completo desta reuni\xE3o.

LEAD: ${leadContext?.name ?? "N/A"} | ${leadContext?.company ?? "N/A"}
Score IA: ${leadContext?.scoreIA ?? "N/A"} | Temperatura: ${leadContext?.temperature ?? "N/A"}
Relat\xF3rio SDR: ${leadContext?.iaSummary ?? "Sem relat\xF3rio"}
Pauta: ${pauta ?? "N\xE3o definida"}

TRANSCRI\xC7\xC3O:
${(transcript ?? "Sem transcri\xE7\xE3o capturada").slice(0, 4e3)}

NOTAS DO CLOSER:
${notes ?? "Sem notas"}

Gere um relat\xF3rio executivo em markdown com:
## Resumo Executivo
## Pontos-Chave Discutidos
## An\xE1lise BANT Final
## Obje\xE7\xF5es e Como Foram Tratadas
## Pr\xF3ximos Passos (com respons\xE1veis e prazos)
## Recomenda\xE7\xE3o de Fechamento (Alta/M\xE9dia/Baixa probabilidade e por qu\xEA)`);
    if (supabase && reuniaoId) {
      await supabase.from("reunioes").update({
        relatorio_ia: relatorio,
        ...transcript ? { transcricao: transcript } : {},
        ...notes ? { notas_closer: notes } : {},
        status: "Conclu\xEDda"
      }).eq("id", reuniaoId);
    }
    res.json({ relatorio });
  } catch (err) {
    console.error("[Relat\xF3rio Reuni\xE3o]", err?.message);
    res.status(500).json({ error: "Erro ao gerar relat\xF3rio." });
  }
});
function bodyWithFallback(req) {
  return req.body || {};
}
app.get("/api/whatsapp/instances", async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from("whatsapp_instances").select("*").order("created_at", { ascending: false });
    if (!error && data) return res.json(data);
  }
  res.json(instances);
});
app.post("/api/whatsapp/instances", (req, res) => {
  const { name, phone = "-", webhookUrl = "" } = req.body;
  if (!name) return res.status(400).json({ error: "Nome da inst\xE2ncia \xE9 obrigat\xF3rio" });
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
  if (!inst) return res.status(404).json({ error: "Inst\xE2ncia n\xE3o encontrada" });
  inst.status = "CONNECTING";
  inst.qrcode = `00020101021226450014br.gov.bcb.pix2523evo-wa-connection-token-key-${inst.id}`;
  res.json({ status: "CONNECTING", qrcode: inst.qrcode });
});
app.post("/api/whatsapp/instances/:id/connect", (req, res) => {
  const { id } = req.params;
  const { phone } = bodyWithFallback(req);
  const inst = instances.find((i) => i.id === id);
  if (!inst) return res.status(404).json({ error: "Inst\xE2ncia n\xE3o encontrada" });
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
  if (!inst) return res.status(404).json({ error: "Inst\xE2ncia n\xE3o encontrada" });
  if (webhookUrl !== void 0) inst.webhookUrl = webhookUrl;
  if (name !== void 0) inst.name = name;
  if (phone !== void 0) inst.phone = phone;
  if (status !== void 0) inst.status = status;
  res.json(inst);
});
app.get("/api/whatsapp/contacts", (req, res) => res.json(contacts));
app.post("/api/whatsapp/contacts", (req, res) => {
  const { name, phone, email, tags = ["lead"] } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "Nome e Telefone s\xE3o obrigat\xF3rios" });
  const cleanPhone = phone.startsWith("+") ? phone : `+55 ${phone}`;
  const existing = contacts.find((c) => c.phone === cleanPhone);
  if (existing) return res.json(existing);
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
  if (!messages[newContact.id]) messages[newContact.id] = [];
  res.json(newContact);
});
app.get("/api/whatsapp/messages/:contactId", async (req, res) => {
  const { contactId } = req.params;
  if (supabase) {
    const { data, error } = await supabase.from("chat_messages").select("*").eq("contact_id", contactId).order("timestamp", { ascending: true });
    if (!error && data) return res.json(data);
  }
  res.json(messages[contactId] || []);
});
app.post("/api/whatsapp/messages/send", async (req, res) => {
  const { contactId, text } = req.body;
  if (!contactId || !text) return res.status(400).json({ error: "ID do contato e texto s\xE3o obrigat\xF3rios" });
  const timeString = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const userMsg = {
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    text,
    sender: "me",
    time: timeString,
    status: "sent",
    timestamp: Date.now()
  };
  if (!messages[contactId]) messages[contactId] = [];
  messages[contactId].push(userMsg);
  if (supabase) {
    await supabase.from("chat_messages").insert([{ id: userMsg.id, text: userMsg.text, sender: userMsg.sender, time: userMsg.time, status: userMsg.status, timestamp: userMsg.timestamp, contact_id: contactId }]);
    await supabase.from("chat_contacts").update({ lastMessage: text, time: timeString }).eq("id", contactId);
  }
  const contact = contacts.find((c) => c.id === contactId);
  if (contact) {
    contact.lastMessage = text;
    contact.time = timeString;
  }
  res.json({ success: true, message: userMsg });
});
app.post("/api/whatsapp/simulate-incoming", async (req, res) => {
  const { contactId, text } = req.body;
  if (!contactId || !text) return res.status(400).json({ error: "contactId e texto s\xE3o obrigat\xF3rios" });
  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) return res.status(404).json({ error: "Contato n\xE3o encontrado" });
  const timeString = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const inMsg = {
    id: "msg_sim_" + Math.random().toString(36).substring(2, 9),
    text,
    sender: "them",
    time: timeString,
    timestamp: Date.now()
  };
  if (!messages[contactId]) messages[contactId] = [];
  messages[contactId].push(inMsg);
  contact.lastMessage = text;
  contact.time = timeString;
  contact.unread += 1;
  if (supabase) {
    await supabase.from("chat_messages").insert([{ id: inMsg.id, text: inMsg.text, sender: inMsg.sender, time: inMsg.time, timestamp: inMsg.timestamp, contact_id: contactId }]);
    await supabase.from("chat_contacts").update({ lastMessage: text, time: timeString, unread: contact.unread }).eq("id", contactId);
  }
  res.json({ message: inMsg, contact });
});
app.post("/api/whatsapp/copilot/analyze", async (req, res) => {
  const { contactId } = req.body;
  if (!contactId) return res.status(400).json({ error: "contactId \xE9 obrigat\xF3rio" });
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
  2. Sugerir a RESPOSTA PERFEITA em portugu\xEAs para o vendedor copiar e enviar.
  Retorne a resposta no formato JSON:
  - analysis (uma frase resumindo o sentimento e status das negocia\xE7\xF5es)
  - suggestion (o rascunho exato da mensagem pronta para o vendedor usar)
  - sentiment (Positivo, Neutro ou Negativo)`;
  try {
    if (!process.env.GEMINI_API_KEY) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      let sugg = `Ol\xE1 ${contact ? contact.name : ""}, compreendo sua d\xFAvida! Estamos analisando sua solicita\xE7\xE3o. De qualquer forma, gostaria de agendar uma liga\xE7\xE3o r\xE1pida hoje \xE0s 14h para fecharmos os detalhes?`;
      if (lastMsg.text.toLowerCase().includes("frete")) {
        sugg = `Ol\xE1 ${contact ? contact.name : ""}, com certeza! Para sua regi\xE3o, n\xF3s conseguimos fazer o frete com um desconto especial de 50%, ou at\xE9 GR\xC1TIS se fecharmos o contrato Pro hoje. O que acha?`;
      }
      return res.json({ analysis: "O cliente demonstrou interesse inicial. A IA sugere oferecer atendimento \xE1gil para acelerar o fechamento.", suggestion: sugg, sentiment: "Positivo" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: promptContext,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: { analysis: { type: import_genai.Type.STRING }, suggestion: { type: import_genai.Type.STRING }, sentiment: { type: import_genai.Type.STRING } },
          required: ["analysis", "suggestion", "sentiment"]
        }
      }
    });
    res.json(JSON.parse(response.text ?? "{}"));
  } catch (e) {
    console.error("Copilot analysis failure:", e);
    res.status(500).json({ error: "Erro de processamento da IA" });
  }
});
app.use((err, _req, res, _next) => {
  console.error("[Axis] Unhandled error:", err?.message || err);
  if (!res.headersSent) {
    res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
});
var server_default = app;
//# sourceMappingURL=server.cjs.map
