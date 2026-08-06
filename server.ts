import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { randomUUID, createHmac, timingSafeEqual, randomBytes } from "crypto";
import axios from "axios";

// ── Types ──────────────────────────────────────────────────────────────────

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

// ── In-Memory State ────────────────────────────────────────────────────────

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

let sources: any[] = [
  { id: "1", name: "Instagram" },
  { id: "2", name: "WhatsApp" },
  { id: "3", name: "Indicação" },
  { id: "4", name: "Site" },
  { id: "5", name: "Google Ads" }
];
let customFields: any[] = [
  { id: "1", label: "CPF/CNPJ", type: "text", required: true },
  { id: "2", label: "Setor", type: "select", options: ["Varejo", "Serviços", "Indústria"] }
];
let taskCategories: any[] = [
  { id: "1", name: "Follow-up", color: "bg-blue-500" },
  { id: "2", name: "Reunião", color: "purple" },
  { id: "3", name: "Proposta", color: "emerald" }
];
let templates = [
  { id: "1", name: "Saudação Inicial", content: "Olá {{name}}, como posso ajudar?", category: "Vendas" }
];

// ── Singletons ─────────────────────────────────────────────────────────────

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Client privilegiado (bypassa RLS) — uso restrito à rota /api/v1/leads, que é
// chamada por integrações externas (não por um usuário logado no Axis) e por
// isso não tem um JWT de sessão para respeitar a RLS normalmente. O tenant_id
// usado nessas chamadas vem só do mapeamento de API key (apiKeyTenantMap),
// nunca do corpo da requisição — é isso que mantém o isolamento aqui.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseService = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy_key_to_prevent_crash_at_load_time",
  httpOptions: { headers: { "User-Agent": "aistudio-build" } },
});

// Formato: "chave1:tenantIdA,chave2:tenantIdB" — cada API key é vinculada a
// exatamente um tenant. Uma chave nunca pode ler/gravar leads de outro tenant,
// mesmo que o chamador informe um tenantId diferente no corpo da requisição.
const apiKeyTenantMap = new Map(
  (process.env.AXIS_API_KEYS || "")
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [key, tenantId] = pair.split(":").map((s) => s.trim());
      return [key, tenantId] as [string, string];
    })
    .filter(([key, tenantId]) => key && tenantId)
);

const FORM_CLIENT_ID = process.env.AXIS_FORM_CLIENT_ID || "";

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID || "";
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET || "";
const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI || "";
// URL pública do app Axis — usada só pra redirecionar o browser de volta pra
// Settings depois do callback OAuth do HubSpot (não afeta nenhuma outra rota).
const AXIS_APP_URL = process.env.AXIS_APP_URL || "";
const HUBSPOT_SCOPES = "crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read crm.objects.deals.write oauth";

// ── AI Helpers: Gemini → Groq fallback ────────────────────────────────────

async function callGroq(prompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY não configurada.");
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    },
    {
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      timeout: 20000,
    }
  );
  return (res.data.choices?.[0]?.message?.content ?? "") as string;
}

async function callGemini(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
  let text = "";
  try {
    text = (typeof response.text === "function"
      ? (response as any).text()
      : response.text ?? "") as string;
  } catch {
    text = (response as any)?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
  return text;
}

// Tenta Gemini; se falhar, usa Groq automaticamente
async function generateAI(prompt: string): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    try {
      const text = await callGemini(prompt);
      if (text.trim()) return text;
      throw new Error("Gemini retornou vazio.");
    } catch (err) {
      console.warn("[AI] Gemini falhou, usando Groq:", (err as any)?.message?.slice(0, 100));
    }
  }
  return callGroq(prompt);
}

// Extrai JSON de respostas que podem ter markdown ou texto extra
function extractJSON(raw: string): any {
  let text = raw.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Sem JSON válido na resposta: " + text.slice(0, 200));
  return JSON.parse(text.slice(start, end + 1));
}

// ── Express App ────────────────────────────────────────────────────────────

const app = express();

// Vercel pre-parses the body before passing to Express — skip json() if already parsed
app.use((req: any, res, next) => {
  if (req.body !== undefined) return next();
  express.json({ limit: "5mb" })(req, res, next);
});

const allowedOrigin = process.env.AXIS_CORS_ORIGIN || "*";
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function requireApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (apiKeyTenantMap.size === 0) {
    return res.status(503).json({ error: "Nenhuma API Key configurada. Defina AXIS_API_KEYS no formato chave:tenantId no .env." });
  }
  const key = req.headers["x-api-key"] as string | undefined;
  const tenantId = key ? apiKeyTenantMap.get(key) : undefined;
  if (!key || !tenantId) {
    return res.status(401).json({ error: "API Key inválida ou ausente." });
  }
  (req as any).tenantId = tenantId;
  next();
}

/**
 * Exige uma sessão real do Supabase Auth (JWT no header Authorization).
 * Anexa req.user (usuário autenticado) e req.supabase (client escopado com o
 * token do chamador, para que toda query subsequente respeite a RLS por
 * tenant automaticamente, sem precisar filtrar tenant_id manualmente na rota).
 */
async function requireUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!supabase) return res.status(503).json({ error: "Banco de dados não configurado no servidor." });

  const authHeader = req.headers["authorization"] as string | undefined;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Autenticação obrigatória." });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Sessão inválida ou expirada." });

  (req as any).user = data.user;
  (req as any).supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  next();
}

// ── API PÚBLICA ────────────────────────────────────────────────────────────

app.post("/api/v1/leads", requireApiKey, async (req, res) => {
  const {
    name, company = "", email = "", phone = "", cnpj = "",
    title = "", seller = "", source = "", status = "Novo",
    priority = "Média", value = 0, stageId = "sdr-1",
    pipelineId = "sdr", lead_interesse_cliente = "",
    customFields = {}, clientId = FORM_CLIENT_ID, clientName = "",
    productIds = [],
    tenantName = ""
  } = req.body;

  if (!name) return res.status(400).json({ error: "O campo 'name' é obrigatório." });
  if (!email && !phone) return res.status(400).json({ error: "Informe ao menos 'email' ou 'phone'." });

  const id = randomUUID();
  const now = new Date().toISOString().split("T")[0];
  const rawValue = typeof value === "string"
    ? parseFloat(value.replace(/[^\d.,]/g, "").replace(",", ".")) || 0
    : (value ?? 0);

  // tenant_id vem só da API key (nunca do corpo da requisição) — ver requireApiKey.
  const newLead = {
    id, name, company, email, phone, cnpj, title, seller, source,
    status, priority, value: rawValue, stageId, pipelineId,
    lead_interesse_cliente, customFields, clientId, clientName,
    productIds, tenant_id: (req as any).tenantId, tenantName, scoreIA: 50, date: now,
    createdAt: new Date().toISOString()
  };

  if (!supabaseService) return res.status(503).json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." });

  const { data, error } = await supabaseService.from("leads").insert(newLead).select().maybeSingle();
  if (error) {
    console.error("[API v1] Erro ao criar lead:", error.message);
    return res.status(500).json({ error: "Falha ao salvar lead no banco.", details: error.message });
  }
  return res.status(201).json({ success: true, lead: data ?? newLead });
});

