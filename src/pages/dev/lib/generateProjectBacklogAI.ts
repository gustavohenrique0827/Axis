import type { Priority } from '../hooks/useDevSprints';

export type GeneratedBacklogTask = {
  title: string;
  type: 'feature' | 'bug' | 'chore' | 'refactor';
  priority: Priority;
  points: number;
  tags: string[];
};

export type GeneratedBacklog = {
  tasks: GeneratedBacklogTask[];
};

function safeJsonParse<T>(raw: string): T {
  const text = raw
    .trim()
    // remove possible markdown code fences
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  return JSON.parse(text) as T;
}

function buildPrompt(input: { productName: string; description: string }) {
  return `Você é o AXIS Dev Planner.

Objetivo: gerar um backlog de desenvolvimento (Kanban) para um projeto com base no NOME do produto/projeto e na DESCRIÇÃO.

REGRAS ABSOLUTAS:
1) Retorne APENAS JSON válido, sem markdown.
2) Não invente requisitos que não estejam relacionados ao nome/descrição.
3) Se faltarem detalhes, crie tasks genéricas de planejamento/implementação que façam sentido (setup, requisitos, testes, documentação), mantendo escopo coerente.
4) Para cada task, escolha: type ∈ {"feature","bug","chore","refactor"}.
5) Para priority use apenas: "crítica" | "alta" | "média" | "baixa".
6) points: número inteiro entre 1 e 13 (maior quando for mais complexo).
7) tags: lista curta (2 a 5 strings) com palavras-chave.

FORMATO DE SAÍDA:
{
  "tasks": [
    {
      "title": "...",
      "type": "feature|bug|chore|refactor",
      "priority": "crítica|alta|média|baixa",
      "points": 1,
      "tags": ["...","..."]
    }
  ]
}

NOME:
${input.productName}

DESCRIÇÃO:
${input.description}
`;
}

async function callGemini(prompt: string) {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) throw new Error('VITE_GEMINI_API_KEY não configurado');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini error ${res.status}: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return safeJsonParse<GeneratedBacklog>(raw);
}

async function callGroq(prompt: string) {
  const key = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
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
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq error ${res.status}: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? '';
  return safeJsonParse<GeneratedBacklog>(raw);
}

export type AIProvider = 'gemini' | 'groq';

export async function generateProjectBacklogAI(
  input: { productName: string; description: string },
  provider: AIProvider = 'gemini'
): Promise<GeneratedBacklog> {
  const prompt = buildPrompt(input);
  if (provider === 'groq') return callGroq(prompt);
  return callGemini(prompt);
}

