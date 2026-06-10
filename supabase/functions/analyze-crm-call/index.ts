// Supabase Edge Function: analyze-crm-call
// Deploy: supabase functions deploy analyze-crm-call
// Secrets: supabase secrets set GEMINI_API_KEY=... GROQ_API_KEY=...

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { promptData, provider = "gemini" } = await req.json();

    if (!promptData?.transcript) {
      return new Response(JSON.stringify({ error: "transcript is required" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(promptData);
    const result =
      provider === "groq" ? await callGroq(prompt) : await callGemini(prompt);

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(d: Record<string, string>): string {
  return `Você é o AXIS Revenue Intelligence Engine. Analise e retorne APENAS JSON válido, sem markdown.
Regras: nunca invente informações, use palavras exatas do cliente para evidências, status=unknown se não mencionado.

CONTEXTO CRM:
Data: ${d.today} | Tenant: ${d.tenantName} | Pipeline: ${d.pipelineName} | Etapa: ${d.stageName}
Lead: ${d.leadName} | Empresa: ${d.companyName} | Vendedor: ${d.sellerName}
Produto: ${d.productName} | Valor Oficial: ${d.officialPrice} | Matrícula: ${d.enrollmentFee}
Parcelamento: ${d.installments} | Regras: ${d.commercialRules}
Notas CRM: ${d.crmNotes}

TRANSCRIÇÃO:
${d.transcript}

Retorne JSON com: bant, bantScore, temperature, callAnalysis, playbookAnalysis, commercialValidation, objections, buyingSignals, lossRisk, closingProbability, nextBestAction, task, whatsappFollowUp, executiveSummary, managerInsights, urgentAlerts`;
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<unknown> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  return JSON.parse(raw.trim().replace(/^```json\s*/i, "").replace(/\s*```$/i, ""));
}

// ─── Groq ─────────────────────────────────────────────────────────────────────

async function callGroq(prompt: string): Promise<unknown> {
  const key = Deno.env.get("GROQ_API_KEY");
  if (!key) throw new Error("GROQ_API_KEY not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
}