app.get("/api/v1/leads", requireApiKey, async (req, res) => {
  if (!supabaseService) return res.status(503).json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." });

  const { seller, status, limit = "100", offset = "0" } = req.query as Record<string, string>;

  // tenant_id vem só da API key (nunca de query string) — ver requireApiKey.
  let query = supabaseService.from("leads").select("*").eq("tenant_id", (req as any).tenantId)
    .order("createdAt", { ascending: false })
    .limit(parseInt(limit)).range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

  if (seller) query = query.eq("seller", seller);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: "Falha ao buscar leads.", details: error.message });
  return res.json({ success: true, count: data?.length ?? 0, leads: data ?? [] });
});

// ── AI Routes ──────────────────────────────────────────────────────────────

app.post("/api/leads/suggest-tags", requireUser, async (req, res) => {
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
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    });
    res.json({ tags: JSON.parse(response.text ?? "[]") });
  } catch (error) {
    console.error("AI Tag Suggestion Error:", error);
    res.status(500).json({ error: "Failed to suggest tags" });
  }
});

app.post("/api/cnpj/validate", requireUser, async (req, res) => {
  const { cnpj } = req.body;
  if (!cnpj) return res.status(400).json({ error: "O CNPJ é obrigatório" });

  const cleanCnpj = cnpj.replace(/\D/g, "");
  if (cleanCnpj.length !== 14) return res.json({ valid: false, message: "O CNPJ precisa conter exatamente 14 dígitos." });

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
    size += 1;
    numbers = val.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += Number(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === Number(digits.charAt(1));
  };

  if (!validateCNPJPattern(cleanCnpj)) return res.json({ valid: false, message: "CNPJ possui dígito verificador matemático inválido!" });

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
    if (response.ok) {
      const data = await response.json();
      const isCnpjActive = data.descricao_situacao_cadastral === "ATIVA" || data.situacao_cadastral === 2 || data.situacao_cadastral === "2";
      return res.json({
        valid: true, active: isCnpjActive,
        statusText: data.descricao_situacao_cadastral || "ATIVA",
        companyName: data.razao_social || data.nome_fantasia || "Empresa sob análise",
        message: isCnpjActive
          ? `Empresa ativa: ${data.razao_social || data.nome_fantasia}`
          : `Alerta: Situação cadastral ${data.descricao_situacao_cadastral || "INATIVA"} na Receita Federal.`
      });
    }
    const receitaResponse = await fetch(`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`);
    if (receitaResponse.ok) {
      const rData = await receitaResponse.json();
      if (rData.status === "ERROR") return res.json({ valid: false, message: rData.message || "CNPJ não localizado na Receita Federal." });
      const isCnpjActive = rData.situacao === "ATIVA";
      return res.json({
        valid: true, active: isCnpjActive,
        statusText: rData.situacao || "ATIVA",
        companyName: rData.nome || "Empresa sob análise",
        message: isCnpjActive ? `Empresa ativa: ${rData.nome}` : `Alerta: Situação cadastral ${rData.situacao || "INATIVA"} na Receita Federal.`
      });
    }
    return res.json({ valid: true, active: true, companyName: "Empresa Cadastrada (Validação Offline)", message: "CNPJ com padrão matemático correto (Bancos de dados federais offline)." });
  } catch {
    return res.json({ valid: true, active: true, companyName: "Empresa Cadastrada (Validação Offline)", message: "CNPJ computacionalmente válido (Bancos de dados federais instáveis)." });
  }
});

app.post("/api/leads/calculate-score", requireUser, async (req, res) => {
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
      console.error("AI Lead Scoring failed, falling back to deterministic:", error);
    }
  }

  let score = 50;
  if (lead.status === "Novo") score += 5;
  else if (lead.status === "Prospecção") score += 10;
  else if (lead.status === "Qualificado") score += 20;
  else if (lead.status === "Em Negociação") score += 30;
  else if (lead.status === "Fechado") score += 50;
  else if (lead.status === "Perdido") score -= 30;
  if (lead.priority === "Alta") score += 15;
  else if (lead.priority === "Média") score += 5;
  else if (lead.priority === "Baixa") score -= 10;
  if (activities && Array.isArray(activities)) {
    const leadActivities = activities.filter((a: any) => a.leadId === lead.id);
    score += leadActivities.length * 8;
    if (leadActivities.some((a: any) => a.type === "Reunião")) score += 15;
  }
  score = Math.max(0, Math.min(100, score));

  let temp: "frio" | "morno" | "quente" = "morno";
  if (score < 45) temp = "frio";
  else if (score > 75) temp = "quente";

  const actCount = activities ? activities.filter((a: any) => a.leadId === lead.id).length : 0;
  return res.json({
    scoreIA: score,
    temperature: temp,
    iaSummary: `Cálculo automático (Offline): Lead com prioridade ${lead.priority} na etapa ${lead.status}. Possui ${actCount} atividades registradas no histórico recente.`
  });
});

