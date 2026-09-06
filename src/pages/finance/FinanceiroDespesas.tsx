import GenericFinanceiroList from "./GenericFinanceiroList";

export default function FinanceiroDespesas() {
  return (
    <GenericFinanceiroList
      title="Despesas Operacionais"
      desc="Controle detalhado de custos fixos, variáveis e desembolsos operacionais da empresa."
      type="Pagar"
    />
  );
}
