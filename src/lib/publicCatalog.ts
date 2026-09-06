import { supabase } from "./supabase";

export interface PublicCatalogProduct {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  category: string;
  emEstoque: boolean;
}

export interface PublicCatalog {
  tenantName: string;
  products: PublicCatalogProduct[];
}

// Busca o catálogo público de um tenant via RPC SECURITY DEFINER
// (get_public_catalog) — nunca faz select direto em `products`, então não
// depende de RLS/grants anon nessa tabela. Nunca expõe o saldo exato de
// estoque, só disponibilidade (emEstoque).
export async function fetchPublicCatalog(tenantId: string): Promise<PublicCatalog | null> {
  if (!supabase || !tenantId) return null;
  const { data, error } = await supabase.rpc("get_public_catalog", { p_tenant_id: tenantId });
  if (error) {
    console.error("[publicCatalog] erro ao buscar catálogo:", error.message);
    return null;
  }
  return (data as PublicCatalog) ?? null;
}