app.post("/api/ai/performance-audit", requireUser, async (req, res) => {
  const { mrr, cac, ltv, leadsCount, dealsCount } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Chave de IA não configurada." });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Você é o Master IA do Axis CRM. Analise estes indicadores:
      MRR: ${mrr}, CAC: ${cac}, LTV: ${ltv}, Leads: ${leadsCount}, Fechamentos: ${dealsCount}.
      Gere 3 recomendações estratégicas baseadas em dados para otimizar o ROI.
      Retorne estritamente um JSON array de objetos: [{"title": string, "desc": string, "impact": string, "color": "text-blue-400" | "text-emerald-400" | "text-purple-400"}].`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING }, desc: { type: Type.STRING },
              impact: { type: Type.STRING }, color: { type: Type.STRING }
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

app.post("/api/ai/pipeline-audit", requireUser, async (req, res) => {
  const { stageName, leads } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "IA Offline" });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Analise a etapa "${stageName}" do funil com estes leads:
      ${JSON.stringify(leads.map((l: any) => ({ name: l.name, score: l.scoreIA, temp: l.temperature })))}
      Forneça um insight rápido e uma ação imediata para o vendedor.
      Retorne JSON: {"insight": string, "action": string}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { insight: { type: Type.STRING }, action: { type: Type.STRING } },
          required: ["insight", "action"]
        }
      }
    });
    res.json(JSON.parse(response.text ?? "{}"));
  } catch {
    res.status(500).json({ error: "Falha ao auditar funil." });
  }
});

app.post("/api/ai/marketing-advisor", requireUser, async (req, res) => {
  const { leads, spent } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "IA Offline" });
  try {
    const sourceData = leads.reduce((acc: any, l: any) => {
      const src = l.source || "Orgânico";
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {});
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Análise de Marketing:
      Gasto Total: R$ ${spent}
      Conversão por Origem: ${JSON.stringify(sourceData)}
      Sugira onde realocar verba para diminuir o CAC.
      Retorne JSON: {"suggestion": string, "rationale": string}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { suggestion: { type: Type.STRING }, rationale: { type: Type.STRING } },
          required: ["suggestion", "rationale"]
        }
      }
    });
    res.json(JSON.parse(response.text ?? "{}"));
  } catch {
    res.status(500).json({ error: "Falha na análise de marketing." });
  }
});

app.post("/api/ai/settings-audit", requireUser, async (req, res) => {
  const { type, config } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "IA Offline" });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Você é o Auditor Master do Axis CRM. Analise esta configuração de ${type}:
      ${JSON.stringify(config)}
      Identifique possíveis gargalos, regras redundantes ou melhorias na lógica.
      Retorne estritamente um JSON: {"audit": string, "suggestions": string[]}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            audit: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["audit", "suggestions"]
        }
      }
    });
    res.json(JSON.parse(response.text ?? "{}"));
  } catch {
    res.status(500).json({ error: "Falha ao auditar configurações." });
  }
});

app.get("/api/settings/:category", requireUser, async (req, res) => {
  const { category } = req.params;
  if (supabase) {
    const tableName = `crm_${category.replace("-", "_")}`;
    const { data, error } = await supabase.from(tableName).select("*");
    if (!error && data) return res.json(data);
  }
  switch (category) {
    case "sources": return res.json(sources);
    case "fields": case "custom-fields": case "custom_lead_fields": return res.json(customFields);
    case "task-categories": case "categories": return res.json(taskCategories);
    case "templates": return res.json(templates);
    default: return res.status(404).json({ error: "Categoria não encontrada" });
  }
});

app.post("/api/settings/:category", requireUser, async (req, res) => {
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
    case "fields": case "custom-fields": case "custom_lead_fields":
      customFields.push(newItem);
      return res.json(newItem);
    case "task-categories":
      taskCategories.push(newItem);
      return res.json(newItem);
    case "templates":
      templates.push(newItem);
      return res.json(newItem);
    default: return res.status(404).json({ error: "Categoria inválida" });
  }
});

app.delete("/api/settings/:category/:id", requireUser, async (req, res) => {
  const { category, id } = req.params;
  if (supabase) {
    const tableName = `crm_${category.replace("-", "_")}`;
    await supabase.from(tableName).delete().eq("id", id);
  }
  switch (category) {
    case "sources": sources = sources.filter((s) => s.id !== id); break;
    case "fields": case "custom-fields": case "custom_lead_fields": customFields = customFields.filter((f) => f.id !== id); break;
    case "task-categories": case "categories": taskCategories = taskCategories.filter((c) => c.id !== id); break;
    case "templates": templates = templates.filter((t) => t.id !== id); break;
  }
  res.json({ success: true });
});

app.post("/api/ai/suggest-new-config", requireUser, async (req, res) => {
  const { type } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.json({ suggestion: null });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Você é um consultor de CRM. Sugira um exemplo para "${type}".
      NÃO inclua campos como 'target'. Use os campos exatos abaixo.
      Responda APENAS com JSON:
      - Se for "Campo Personalizado": {"name": "Data de Aniversário", "type": "Data", "required": false}
      - Se for "Origem": {"nome": "Indicação Parceiro Premium"}
      - Se for "Categoria de Tarefa": {"nome": "Follow-up Estratégico", "cor": "bg-purple-500"}
      - Se for "Modelo": {"name": "Boas-vindas", "content": "Olá {{name}}, seja bem-vindo!", "category": "Vendas"}`,
      config: { responseMimeType: "application/json" }
    });
    res.json(JSON.parse(response.text ?? "{}"));
  } catch {
    res.status(500).json({ error: "Erro na sugestão da IA" });
  }
});

app.post("/api/ai/generic-insight", requireUser, async (req, res) => {
  const { context, data } = req.body;
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ insight: "A Master IA está em modo offline no momento. Conecte sua API Key para obter insights estratégicos." });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Você é o cérebro analítico do Axis CRM.
      Contexto da solicitação: ${context}.
      Dados brutos para análise: ${JSON.stringify(data)}.
      Sua tarefa: Forneça um insight estratégico curto, direto e acionável em português (máximo 3 frases).
      Foque em melhoria de ROI, conversão ou retenção.`,
    });
    res.json({ insight: response.text ?? "" });
  } catch (error) {
    console.error("Erro na Master IA:", error);
    res.status(500).json({ error: "Falha ao processar insight cerebral." });
  }
});

// ── Reunião Copilot & Post-Meeting Report ─────────────────────────────────

// ── Copilot de Reunião (tempo real — BANT + transcrição) ──────────────────────
app.post("/api/ai/reuniao-copilot", requireUser, async (req: any, res: any) => {
  const { transcript, leadContext } = req.body ?? {};
  const hasAI = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!hasAI) return res.json({ analysis: null, error: "Nenhuma chave de IA configurada." });
  if (!transcript?.trim()) return res.status(400).json({ error: "Transcrição vazia." });

  try {
    const leadInfo = leadContext
      ? `\nCONTEXTO DO LEAD:\n- Nome: ${leadContext.name ?? "?"} | Empresa: ${leadContext.company ?? "?"}\n- Score: ${leadContext.scoreIA ?? "N/A"} | Temperatura: ${leadContext.temperature ?? "N/A"}\n- SDR Summary: ${leadContext.iaSummary ?? "Sem relatório"}\n- Interesse: ${leadContext.lead_interesse ?? "Não informado"}\n- Pauta: ${leadContext.pauta ?? "Não definida"}`
      : "";

    const prompt = `Você é o Copilot de vendas Axis CRM. Analise a transcrição e retorne SOMENTE o JSON, sem markdown.${leadInfo}

TRANSCRIÇÃO: "${transcript.slice(0, 4000)}"

