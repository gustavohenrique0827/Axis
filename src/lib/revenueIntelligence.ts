// ─── Types ────────────────────────────────────────────────────────────────────

export interface BANTItem {
  status: 'confirmed' | 'partial' | 'unknown' | 'negative';
  score: 0 | 1 | 2;
  evidence: string;
}

export interface RevenueAnalysis {
  bant: {
    budget: BANTItem;
    authority: BANTItem;
    need: BANTItem;
    timeline: BANTItem;
  };
  bantScore: number;
  temperature: 'frio' | 'morno' | 'quente';
  callAnalysis: {
    score: number;
    rapport: number;
    needDiscovery: number;
    investigation: number;
    presentationClarity: number;
    objectionHandling: number;
    closing: number;
    strengths: string[];
    weaknesses: string[];
  };
  playbookAnalysis: {
    adherencePercent: number;
    steps: {
      label: string;
      done: boolean;
    }[];
  };
  commercialValidation: {
    priceAlert: boolean;
    mentionedPrice: string;
    officialPrice: string;
    mentionedInstallments: string;
    officialInstallments: string;
    mentionedEnrollment: string;
    officialEnrollment: string;
    issues: string[];
  };
  objections: {
    text: string;
    category: 'Preço' | 'Tempo' | 'Prioridade' | 'Concorrência' | 'Confiança' | 'Autoridade' | 'Outro';
    handled: boolean;
  }[];
  buyingSignals: {
    text: string;
    intensity: 'low' | 'medium' | 'high';
  }[];
  lossRisk: {
    level: 'low' | 'medium' | 'high';
    reason: string;
  };
  closingProbability: number;
  nextBestAction: string;
  task: {
    title: string;
    date: string;
    time: string;
    description: string;
  } | null;
  whatsappFollowUp: string;
  executiveSummary: string;
  managerInsights: string[];
  urgentAlerts: string[];
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

export interface PromptData {
  today: string;
  tenantName: string;
  clientName: string;
  pipelineName: string;
  stageName: string;
  leadName: string;
  companyName: string;
  sellerName: string;
  productName: string;
  officialPrice: string;
  enrollmentFee: string;
  installments: string;
  commercialRules: string;
  crmNotes: string;
  history: string;
  transcript: string;
}

const SYSTEM_PROMPT = `Você é o AXIS Revenue Intelligence Engine.
Você é um Diretor Comercial virtual. Analise a transcrição e retorne APENAS JSON válido, sem markdown, sem código, sem texto fora do JSON.

REGRAS ABSOLUTAS:
1. NUNCA invente informações. Use apenas o que está na transcrição ou no CRM.
2. Se algo não foi mencionado: status = "unknown".
3. Copie valores monetários exatamente como foram falados.
4. Não arredonde. Não some taxa de matrícula ao valor principal.
5. Não parafraseie falas do cliente nos campos de evidência — use as palavras exatas.
6. Se cliente disser "eu decido", "sou o responsável", "quem decide sou eu": authority.status = "confirmed".
7. Aceites ("ok","beleza","fechado","sim","perfeito","concordo"): status = "accepted".
8. Rejeição explícita ("não tenho interesse","não quero"): status = "negative".

RETORNE EXATAMENTE este JSON (sem campos extras, sem comentários):
{
  "bant": {
    "budget": { "status": "confirmed|partial|unknown|negative", "score": 0|1|2, "evidence": "fala exata ou 'Não mencionado'" },
    "authority": { "status": "confirmed|partial|unknown|negative", "score": 0|1|2, "evidence": "fala exata ou 'Não mencionado'" },
    "need": { "status": "confirmed|partial|unknown|negative", "score": 0|1|2, "evidence": "fala exata ou 'Não mencionado'" },
    "timeline": { "status": "confirmed|partial|unknown|negative", "score": 0|1|2, "evidence": "fala exata ou 'Não mencionado'" }
  },
  "bantScore": 0,
  "temperature": "frio|morno|quente",
  "callAnalysis": {
    "score": 0,
    "rapport": 0,
    "needDiscovery": 0,
    "investigation": 0,
    "presentationClarity": 0,
    "objectionHandling": 0,
    "closing": 0,
    "strengths": [],
    "weaknesses": []
  },
  "playbookAnalysis": {
    "adherencePercent": 0,
    "steps": [
      { "label": "Apresentação", "done": false },
      { "label": "Validou interesse", "done": false },
      { "label": "Descobriu dores", "done": false },
      { "label": "Descobriu necessidade", "done": false },
      { "label": "Descobriu urgência", "done": false },
      { "label": "Descobriu autoridade", "done": false },
      { "label": "Descobriu orçamento", "done": false },
      { "label": "Apresentou solução", "done": false },
      { "label": "Gerou próximo passo", "done": false }
    ]
  },
  "commercialValidation": {
    "priceAlert": false,
    "mentionedPrice": "",
    "officialPrice": "",
    "mentionedInstallments": "",
    "officialInstallments": "",
    "mentionedEnrollment": "",
    "officialEnrollment": "",
    "issues": []
  },
  "objections": [],
  "buyingSignals": [],
  "lossRisk": { "level": "low|medium|high", "reason": "" },
  "closingProbability": 0,
  "nextBestAction": "",
  "task": null,
  "whatsappFollowUp": "",
  "executiveSummary": "",
  "managerInsights": [],
  "urgentAlerts": []
}`;

export function buildPrompt(data: PromptData): string {
  return `${SYSTEM_PROMPT}

═══════════ CONTEXTO CRM ═══════════
Data Atual: ${data.today}
Tenant: ${data.tenantName}
Cliente Proprietário: ${data.clientName}
Pipeline: ${data.pipelineName}
Etapa: ${data.stageName}
Lead: ${data.leadName}
Empresa: ${data.companyName}
Vendedor: ${data.sellerName}
Produto: ${data.productName}
Valor Oficial: ${data.officialPrice}
Taxa de Matrícula: ${data.enrollmentFee}
Parcelamento: ${data.installments}
Regras Comerciais: ${data.commercialRules}
Notas CRM: ${data.crmNotes}
Histórico: ${data.history}

═══════════ TRANSCRIÇÃO ═══════════
${data.transcript}
`;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<RevenueAnalysis> {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error('VITE_GEMINI_API_KEY não configurado');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini error ${res.status}: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return parseAnalysis(raw);
}

async function callGroq(prompt: string): Promise<RevenueAnalysis> {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error('VITE_GROQ_API_KEY não configurado');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq error ${res.status}: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? '';
  return parseAnalysis(raw);
}

function parseAnalysis(raw: string): RevenueAnalysis {
  const text = raw.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  try {
    return JSON.parse(text) as RevenueAnalysis;
  } catch {
    throw new Error('Resposta da IA não é JSON válido');
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export type AIProvider = 'gemini' | 'groq';

export async function analyzeCall(
  data: PromptData,
  provider: AIProvider = 'gemini'
): Promise<RevenueAnalysis> {
  const prompt = buildPrompt(data);
  if (provider === 'groq') return callGroq(prompt);
  return callGemini(prompt);
}
