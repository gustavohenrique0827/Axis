import GenericFinanceiroList from "./GenericFinanceiroList";

export default function FinanceiroReceber() {
  return (
    <GenericFinanceiroList
      title="Contas a Receber"
      desc="Acompanhe valores pendentes e próximos vencimentos dos seus clientes."
      type="Receber"
    />
  );
}