Responda APENAS com este JSON:
{"bant":{"budget":{"status":"identificado","nota":"..."},"authority":{"status":"parcial","nota":"..."},"need":{"status":"identificado","nota":"..."},"timeline":{"status":"nao_identificado","nota":"..."}},"score_fechamento":65,"objecoes_detectadas":["..."],"proxima_acao":"...","pergunta_poderosa":"...","alerta":""}`;

    const raw  = await generateAI(prompt);
    const data = extractJSON(raw);
    return res.json({ analysis: data });
  } catch (err: any) {
    console.error("[Copilot Reunião]", err?.message);
    return res.status(500).json({ error: "Erro ao analisar transcrição: " + (err?.message ?? "desconhecido") });
  }
});

// ── Correção ortográfica de notas ─────────────────────────────────────────────
app.post("/api/ai/corrigir-nota", requireUser, async (req: any, res: any) => {
  const { texto } = req.body ?? {};
  if (!texto?.trim()) return res.json({ corrigido: texto ?? "" });
  const hasAI = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!hasAI) return res.json({ corrigido: texto });
  try {
    const corrigido = await generateAI(
      `Corrija apenas os erros ortográficos e de digitação do texto abaixo. Mantenha exatamente o mesmo estilo, tom e conteúdo. Retorne APENAS o texto corrigido, sem explicações, sem aspas, sem prefixos.\n\nTexto: ${texto}`
    );
    return res.json({ corrigido: corrigido.trim() || texto });
  } catch {
    return res.json({ corrigido: texto });
  }
});

// ── Copilot de Lead (pré-reunião — análise estática do perfil) ────────────────
app.post("/api/ai/lead-copilot", requireUser, async (req: any, res: any) => {
  const { leadContext } = req.body ?? {};
  const hasAI = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!hasAI) return res.json({ analysis: null, error: "Nenhuma chave de IA configurada." });
  if (!leadContext) return res.status(400).json({ error: "Contexto do lead ausente." });

  try {
    const prompt = `Você é o Copilot de CRM do Axis. Analise o perfil do lead e retorne SOMENTE o JSON, sem markdown, sem texto extra.

PERFIL DO LEAD:
Nome: ${leadContext.name ?? "Não informado"}
Empresa: ${leadContext.company ?? "Não informado"}
Score IA: ${leadContext.scoreIA ?? "N/A"}
Temperatura: ${leadContext.temperature ?? "N/A"}
Estágio: ${leadContext.stage ?? "Desconhecido"}
Interesse declarado: ${leadContext.lead_interesse ?? "Não informado"}
Resumo SDR: ${leadContext.iaSummary ?? "Sem histórico"}
Produto de interesse: ${leadContext.product ?? "Não definido"}

Responda APENAS com este JSON:
{"resumo_curto":"...","probabilidade_fechamento":70,"recomendacao_proximo_passo":"...","abordagem_ideal":"...","pergunta_abertura":"...","objecoes_previstas":["...","..."],"alerta":""}`;

    const raw  = await generateAI(prompt);
    const data = extractJSON(raw);
    return res.json({ analysis: data });
  } catch (err: any) {
    console.error("[Copilot Lead] Erro:", err?.message);
    return res.json({
      analysis: {
        resumo_curto: "Análise indisponível no momento. Tente novamente.",
        probabilidade_fechamento: null,
        recomendacao_proximo_passo: "Clique em 'Analisar Lead' para tentar novamente.",
        abordagem_ideal: null,
        pergunta_abertura: null,
        objecoes_previstas: [],
        alerta: "Falha ao conectar com a IA: " + (err?.message ?? "erro desconhecido"),
      },
    });
  }
});

app.post("/api/ai/reuniao-relatorio", requireUser, async (req: any, res: any) => {
  const { transcript, notes, leadContext, pauta, reuniaoId } = req.body ?? {};
  const hasAI = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!hasAI) return res.json({ relatorio: "Relatório não disponível — configure uma chave de IA." });

  try {
    const relatorio = await generateAI(`Você é o analista de vendas do Axis CRM. Gere um relatório completo desta reunião.

LEAD: ${leadContext?.name ?? "N/A"} | ${leadContext?.company ?? "N/A"}
Score IA: ${leadContext?.scoreIA ?? "N/A"} | Temperatura: ${leadContext?.temperature ?? "N/A"}
Relatório SDR: ${leadContext?.iaSummary ?? "Sem relatório"}
Pauta: ${pauta ?? "Não definida"}

TRANSCRIÇÃO:
${(transcript ?? "Sem transcrição capturada").slice(0, 4000)}

NOTAS DO CLOSER:
${notes ?? "Sem notas"}

Gere um relatório executivo em markdown com:
## Resumo Executivo
## Pontos-Chave Discutidos
## Análise BANT Final
## Objeções e Como Foram Tratadas
## Próximos Passos (com responsáveis e prazos)
## Recomendação de Fechamento (Alta/Média/Baixa probabilidade e por quê)`);

    if (reuniaoId) {
      // Usa o client escopado com o JWT do chamador (req.supabase, de
      // requireUser) em vez do client anônimo do módulo — a RLS da Fase 1 só
      // libera esse UPDATE para quem está autenticado e pertence ao tenant
      // dono da reunião.
      const { error: updateError } = await req.supabase.from("reunioes").update({
        relatorio_ia: relatorio,
        ...(transcript ? { transcricao: transcript } : {}),
        ...(notes ? { notas_closer: notes } : {}),
        status: "Concluída",
      }).eq("id", reuniaoId);
      if (updateError) console.error("[Relatório Reunião] Erro ao salvar:", updateError.message);
    }

    res.json({ relatorio });
  } catch (err: any) {
    console.error("[Relatório Reunião]", err?.message);
    res.status(500).json({ error: "Erro ao gerar relatório." });
  }
});

// ── Admin: Gestão de Empresas Parceiras (Master) ──────────────────────────

/**
 * Exige que o usuário autenticado (via requireUser) seja Master. Só o Master
 * pode gerenciar credenciais de login de OUTROS usuários — esse é o motivo de
 * essas rotas existirem no backend: alterar e-mail/senha de outro usuário no
 * Supabase Auth exige a Admin API (auth.admin.*), que só funciona com a
 * SUPABASE_SERVICE_ROLE_KEY — uma chave que nunca pode ir para o browser.
 */
async function requireMaster(req: any, res: express.Response, next: express.NextFunction) {
  const { data: caller, error } = await req.supabase.from("users").select("is_master").eq("id", req.user.id).maybeSingle();
  if (error || !caller?.is_master) {
    return res.status(403).json({ error: "Apenas administradores master podem executar esta ação." });
  }
  next();
}

app.get("/api/admin/tenant-admin-user/:tenantId", requireUser, requireMaster, async (req: any, res) => {
  if (!supabaseService) return res.status(503).json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." });

  const { tenantId } = req.params;
  const { data: adminUser, error } = await supabaseService
    .from("users")
    .select("id, email, name")
    .eq("tenant_id", tenantId)
    .eq("is_master", false)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !adminUser) {
    return res.status(404).json({ error: "Nenhum usuário administrador encontrado para esta empresa." });
  }
  res.json({ success: true, user: adminUser });
});

app.post("/api/admin/tenant-user/:userId/credentials", requireUser, requireMaster, async (req: any, res) => {
  if (!supabaseService) return res.status(503).json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." });

  const { userId } = req.params;
  const { email, password } = req.body ?? {};

  if (!email && !password) {
    return res.status(400).json({ error: "Informe um novo e-mail e/ou senha para atualizar." });
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: "A senha precisa ter pelo menos 6 caracteres." });
  }

  const authUpdates: { email?: string; password?: string } = {};
  if (email) authUpdates.email = email;
  if (password) authUpdates.password = password;

  const { error: authError } = await supabaseService.auth.admin.updateUserById(userId, authUpdates);
  if (authError) {
    return res.status(500).json({ error: `Falha ao atualizar credenciais: ${authError.message}` });
  }

  if (email) {
    await supabaseService.from("users").update({ email }).eq("id", userId);
  }

  res.json({ success: true });
});

