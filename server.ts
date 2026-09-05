// Carrega .env/.env.local pro process.env — nada fazia isso antes (dotenv era dependência mas
// nunca era importado), então qualquer variável só-arquivo (ex: AURORA_WEBHOOK_URL) sempre esteve
// vazia em dev local. Em produção (Vercel) isso é um no-op inofensivo, já que as variáveis já
// chegam injetadas de verdade no processo.
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
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
//
// instances/contacts/messages do simulador de WhatsApp eram arrays únicos e
// globais no processo — sem tenant_id, qualquer usuário autenticado de
// QUALQUER tenant via essas mesmas instâncias/contatos/mensagens simuladas de
// outro tenant. Agora seguem o mesmo padrão já usado logo abaixo pra
// sources/customFields/etc. (tenantBucket): um bucket por tenant, resolvido
// via current_tenant_id() (RPC, roda com a sessão real do chamador).

const DEFAULT_INSTANCES: WhatsAppInstance[] = [
  {
    id: "evo_inst_1",
    name: "S.P.Y. Produção",
    phone: "+55 11 98888-7777",
    status: "CONNECTED",
    apiKey: "4dfg23-evoapikey-99e2-spy",
    webhookUrl: "https://spy-crm.cloud/api/webhooks/whatsapp",
    createdAt: "2026-05-10T12:00:00Z"
  }
];

const instancesByTenant: Record<string, WhatsAppInstance[]> = {};
const contactsByTenant: Record<string, ChatContact[]> = {};
const messagesByTenant: Record<string, Record<string, ChatMessage[]>> = {};

function tenantMessages(tenantId: string): Record<string, ChatMessage[]> {
  if (!messagesByTenant[tenantId]) messagesByTenant[tenantId] = {};
  return messagesByTenant[tenantId];
}

// Fallback in-memory de /api/settings/:category para quando não há tabela
// crm_<categoria> no banco (sources/custom-fields/task-categories/templates
// nunca tiveram tabela própria). Isolado por tenant abaixo — antes disso eram
// arrays únicos no processo, então tenant A criando um campo customizado
// aparecia instantaneamente pra tenant B (todo mundo lia/escrevia o mesmo
// array). Cada tenant recebe sua própria cópia, semeada a partir do exemplo
// padrão na primeira vez que é acessado.
const DEFAULT_SOURCES = [
  { id: "1", name: "Instagram" },
  { id: "2", name: "WhatsApp" },
  { id: "3", name: "Indicação" },
  { id: "4", name: "Site" },
  { id: "5", name: "Google Ads" }
];
const DEFAULT_CUSTOM_FIELDS = [
  { id: "1", label: "CPF/CNPJ", type: "text", required: true },
  { id: "2", label: "Setor", type: "select", options: ["Varejo", "Serviços", "Indústria"] }
];
const DEFAULT_TASK_CATEGORIES = [
  { id: "1", name: "Follow-up", color: "bg-blue-500" },
  { id: "2", name: "Reunião", color: "purple" },
  { id: "3", name: "Proposta", color: "emerald" }
];
const DEFAULT_TEMPLATES = [
  { id: "1", name: "Saudação Inicial", content: "Olá {{name}}, como posso ajudar?", category: "Vendas" }
];

const sourcesByTenant: Record<string, any[]> = {};
const customFieldsByTenant: Record<string, any[]> = {};
const taskCategoriesByTenant: Record<string, any[]> = {};
const templatesByTenant: Record<string, any[]> = {};

function tenantBucket<T>(store: Record<string, T[]>, tenantId: string, seed: T[]): T[] {
  if (!store[tenantId]) store[tenantId] = structuredClone(seed);
  return store[tenantId];
}

// ── Singletons ─────────────────────────────────────────────────────────────

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

