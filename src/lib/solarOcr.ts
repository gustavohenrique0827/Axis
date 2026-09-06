import { apiFetch } from "./apiClient";

export interface FaturaAnalise {
  distribuidora: string | null;
  consumoMedioKwh: number | null;
  valorFatura: number | null;
  mesReferencia: string | null;
  potenciaEstimadaKwp: number | null;
  economiaMensalEstimada: number | null;
  economiaAnualEstimada: number | null;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove o prefixo "data:image/jpeg;base64," — o backend só quer o payload
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Analisa uma foto de fatura de energia via OCR (Gemini, server-side — a
// chave nunca chega ao frontend). Lança erro se a extração falhar.
export async function analyzeFaturaSolar(file: File): Promise<FaturaAnalise> {
  const imageBase64 = await fileToBase64(file);
  const res = await apiFetch("/api/ai/solar-analyze-fatura", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, mimeType: file.type }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao analisar a fatura.");
  }
  return res.json();
}