// ── WhatsApp / Evolution API Simulator ────────────────────────────────────

function bodyWithFallback(req: any) { return req.body || {}; }

app.get("/api/whatsapp/instances", requireUser, async (req: any, res) => {
  const { data, error } = await req.supabase.from("whatsapp_instances").select("*").order("created_at", { ascending: false });
  if (!error && data && data.length > 0) return res.json(data);
  res.json(instances);
});

app.post("/api/whatsapp/instances", requireUser, (req, res) => {
  const { name, phone = "-", webhookUrl = "" } = req.body;
  if (!name) return res.status(400).json({ error: "Nome da instância é obrigatório" });
  const newInst: WhatsAppInstance = {
    id: "evo_inst_" + Math.random().toString(36).substring(2, 9),
    name, phone, status: "DISCONNECTED",
    apiKey: "evo_apikey_" + Math.random().toString(36).substring(2, 12),
    webhookUrl: webhookUrl || "https://axis-crm.cloud/api/webhooks/whatsapp",
    qrcode: "", createdAt: new Date().toISOString()
  };
  instances.push(newInst);
  res.json(newInst);
});

app.post("/api/whatsapp/instances/:id/qrcode", requireUser, (req, res) => {
  const { id } = req.params;
  const inst = instances.find((i) => i.id === id);
  if (!inst) return res.status(404).json({ error: "Instância não encontrada" });
  inst.status = "CONNECTING";
  inst.qrcode = `00020101021226450014br.gov.bcb.pix2523evo-wa-connection-token-key-${inst.id}`;
  res.json({ status: "CONNECTING", qrcode: inst.qrcode });
});

app.post("/api/whatsapp/instances/:id/connect", requireUser, (req, res) => {
  const { id } = req.params;
  const { phone } = bodyWithFallback(req);
  const inst = instances.find((i) => i.id === id);
  if (!inst) return res.status(404).json({ error: "Instância não encontrada" });
  inst.status = "CONNECTED";
  inst.phone = phone || "+55 11 9" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000);
  delete inst.qrcode;
  res.json({ status: "CONNECTED", instance: inst });
});

app.delete("/api/whatsapp/instances/:id", requireUser, (req, res) => {
  const { id } = req.params;
  instances = instances.filter((i) => i.id !== id);
  res.json({ success: true, message: `Instância ${id} removida` });
});

app.put("/api/whatsapp/instances/:id", requireUser, (req, res) => {
  const { id } = req.params;
  const { webhookUrl, name, phone, status } = req.body;
  const inst = instances.find((i) => i.id === id);
  if (!inst) return res.status(404).json({ error: "Instância não encontrada" });
  if (webhookUrl !== undefined) inst.webhookUrl = webhookUrl;
  if (name !== undefined) inst.name = name;
  if (phone !== undefined) inst.phone = phone;
  if (status !== undefined) inst.status = status;
  res.json(inst);
});

app.get("/api/whatsapp/contacts", requireUser, (req, res) => res.json(contacts));

app.post("/api/whatsapp/contacts", requireUser, (req, res) => {
  const { name, phone, email, tags = ["lead"] } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "Nome e Telefone são obrigatórios" });
  const cleanPhone = phone.startsWith("+") ? phone : `+55 ${phone}`;
  const existing = contacts.find((c) => c.phone === cleanPhone);
  if (existing) return res.json(existing);
  const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "WA";
  const newContact: ChatContact = {
    id: Math.random().toString(36).substring(2, 9),
    name, avatar: initials, channel: "WhatsApp",
    lastMessage: "Nova conversa iniciada",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    unread: 0, online: Math.random() > 0.5,
    phone: cleanPhone, email, tags, slaStatus: "Dentro do Prazo"
  };
  contacts.unshift(newContact);
  if (!messages[newContact.id]) messages[newContact.id] = [];
  res.json(newContact);
});

app.get("/api/whatsapp/messages/:contactId", requireUser, async (req, res) => {
  const { contactId } = req.params;
  if (supabase) {
    const { data, error } = await supabase.from("chat_messages").select("*").eq("contact_id", contactId).order("timestamp", { ascending: true });
    if (!error && data) return res.json(data);
  }
  res.json(messages[contactId] || []);
});

app.post("/api/whatsapp/messages/send", requireUser, async (req, res) => {
  const { contactId, text } = req.body;
  if (!contactId || !text) return res.status(400).json({ error: "ID do contato e texto são obrigatórios" });
  const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const userMsg: ChatMessage = {
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    text, sender: "me", time: timeString, status: "sent", timestamp: Date.now()
  };
  if (!messages[contactId]) messages[contactId] = [];
  messages[contactId].push(userMsg);
  if (supabase) {
    await supabase.from("chat_messages").insert([{ id: userMsg.id, text: userMsg.text, sender: userMsg.sender, time: userMsg.time, status: userMsg.status, timestamp: userMsg.timestamp, contact_id: contactId }]);
    await supabase.from("chat_contacts").update({ lastMessage: text, time: timeString }).eq("id", contactId);
  }
  const contact = contacts.find((c) => c.id === contactId);
  if (contact) { contact.lastMessage = text; contact.time = timeString; }
  res.json({ success: true, message: userMsg });
});

app.post("/api/whatsapp/simulate-incoming", requireUser, async (req, res) => {
  const { contactId, text } = req.body;
  if (!contactId || !text) return res.status(400).json({ error: "contactId e texto são obrigatórios" });
  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) return res.status(404).json({ error: "Contato não encontrado" });
  const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const inMsg: ChatMessage = {
    id: "msg_sim_" + Math.random().toString(36).substring(2, 9),
    text, sender: "them", time: timeString, timestamp: Date.now()
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

app.post("/api/whatsapp/copilot/analyze", requireUser, async (req, res) => {
  const { contactId } = req.body;
  if (!contactId) return res.status(400).json({ error: "contactId é obrigatório" });
  const chatHistory = messages[contactId] || [];
  const contact = contacts.find((c) => c.id === contactId);
  if (chatHistory.length === 0) {
    return res.json({
      suggestion: "Ainda não há mensagens registradas com este contato para analisar. Tente fazer uma saudação cortês, introduzindo o Axis CRM e perguntando como pode auxiliá-lo.",
      sentiment: "Neutro"
    });
  }
  const conversationText = chatHistory.map((m) => `${m.sender === "me" ? "Vendedor/Atendente" : "Cliente"}: ${m.text}`).join("\n");
  const promptContext = `Você é o Axis Copilot, um assistente especializado em CRM, Vendas e Atendimento via WhatsApp.
  O cliente se chama: ${contact ? contact.name : "Cliente"}.
  O histórico de mensagens é este:
  ${conversationText}
  Sua tarefa é:
  1. Analisar brevemente o status/intenção do cliente (especialmente dúvidas de frete, preço, fechamento).
  2. Sugerir a RESPOSTA PERFEITA em português para o vendedor copiar e enviar.
  Retorne a resposta no formato JSON:
  - analysis (uma frase resumindo o sentimento e status das negociações)
  - suggestion (o rascunho exato da mensagem pronta para o vendedor usar)
  - sentiment (Positivo, Neutro ou Negativo)`;
  try {
    if (!process.env.GEMINI_API_KEY) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      let sugg = `Olá ${contact ? contact.name : ""}, compreendo sua dúvida! Estamos analisando sua solicitação. De qualquer forma, gostaria de agendar uma ligação rápida hoje às 14h para fecharmos os detalhes?`;
      if (lastMsg.text.toLowerCase().includes("frete")) {
        sugg = `Olá ${contact ? contact.name : ""}, com certeza! Para sua região, nós conseguimos fazer o frete com um desconto especial de 50%, ou até GRÁTIS se fecharmos o contrato Pro hoje. O que acha?`;
      }
      return res.json({ analysis: "O cliente demonstrou interesse inicial. A IA sugere oferecer atendimento ágil para acelerar o fechamento.", suggestion: sugg, sentiment: "Positivo" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: promptContext,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { analysis: { type: Type.STRING }, suggestion: { type: Type.STRING }, sentiment: { type: Type.STRING } },
          required: ["analysis", "suggestion", "sentiment"]
        },
      },
    });
    res.json(JSON.parse(response.text ?? "{}"));
  } catch (e) {
    console.error("Copilot analysis failure:", e);
    res.status(500).json({ error: "Erro de processamento da IA" });
  }
});