// createClient lança de forma síncrona se a URL vier malformada (espaço extra,
// protocolo faltando etc.) — sem o try/catch, isso derruba o módulo inteiro no
// carregamento e TODA rota da API vira FUNCTION_INVOCATION_FAILED no Vercel, não
// só as que usam Supabase. Preferimos degradar para null (rotas já checam
// `if (!supabase)`) a derrubar o servidor inteiro por uma env var ruim.
function safeCreateClient(url: string, key: string) {
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch (err: any) {
    console.error("[Supabase] Falha ao criar client:", err?.message);
    return null;
  }
}

const supabase = safeCreateClient(supabaseUrl, supabaseKey);

// Client privilegiado (bypassa RLS) — uso restrito à rota /api/v1/leads, que é
// chamada por integrações externas (não por um usuário logado no S.P.Y.) e por
// isso não tem um JWT de sessão para respeitar a RLS normalmente. O tenant_id
// usado nessas chamadas vem só do mapeamento de API key (apiKeyTenantMap),
// nunca do corpo da requisição — é isso que mantém o isolamento aqui.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseService = safeCreateClient(supabaseUrl, supabaseServiceKey);

let ai: GoogleGenAI;
try {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy_key_to_prevent_crash_at_load_time",
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
} catch (err: any) {
  console.error("[GoogleGenAI] Falha ao inicializar:", err?.message);
  ai = new GoogleGenAI({ apiKey: "dummy_key_to_prevent_crash_at_load_time" });
}

// Formato: "chave1:tenantIdA,chave2:tenantIdB" — cada API key é vinculada a
// exatamente um tenant. Uma chave nunca pode ler/gravar leads de outro tenant,
// mesmo que o chamador informe um tenantId diferente no corpo da requisição.
const apiKeyTenantMap = new Map(
  (process.env.SPY_API_KEYS || process.env.AXIS_API_KEYS || "")
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [key, tenantId] = pair.split(":").map((s) => s.trim());
      return [key, tenantId] as [string, string];
    })
    .filter(([key, tenantId]) => key && tenantId)
);

const FORM_CLIENT_ID = process.env.SPY_FORM_CLIENT_ID || process.env.AXIS_FORM_CLIENT_ID || "";

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

// SPY_CORS_ORIGIN: lista separada por vírgula (ex.: "https://axis-crm.pluppex.com.br,http://localhost:5173").
// Antes era "*" por padrão — qualquer site podia ler resposta de rotas autenticadas
// (Authorization: Bearer) se conseguisse um token válido por outro caminho (XSS em
// outro lugar, extensão maliciosa). Sem SPY_CORS_ORIGIN configurada, não reflete
// nenhuma origem (mais seguro que abrir geral por omissão). Fallback pro nome antigo
// AXIS_CORS_ORIGIN — produção na Vercel ainda só tem a variável antiga configurada.
const allowedOrigins = (process.env.SPY_CORS_ORIGIN || process.env.AXIS_CORS_ORIGIN || "").split(",").map(o => o.trim()).filter(Boolean);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Rate limiting — nada disso existia antes. Cobre: a API pública por chave (contra
// força-bruta de x-api-key e abuso volumétrico), as rotas de IA (custo real por
// chamada a Gemini/Groq) e o simulador de WhatsApp. Login/cadastro/reset de senha
// não passam por aqui — dependem do rate limit nativo do próprio Supabase Auth.
const apiKeyLimiter = rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false });
const aiLimiter = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: true, legacyHeaders: false });
const whatsappLimiter = rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false });
app.use("/api/v1/leads", apiKeyLimiter);
app.use("/api/leads", aiLimiter);
app.use("/api/ai", aiLimiter);
app.use("/api/whatsapp", whatsappLimiter);

function requireApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (apiKeyTenantMap.size === 0) {
    return res.status(503).json({ error: "Nenhuma API Key configurada. Defina SPY_API_KEYS no formato chave:tenantId no .env." });
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
  try {
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
  } catch (err: any) {
    console.error("[requireUser]", err?.message);
    res.status(500).json({ error: "Erro ao validar autenticação." });
  }
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
    return res.status(500).json({ error: "Falha ao salvar lead no banco." });
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
  if (error) {
    console.error("[API v1] Erro ao buscar leads:", error.message);
    return res.status(500).json({ error: "Falha ao buscar leads." });
  }
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
      contents: `Você é o Master IA do S.P.Y. CRM. Analise estes indicadores:
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
      contents: `Você é o Auditor Master do S.P.Y. CRM. Analise esta configuração de ${type}:
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

app.get("/api/settings/:category", requireUser, async (req: any, res) => {
  const { category } = req.params;
  if (supabase) {
    // req.supabase (escopado com o JWT do chamador) em vez do client de
    // módulo com a anon key, para respeitar RLS caso a categoria algum dia
    // vire uma tabela real de verdade.
    const tableName = `crm_${category.replace("-", "_")}`;
    const { data, error } = await req.supabase.from(tableName).select("*");
    if (!error && data) return res.json(data);
  }
  // Nenhuma das categorias abaixo tem tabela própria no banco — fallback
  // em memória, isolado por tenant (ver tenantBucket): sem isso, tenant A
  // criando uma origem/campo customizado aparecia pra todo mundo na
  // plataforma, porque era um único array compartilhado pelo processo.
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  if (!tenantId) return res.status(401).json({ error: "Tenant não identificado." });
  switch (category) {
    case "sources": return res.json(tenantBucket(sourcesByTenant, tenantId, DEFAULT_SOURCES));
    case "fields": case "custom-fields": case "custom_lead_fields":
      return res.json(tenantBucket(customFieldsByTenant, tenantId, DEFAULT_CUSTOM_FIELDS));
    case "task-categories": case "categories":
      return res.json(tenantBucket(taskCategoriesByTenant, tenantId, DEFAULT_TASK_CATEGORIES));
    case "templates": return res.json(tenantBucket(templatesByTenant, tenantId, DEFAULT_TEMPLATES));
    default: return res.status(404).json({ error: "Categoria não encontrada" });
  }
});

app.post("/api/settings/:category", requireUser, async (req: any, res) => {
  const { category } = req.params;
  const item = req.body;
  const id = Math.random().toString(36).substring(2, 9);
  const newItem = { id, ...item };
  if (supabase) {
    const tableName = `crm_${category.replace("-", "_")}`;
    const { data, error } = await req.supabase.from(tableName).insert([newItem]).select();
    if (!error && data) return res.json(data[0]);
  }
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  if (!tenantId) return res.status(401).json({ error: "Tenant não identificado." });
  switch (category) {
    case "sources": {
      const newSource = { id, name: item.name || item.nome };
      tenantBucket(sourcesByTenant, tenantId, DEFAULT_SOURCES).push(newSource);
      return res.json(newSource);
    }
    case "fields": case "custom-fields": case "custom_lead_fields":
      tenantBucket(customFieldsByTenant, tenantId, DEFAULT_CUSTOM_FIELDS).push(newItem);
      return res.json(newItem);
    case "task-categories":
      tenantBucket(taskCategoriesByTenant, tenantId, DEFAULT_TASK_CATEGORIES).push(newItem);
      return res.json(newItem);
    case "templates":
      tenantBucket(templatesByTenant, tenantId, DEFAULT_TEMPLATES).push(newItem);
      return res.json(newItem);
    default: return res.status(404).json({ error: "Categoria inválida" });
  }
});

app.delete("/api/settings/:category/:id", requireUser, async (req: any, res) => {
  const { category, id } = req.params;
  if (supabase) {
    const tableName = `crm_${category.replace("-", "_")}`;
    await req.supabase.from(tableName).delete().eq("id", id);
  }
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  if (!tenantId) return res.status(401).json({ error: "Tenant não identificado." });
  switch (category) {
    case "sources":
      sourcesByTenant[tenantId] = tenantBucket(sourcesByTenant, tenantId, DEFAULT_SOURCES).filter((s) => s.id !== id);
      break;
    case "fields": case "custom-fields": case "custom_lead_fields":
      customFieldsByTenant[tenantId] = tenantBucket(customFieldsByTenant, tenantId, DEFAULT_CUSTOM_FIELDS).filter((f) => f.id !== id);
      break;
    case "task-categories": case "categories":
      taskCategoriesByTenant[tenantId] = tenantBucket(taskCategoriesByTenant, tenantId, DEFAULT_TASK_CATEGORIES).filter((c) => c.id !== id);
      break;
    case "templates":
      templatesByTenant[tenantId] = tenantBucket(templatesByTenant, tenantId, DEFAULT_TEMPLATES).filter((t) => t.id !== id);
      break;
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
      contents: `Você é o cérebro analítico do S.P.Y. CRM.
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

// ── Post-Meeting Report ────────────────────────────────────────────────────
// (o antigo Copilot de Reunião — /api/ai/reuniao-copilot, Gemini cru e paralelo à Aurora —
// foi removido: a própria Aurora agora cobre esse papel dentro da sala, ver
// useAuroraMeetingPresence.ts + AuroraJitsiVoice.tsx.)

// ── Aurora (chat com o G-TECH AI OS, embutido no S.P.Y.) ─────────────────────
// Proxy autenticado para o webhook do Chat Trigger da Aurora no n8n (workflow AURORA CORE).
// A URL do webhook nunca chega ao navegador — só este backend a conhece (AURORA_WEBHOOK_URL).
app.post("/api/ai/aurora-chat", requireUser, async (req: any, res: any) => {
  const { message, sessionId: clientSessionId } = req.body ?? {};
  if (!message?.trim()) return res.status(400).json({ error: "Mensagem vazia." });

  const webhookUrl = process.env.AURORA_WEBHOOK_URL;
  if (!webhookUrl) return res.status(503).json({ error: "Aurora não está configurada neste ambiente." });

  // Padrão: fixo e compartilhado com o jarvis-os (mesmo memory node no n8n) — Gustavo tem
  // contexto contínuo entre os dois apps em vez de duas conversas isoladas. Seguro porque a
  // própria Aurora só atende um usuário real hoje (ver system prompt do workflow AURORA CORE).
  // Chamadores com contexto próprio (ex.: a sala de reunião, uma sessão por reuniaoId) podem
  // passar o seu próprio sessionId pra não poluir/ser poluído pelo buffer de memória geral dela.
  const sessionId = clientSessionId || "aurora-gustavo-principal";

  try {
    const { data } = await axios.post(
      webhookUrl,
      { action: "sendMessage", sessionId, chatInput: message },
      { timeout: 60000 }
    );
    return res.json({ output: data?.output ?? "", audioBase64: data?.audioBase64 ?? null });
  } catch (err: any) {
    console.error("[Aurora Chat]", err?.response?.data ?? err?.message);
    return res.status(502).json({ error: "Aurora está indisponível agora." });
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
    const prompt = `Você é o Copilot de CRM do S.P.Y.. Analise o perfil do lead e retorne SOMENTE o JSON, sem markdown, sem texto extra.

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
    const relatorio = await generateAI(`Você é o analista de vendas do S.P.Y. CRM. Gere um relatório completo desta reunião.

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
  try {
    const { data: caller, error } = await req.supabase.from("users").select("is_master").eq("id", req.user.id).maybeSingle();
    if (error || !caller?.is_master) {
      return res.status(403).json({ error: "Apenas administradores master podem executar esta ação." });
    }
    next();
  } catch (err: any) {
    console.error("[requireMaster]", err?.message);
    res.status(500).json({ error: "Erro ao verificar permissões de administrador." });
  }
}

app.get("/api/admin/tenant-admin-user/:tenantId", requireUser, requireMaster, async (req: any, res) => {
  try {
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
  } catch (err: any) {
    console.error("[tenant-admin-user]", err?.message);
    res.status(500).json({ error: "Erro ao buscar administrador da empresa." });
  }
});

app.post("/api/admin/tenant-user/:userId/credentials", requireUser, requireMaster, async (req: any, res) => {
  try {
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
      console.error("[tenant-user-credentials] Falha ao atualizar credenciais:", authError.message);
      return res.status(500).json({ error: "Falha ao atualizar credenciais." });
    }

    if (email) {
      await supabaseService.from("users").update({ email }).eq("id", userId);
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("[tenant-user-credentials]", err?.message);
    res.status(500).json({ error: "Erro ao atualizar credenciais do administrador." });
  }
});

/**
 * Cria uma empresa parceira + o usuário administrador inicial dela, num
 * fluxo administrativo (é o Master quem define e-mail/senha, não a própria
 * empresa se auto-cadastrando). Por isso usamos a Admin API com
 * email_confirm: true — a conta já nasce confirmada, sem depender de e-mail
 * de confirmação (que além de desnecessário aqui, saía com o link apontando
 * para a Site URL configurada no Supabase, não para o domínio do S.P.Y.).
 */
app.post("/api/admin/tenant", requireUser, requireMaster, async (req: any, res) => {
  if (!supabaseService) return res.status(503).json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." });

  const { tenantName, niche, adminEmail, adminPassword } = req.body ?? {};
  if (!tenantName?.trim()) return res.status(400).json({ error: "Informe o nome da empresa." });
  if (!adminEmail?.trim()) return res.status(400).json({ error: "Informe o e-mail do administrador da empresa." });
  if (!adminPassword || adminPassword.length < 6) return res.status(400).json({ error: "A senha do administrador precisa ter pelo menos 6 caracteres." });

  try {
    const { data: existingUser } = await supabaseService.from("users").select("id").eq("email", adminEmail.trim()).maybeSingle();
    if (existingUser) return res.status(409).json({ error: "Este e-mail já está cadastrado no sistema." });

    const { data: tenantData, error: tenantError } = await supabaseService
      .from("tenants")
      .insert({
        name: tenantName.trim(),
        niche: niche || "Parceira",
        plan: "Standard",
        status: "Active",
        timezone: "America/Sao_Paulo",
        modules: { crm: true, sdr: false, advDashboard: false, financeiro: true, marketing: false, educacao: false, clinica: false, produtividade: true, rh: false, bi: false, engajamento: false },
      })
      .select()
      .maybeSingle();
    if (tenantError || !tenantData) {
      console.error("[tenant-create] Falha ao criar tenant:", tenantError?.message);
      return res.status(500).json({ error: "Erro ao criar empresa." });
    }

    const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
      email: adminEmail.trim(),
      password: adminPassword,
      email_confirm: true,
    });
    if (authError || !authData.user) {
      console.error("[tenant-create] Falha ao criar conta de acesso:", authError?.message);
      await supabaseService.from("tenants").delete().eq("id", tenantData.id);
      return res.status(500).json({ error: "Erro ao criar conta de acesso do administrador." });
    }

    const { error: profileError } = await supabaseService.from("users").insert({
      id: authData.user.id,
      tenant_id: tenantData.id,
      name: `Admin ${tenantName.trim()}`,
      email: adminEmail.trim(),
      role: "Admin",
      is_master: false,
      active: true,
    });
    if (profileError) {
      console.error("[tenant-create] Falha ao criar perfil do admin:", profileError.message);
      await supabaseService.from("tenants").delete().eq("id", tenantData.id);
      await supabaseService.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: "Erro ao criar o perfil do administrador." });
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("[tenant-create]", err?.message);
    res.status(500).json({ error: "Erro ao cadastrar empresa." });
  }
});

// ── WhatsApp / Evolution API Simulator ────────────────────────────────────

function bodyWithFallback(req: any) { return req.body || {}; }

app.get("/api/whatsapp/instances", requireUser, async (req: any, res) => {
  const { data, error } = await req.supabase.from("whatsapp_instances").select("*").order("created_at", { ascending: false });
  if (!error && data && data.length > 0) return res.json(data);
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  res.json(tenantBucket(instancesByTenant, tenantId, DEFAULT_INSTANCES));
});

app.post("/api/whatsapp/instances", requireUser, async (req: any, res) => {
  const { name, phone = "-", webhookUrl = "" } = req.body;
  if (!name) return res.status(400).json({ error: "Nome da instância é obrigatório" });
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  const newInst: WhatsAppInstance = {
    id: "evo_inst_" + Math.random().toString(36).substring(2, 9),
    name, phone, status: "DISCONNECTED",
    apiKey: "evo_apikey_" + Math.random().toString(36).substring(2, 12),
    webhookUrl: webhookUrl || "https://spy-crm.cloud/api/webhooks/whatsapp",
    qrcode: "", createdAt: new Date().toISOString()
  };
  tenantBucket(instancesByTenant, tenantId, DEFAULT_INSTANCES).push(newInst);
  res.json(newInst);
});

app.post("/api/whatsapp/instances/:id/qrcode", requireUser, async (req: any, res) => {
  const { id } = req.params;
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  const inst = tenantBucket(instancesByTenant, tenantId, DEFAULT_INSTANCES).find((i) => i.id === id);
  if (!inst) return res.status(404).json({ error: "Instância não encontrada" });
  inst.status = "CONNECTING";
  inst.qrcode = `00020101021226450014br.gov.bcb.pix2523evo-wa-connection-token-key-${inst.id}`;
  res.json({ status: "CONNECTING", qrcode: inst.qrcode });
});

app.post("/api/whatsapp/instances/:id/connect", requireUser, async (req: any, res) => {
  const { id } = req.params;
  const { phone } = bodyWithFallback(req);
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  const inst = tenantBucket(instancesByTenant, tenantId, DEFAULT_INSTANCES).find((i) => i.id === id);
  if (!inst) return res.status(404).json({ error: "Instância não encontrada" });
  inst.status = "CONNECTED";
  inst.phone = phone || "+55 11 9" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000);
  delete inst.qrcode;
  res.json({ status: "CONNECTED", instance: inst });
});

app.delete("/api/whatsapp/instances/:id", requireUser, async (req: any, res) => {
  const { id } = req.params;
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  instancesByTenant[tenantId] = tenantBucket(instancesByTenant, tenantId, DEFAULT_INSTANCES).filter((i) => i.id !== id);
  res.json({ success: true, message: `Instância ${id} removida` });
});

app.put("/api/whatsapp/instances/:id", requireUser, async (req: any, res) => {
  const { id } = req.params;
  const { webhookUrl, name, phone, status } = req.body;
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  const inst = tenantBucket(instancesByTenant, tenantId, DEFAULT_INSTANCES).find((i) => i.id === id);
  if (!inst) return res.status(404).json({ error: "Instância não encontrada" });
  if (webhookUrl !== undefined) inst.webhookUrl = webhookUrl;
  if (name !== undefined) inst.name = name;
  if (phone !== undefined) inst.phone = phone;
  if (status !== undefined) inst.status = status;
  res.json(inst);
});

app.get("/api/whatsapp/contacts", requireUser, async (req: any, res) => {
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  res.json(tenantBucket(contactsByTenant, tenantId, []));
});

app.post("/api/whatsapp/contacts", requireUser, async (req: any, res) => {
  const { name, phone, email, tags = ["lead"] } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "Nome e Telefone são obrigatórios" });
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  const contacts = tenantBucket(contactsByTenant, tenantId, []);
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
  tenantMessages(tenantId)[newContact.id] = [];
  res.json(newContact);
});

app.get("/api/whatsapp/messages/:contactId", requireUser, async (req: any, res) => {
  const { contactId } = req.params;
  const { data, error } = await req.supabase.from("chat_messages").select("*").eq("contact_id", contactId).order("timestamp", { ascending: true });
  if (!error && data) return res.json(data);
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  res.json(tenantMessages(tenantId)[contactId] || []);
});

app.post("/api/whatsapp/messages/send", requireUser, async (req: any, res) => {
  const { contactId, text } = req.body;
  if (!contactId || !text) return res.status(400).json({ error: "ID do contato e texto são obrigatórios" });
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const userMsg: ChatMessage = {
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    text, sender: "me", time: timeString, status: "sent", timestamp: Date.now()
  };
  const msgsByContact = tenantMessages(tenantId);
  if (!msgsByContact[contactId]) msgsByContact[contactId] = [];
  msgsByContact[contactId].push(userMsg);
  // req.supabase (escopado pela sessão do chamador, respeita RLS) em vez do client
  // anon module-level — essas tabelas não existem hoje (ver SECURITY_AUDIT.md item
  // A9), então isso é um no-op silencioso, mas já fica correto pra quando existirem.
  await req.supabase.from("chat_messages").insert([{ id: userMsg.id, text: userMsg.text, sender: userMsg.sender, time: userMsg.time, status: userMsg.status, timestamp: userMsg.timestamp, contact_id: contactId, tenant_id: tenantId }]);
  await req.supabase.from("chat_contacts").update({ lastMessage: text, time: timeString }).eq("id", contactId);
  const contact = tenantBucket(contactsByTenant, tenantId, []).find((c) => c.id === contactId);
  if (contact) { contact.lastMessage = text; contact.time = timeString; }
  res.json({ success: true, message: userMsg });
});

app.post("/api/whatsapp/simulate-incoming", requireUser, async (req: any, res) => {
  const { contactId, text } = req.body;
  if (!contactId || !text) return res.status(400).json({ error: "contactId e texto são obrigatórios" });
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  const contact = tenantBucket(contactsByTenant, tenantId, []).find((c) => c.id === contactId);
  if (!contact) return res.status(404).json({ error: "Contato não encontrado" });
  const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const inMsg: ChatMessage = {
    id: "msg_sim_" + Math.random().toString(36).substring(2, 9),
    text, sender: "them", time: timeString, timestamp: Date.now()
  };
  const msgsByContact = tenantMessages(tenantId);
  if (!msgsByContact[contactId]) msgsByContact[contactId] = [];
  msgsByContact[contactId].push(inMsg);
  contact.lastMessage = text;
  contact.time = timeString;
  contact.unread += 1;
  await req.supabase.from("chat_messages").insert([{ id: inMsg.id, text: inMsg.text, sender: inMsg.sender, time: inMsg.time, timestamp: inMsg.timestamp, contact_id: contactId, tenant_id: tenantId }]);
  await req.supabase.from("chat_contacts").update({ lastMessage: text, time: timeString, unread: contact.unread }).eq("id", contactId);
  res.json({ message: inMsg, contact });
});

app.post("/api/whatsapp/copilot/analyze", requireUser, async (req: any, res) => {
  const { contactId } = req.body;
  if (!contactId) return res.status(400).json({ error: "contactId é obrigatório" });
  const { data: tenantId } = await req.supabase.rpc("current_tenant_id");
  const chatHistory = tenantMessages(tenantId)[contactId] || [];
  const contact = tenantBucket(contactsByTenant, tenantId, []).find((c) => c.id === contactId);
  if (chatHistory.length === 0) {
    return res.json({
      suggestion: "Ainda não há mensagens registradas com este contato para analisar. Tente fazer uma saudação cortês, introduzindo o S.P.Y. CRM e perguntando como pode auxiliá-lo.",
      sentiment: "Neutro"
    });
  }
  const conversationText = chatHistory.map((m) => `${m.sender === "me" ? "Vendedor/Atendente" : "Cliente"}: ${m.text}`).join("\n");
  const promptContext = `Você é o S.P.Y. Copilot, um assistente especializado em CRM, Vendas e Atendimento via WhatsApp.
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

// Global error handler — catches any unhandled throws in async routes. Nunca
// devolve err.message pro cliente (pode conter detalhe de tabela/coluna/constraint
// do Postgres) — detalhe completo só no log do servidor.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[S.P.Y.] Unhandled error:", err?.message || err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// ── Export for Vercel Serverless ───────────────────────────────────────────

export default app;

