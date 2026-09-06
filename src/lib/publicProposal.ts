import { supabase } from "./supabase";

export interface PublicProposalItem {
  productName: string;
  quantidade: number;
  precoUnitario: number;
}

export interface PublicProposal {
  titulo: string;
  cliente: string | null;
  valor: number | null;
  status: string | null;
  validade: string | null;
  tipo: string;
  conteudoTexto: string | null;
  criadaEm: string;
  itens: PublicProposalItem[];
}

// Busca uma proposta pelo view_token público via RPC SECURITY DEFINER
// (get_public_proposal) — nunca faz select direto em `proposals`/`proposal_items`,
// então não depende de RLS/grants anon nessas tabelas para funcionar com segurança.
export async function fetchPublicProposal(token: string): Promise<PublicProposal | null> {
  if (!supabase || !token) return null;
  const { data, error } = await supabase.rpc("get_public_proposal", { p_token: token });
  if (error) {
    console.error("[publicProposal] erro ao buscar proposta:", error.message);
    return null;
  }
  return (data as PublicProposal) ?? null;
}