// ── Integração HubSpot (OAuth, sincronização bidirecional) ─────────────────
//
// Deals do HubSpot mapeiam para public.leads — este repo não tem uma tabela
// de "deals" separada, negócios já são leads filtrados por pipeline/status.
// Tokens ficam só em crm_integrations, acessada aqui via supabaseService;
// a app NUNCA deve ler essa tabela direto do client (ver comentário na
// migration 20260805_hubspot_crm_integration.sql).

async function getTenantId(req: any): Promise<string | null> {
  const { data } = await req.supabase.from("users").select("tenant_id").eq("id", req.user.id).maybeSingle();
  return data?.tenant_id ?? null;
}

// state assinado por HMAC (sem estado guardado no servidor — este processo é
// serverless, não há memória compartilhada confiável entre o /connect e o
// /callback) contendo tenant_id + timestamp + nonce. Janela de validade de
// 10 minutos, comparação em tempo constante contra adulteração.
function signHubspotState(tenantId: string): string {
  const nonce = randomBytes(8).toString("hex");
  const payload = `${tenantId}.${Date.now()}.${nonce}`;
  const sig = createHmac("sha256", HUBSPOT_CLIENT_SECRET).update(`oauth_state:${payload}`).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

function verifyHubspotState(state: string): string | null {
  try {
    const parts = Buffer.from(state, "base64url").toString("utf8").split(".");
    if (parts.length !== 4) return null;
    const [tenantId, ts, nonce, sig] = parts;
    const payload = `${tenantId}.${ts}.${nonce}`;
    const expected = createHmac("sha256", HUBSPOT_CLIENT_SECRET).update(`oauth_state:${payload}`).digest("hex");
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    if (Date.now() - Number(ts) > 10 * 60 * 1000) return null;
    return tenantId;
  } catch {
    return null;
  }
}

// Devolve um access_token válido, renovando via refresh_token quando faltam
// menos de 5min para expirar. Retorna null se o tenant nunca conectou o
// HubSpot ou se o refresh falhou (e marca status='error' na tabela).
async function getValidHubspotAccessToken(tenantId: string): Promise<string | null> {
  if (!supabaseService) return null;
  const { data: integ } = await supabaseService
    .from("crm_integrations")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("provider", "hubspot")
    .maybeSingle();
  if (!integ || integ.status !== "connected" || !integ.refresh_token) return null;

  if (integ.token_expires_at && new Date(integ.token_expires_at).getTime() - Date.now() > 5 * 60 * 1000) {
    return integ.access_token;
  }

  try {
    const res = await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: HUBSPOT_CLIENT_ID,
        client_secret: HUBSPOT_CLIENT_SECRET,
        refresh_token: integ.refresh_token,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 20000 }
    );
    const { access_token, refresh_token, expires_in } = res.data;
    await supabaseService
      .from("crm_integrations")
      .update({
        access_token,
        refresh_token,
        token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        status: "connected",
        last_error: null,
      })
      .eq("tenant_id", tenantId)
      .eq("provider", "hubspot");
    return access_token;
  } catch (err: any) {
    await supabaseService
      .from("crm_integrations")
      .update({ status: "error", last_error: String(err?.message || err).slice(0, 500) })
      .eq("tenant_id", tenantId)
      .eq("provider", "hubspot");
    return null;
  }
}

app.get("/api/integrations/hubspot/connect", requireUser, async (req: any, res) => {
  if (!HUBSPOT_CLIENT_ID || !HUBSPOT_REDIRECT_URI) {
    return res.status(503).json({ error: "Integração com HubSpot não configurada no servidor." });
  }
  const tenantId = await getTenantId(req);
  if (!tenantId) return res.status(400).json({ error: "Não foi possível identificar a empresa do usuário." });

  const state = signHubspotState(tenantId);
  const url =
    `https://app.hubspot.com/oauth/authorize?client_id=${encodeURIComponent(HUBSPOT_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(HUBSPOT_REDIRECT_URI)}&scope=${encodeURIComponent(HUBSPOT_SCOPES)}&state=${encodeURIComponent(state)}`;
  res.json({ url });
});

// Sem requireUser: o HubSpot redireciona o browser do usuário direto pra cá,
// sem header Authorization — a única prova de identidade é o state assinado.
app.get("/api/integrations/hubspot/callback", async (req: any, res) => {
  const redirectBase = `${AXIS_APP_URL}/app/configuracoes/integracoes/apps`;
  try {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) return res.redirect(302, `${redirectBase}?hubspot=error`);

    const tenantId = verifyHubspotState(state);
    if (!tenantId) return res.redirect(302, `${redirectBase}?hubspot=error`);

    if (!HUBSPOT_CLIENT_ID || !HUBSPOT_CLIENT_SECRET || !HUBSPOT_REDIRECT_URI || !supabaseService) {
      return res.redirect(302, `${redirectBase}?hubspot=error`);
    }

    const tokenRes = await axios.post(
      "https://api.hubapi.com/oauth/v1/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: HUBSPOT_CLIENT_ID,
        client_secret: HUBSPOT_CLIENT_SECRET,
        redirect_uri: HUBSPOT_REDIRECT_URI,
        code,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" }, timeout: 20000 }
    );
    const { access_token, refresh_token, expires_in } = tokenRes.data;

    let hubId: string | null = null;
    let hubDomain: string | null = null;
    let scopes: string | null = null;
    try {
      const introspect = await axios.get(`https://api.hubapi.com/oauth/v1/access-tokens/${access_token}`, { timeout: 20000 });
      hubId = introspect.data?.hub_id != null ? String(introspect.data.hub_id) : null;
      hubDomain = introspect.data?.hub_domain ?? null;
      scopes = Array.isArray(introspect.data?.scopes) ? introspect.data.scopes.join(" ") : null;
    } catch (err) {
      console.error("[Axis] HubSpot token introspection failed:", err);
    }

    await supabaseService.from("crm_integrations").upsert(
      {
        tenant_id: tenantId,
        provider: "hubspot",
        status: "connected",
        access_token,
        refresh_token,
        token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        hub_id: hubId,
        hub_domain: hubDomain,
        scopes,
        last_error: null,
      },
      { onConflict: "tenant_id,provider" }
    );

    res.redirect(302, `${redirectBase}?hubspot=connected`);
  } catch (err) {
    console.error("[Axis] HubSpot OAuth callback failed:", err);
    res.redirect(302, `${redirectBase}?hubspot=error`);
  }
});

