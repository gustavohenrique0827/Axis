import { Navigate } from "react-router-dom";

// Módulo antigo de Metas & Comissionamento — simulava squads/colaboradores em memória
// contra colunas que não existem nas tabelas reais (squad_metas/colaboradores), então
// nada digitado aqui jamais persistia no banco. Consolidado em Financeiro > Comissões &
// OTE (/app/financeiro/comissoes + /app/financeiro/configuracoes), que já é a única fonte
// real de metas (meta/realizado por colaborador) e comissão (modelo configurável).
export default function FinanceiroMetas() {
  return <Navigate to="/app/financeiro/comissoes" replace />;
}