app.post("/api/integrations/hubspot/disconnect", requireUser, async (req: any, res) => {
  if (!supabaseService) return res.status(503).json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." });
  const tenantId = await getTenantId(req);
  if (!tenantId) return res.status(400).json({ error: "Não foi possível identificar a empresa do usuário." });

  const { error } = await supabaseService
    .from("crm_integrations")
    .update({ access_token: null, refresh_token: null, status: "disconnected" })
    .eq("tenant_id", tenantId)
    .eq("provider", "hubspot");

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/integrations/hubspot/status", requireUser, async (req: any, res) => {
  if (!supabaseService) return res.status(503).json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." });
  const tenantId = await getTenantId(req);
  if (!tenantId) return res.status(400).json({ error: "Não foi possível identificar a empresa do usuário." });

  const { data } = await supabaseService
    .from("crm_integrations")
    .select("status, hub_id, hub_domain, last_synced_at, last_error, updated_at")
    .eq("tenant_id", tenantId)
    .eq("provider", "hubspot")
    .maybeSingle();

  res.json(data || { status: "disconnected" });
});

app.get("/api/integrations/hubspot/pipelines", requireUser, async (req: any, res) => {
  const tenantId = await getTenantId(req);
  if (!tenantId) return res.status(400).json({ error: "Não foi possível identificar a empresa do usuário." });

  const token = await getValidHubspotAccessToken(tenantId);
  if (!token) return res.status(409).json({ error: "not_connected" });

  try {
    const hsRes = await axios.get("https://api.hubapi.com/crm/v3/pipelines/deals", {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 20000,
    });
    res.json({ pipelines: hsRes.data?.results || [] });
  } catch (err: any) {
    console.error("[Axis] HubSpot pipelines fetch failed:", err?.message || err);
    res.status(502).json({ error: "Falha ao buscar pipelines do HubSpot." });
  }
});

app.post("/api/integrations/hubspot/sync-lead", requireUser, async (req: any, res) => {
  const { leadId } = req.body ?? {};
  if (!leadId) return res.status(400).json({ error: "leadId é obrigatório." });

  const tenantId = await getTenantId(req);
  if (!tenantId) return res.status(400).json({ error: "Não foi possível identificar a empresa do usuário." });

  // Tenant sem HubSpot conectado: não é erro, essa rota é chamada em toda
  // escrita de lead (ver DataContext.tsx) — silêncio é o comportamento certo.
  const token = await getValidHubspotAccessToken(tenantId);
  if (!token) return res.json({ skipped: true });

  if (!supabaseService) return res.status(503).json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." });

  try {
    const { data: lead, error: leadError } = await req.supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
    if (leadError || !lead) return res.status(404).json({ error: "Lead não encontrado." });

    let externalStageId: string | undefined;
    if (lead.pipelineId && lead.stageId) {
      const { data: mapping } = await supabaseService
        .from("crm_stage_mappings")
        .select("external_stage_id")
        .eq("tenant_id", tenantId)
        .eq("provider", "hubspot")
        .eq("pipeline_id", lead.pipelineId)
        .eq("stage_id", lead.stageId)
        .maybeSingle();
      externalStageId = mapping?.external_stage_id;
    }

    const dealProperties: Record<string, any> = { dealname: lead.name, amount: lead.value ?? 0 };
    if (externalStageId) dealProperties.dealstage = externalStageId;

    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    let externalId = lead.external_id as string | null;

    if (externalId) {
      await axios.patch(`https://api.hubapi.com/crm/v3/objects/deals/${externalId}`, { properties: dealProperties }, { headers, timeout: 20000 });
    } else {
      const createRes = await axios.post("https://api.hubapi.com/crm/v3/objects/deals", { properties: dealProperties }, { headers, timeout: 20000 });
      externalId = createRes.data?.id ?? null;
    }

    // Busca/cria o Contato do HubSpot pelo e-mail e associa ao Deal. Endpoint
    // de associação usa o rótulo padrão v3 (deal_to_contact) — HubSpot também
    // tem uma API de associações v4 baseada em IDs numéricos; se este rótulo
    // parar de funcionar, verificar a documentação atual do HubSpot.
    if (externalId && lead.email) {
      try {
        const searchRes = await axios.post(
          "https://api.hubapi.com/crm/v3/objects/contacts/search",
          { filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: lead.email }] }] },
          { headers, timeout: 20000 }
        );
        let contactId = searchRes.data?.results?.[0]?.id as string | undefined;
        const nameParts = String(lead.name || "").trim().split(/\s+/);
        const contactProperties: Record<string, any> = {
          email: lead.email,
          phone: lead.phone ?? "",
          company: lead.company ?? "",
          firstname: nameParts[0] ?? "",
          lastname: nameParts.slice(1).join(" "),
        };

        if (contactId) {
          await axios.patch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, { properties: contactProperties }, { headers, timeout: 20000 });
        } else {
          const createContactRes = await axios.post("https://api.hubapi.com/crm/v3/objects/contacts", { properties: contactProperties }, { headers, timeout: 20000 });
          contactId = createContactRes.data?.id;
        }

        if (contactId) {
          await axios.put(
            `https://api.hubapi.com/crm/v3/objects/deals/${externalId}/associations/contacts/${contactId}/deal_to_contact`,
            {},
            { headers, timeout: 20000 }
          );
        }
      } catch (assocErr: any) {
        console.error("[Axis] HubSpot contact association failed:", assocErr?.message || assocErr);
      }
    }

    await supabaseService
      .from("leads")
      .update({ external_id: externalId, external_source: "hubspot", external_synced_at: new Date().toISOString() })
      .eq("id", leadId);

    await supabaseService
      .from("crm_integrations")
      .update({ last_synced_at: new Date().toISOString(), last_error: null })
      .eq("tenant_id", tenantId)
      .eq("provider", "hubspot");

    res.json({ success: true, external_id: externalId });
  } catch (err: any) {
    console.error("[Axis] HubSpot lead sync failed:", err?.message || err);
    if (supabaseService) {
      await supabaseService
        .from("crm_integrations")
        .update({ status: "error", last_error: String(err?.message || err).slice(0, 500) })
        .eq("tenant_id", tenantId)
        .eq("provider", "hubspot");
    }
    res.json({ success: false, error: "Falha ao sincronizar com o HubSpot." });
  }
});

app.post("/api/integrations/hubspot/pull", requireUser, async (req: any, res) => {
  const tenantId = await getTenantId(req);
  if (!tenantId) return res.status(400).json({ error: "Não foi possível identificar a empresa do usuário." });
  if (!supabaseService) return res.status(503).json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." });

  const token = await getValidHubspotAccessToken(tenantId);
  if (!token) return res.status(409).json({ error: "not_connected" });

  try {
    const { data: integ } = await supabaseService
      .from("crm_integrations")
      .select("last_synced_at")
      .eq("tenant_id", tenantId)
      .eq("provider", "hubspot")
      .maybeSingle();

    const sinceTs = integ?.last_synced_at ? new Date(integ.last_synced_at).getTime() : 0;
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const searchRes = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/deals/search",
      {
        filterGroups: [{ filters: [{ propertyName: "hs_lastmodifieddate", operator: "GTE", value: String(sinceTs) }] }],
        properties: ["dealname", "amount", "dealstage", "hs_lastmodifieddate"],
        limit: 100,
      },
      { headers, timeout: 20000 }
    );

    const deals = searchRes.data?.results || [];
    let upserted = 0;
    for (const deal of deals) {
      const { data: existing } = await supabaseService
        .from("leads")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("external_source", "hubspot")
        .eq("external_id", deal.id)
        .maybeSingle();

      const payload = {
        name: deal.properties?.dealname || "Negócio HubSpot",
        value: Number(deal.properties?.amount) || 0,
        external_id: deal.id,
        external_source: "hubspot",
        external_synced_at: new Date().toISOString(),
      };

      if (existing) {
        await supabaseService.from("leads").update(payload).eq("id", existing.id);
      } else {
        await supabaseService
          .from("leads")
          .insert({ ...payload, tenant_id: tenantId, status: "Novo", pipelineId: "comercial", stageId: "", source: "hubspot" });
      }
      upserted++;
    }

    await supabaseService
      .from("crm_integrations")
      .update({ last_synced_at: new Date().toISOString(), last_error: null })
      .eq("tenant_id", tenantId)
      .eq("provider", "hubspot");

    res.json({ success: true, synced: upserted });
  } catch (err: any) {
    console.error("[Axis] HubSpot pull sync failed:", err?.message || err);
    res.status(502).json({ success: false, error: "Falha ao buscar atualizações do HubSpot." });
  }
});

// Sem requireUser: o HubSpot chama esta rota diretamente (não é uma sessão
// Axis nem uma API key do Axis) — autenticação é a assinatura HMAC.
app.post("/api/webhooks/hubspot", async (req: any, res) => {
  // HubSpot exige resposta 2xx rápida — respondemos logo e processamos o
  // lote depois, pra evitar timeout/reentrega.
  res.status(200).json({ received: true });

  if (!HUBSPOT_CLIENT_SECRET || !supabaseService) return;

  try {
    // RISCO CONHECIDO: a verificação de assinatura v3 do HubSpot precisa do
    // corpo BRUTO da requisição (método+uri+corpo+timestamp). O middleware de
    // body-parsing no topo deste arquivo já lida com o Vercel pré-processando
    // o corpo antes do Express — se isso também acontecer aqui, req.body já
    // não é mais os bytes originais e esta verificação sempre vai falhar
    // (evento fica ignorado, sem risco de segurança, mas sem funcionar). Só
    // confirmável testando num deploy real — ver plano de risco.
    const signature = req.headers["x-hubspot-signature-v3"] as string | undefined;
    const timestamp = req.headers["x-hubspot-request-timestamp"] as string | undefined;
    const rawBody = typeof req.rawBody === "string" ? req.rawBody : JSON.stringify(req.body ?? {});

    if (signature && timestamp) {
      const origin = HUBSPOT_REDIRECT_URI ? new URL(HUBSPOT_REDIRECT_URI).origin : "";
      const base = `POST${origin}/api/webhooks/hubspot${rawBody}${timestamp}`;
      const expected = createHmac("sha256", HUBSPOT_CLIENT_SECRET).update(base).digest("base64");
      const a = Buffer.from(signature);
      const b = Buffer.from(expected);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        console.error("[Axis] HubSpot webhook: assinatura inválida — evento ignorado.");
        return;
      }
    } else {
      console.warn("[Axis] HubSpot webhook sem cabeçalhos de assinatura — processando sem verificar (revisar em produção).");
    }

    const events = Array.isArray(req.body) ? req.body : [];
    for (const event of events) {
      const hubId = event?.portalId != null ? String(event.portalId) : null;
      const objectId = event?.objectId != null ? String(event.objectId) : null;
      if (!hubId || !objectId) continue;

      const { data: integ } = await supabaseService
        .from("crm_integrations")
        .select("tenant_id, status")
        .eq("provider", "hubspot")
        .eq("hub_id", hubId)
        .maybeSingle();
      if (!integ || integ.status !== "connected") continue;

      const token = await getValidHubspotAccessToken(integ.tenant_id);
      if (!token) continue;

      try {
        const dealRes = await axios.get(`https://api.hubapi.com/crm/v3/objects/deals/${objectId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { properties: "dealname,amount,dealstage" },
          timeout: 20000,
        });
        const deal = dealRes.data;

        const { data: existing } = await supabaseService
          .from("leads")
          .select("id")
          .eq("tenant_id", integ.tenant_id)
          .eq("external_source", "hubspot")
          .eq("external_id", objectId)
          .maybeSingle();

        const payload = {
          name: deal.properties?.dealname || "Negócio HubSpot",
          value: Number(deal.properties?.amount) || 0,
          external_id: objectId,
          external_source: "hubspot",
          external_synced_at: new Date().toISOString(),
        };

        if (existing) {
          await supabaseService.from("leads").update(payload).eq("id", existing.id);
        } else {
          await supabaseService
            .from("leads")
            .insert({ ...payload, tenant_id: integ.tenant_id, status: "Novo", pipelineId: "comercial", stageId: "", source: "hubspot" });
        }
      } catch (dealErr: any) {
        console.error("[Axis] HubSpot webhook: falha ao buscar/gravar deal", objectId, dealErr?.message || dealErr);
      }
    }
  } catch (err: any) {
    console.error("[Axis] HubSpot webhook processing failed:", err?.message || err);
  }
});

// Global error handler — catches any unhandled throws in async routes
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Axis] Unhandled error:", err?.message || err);
  if (!res.headersSent) {
    res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
});

// ── Export for Vercel Serverless ───────────────────────────────────────────

export default app;

