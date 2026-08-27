import { Outlet } from "react-router-dom";
import { Wallet, TrendingUp, TrendingDown, DollarSign, PieChart, FileText, Target, Settings2, LayoutList } from 'lucide-react';
import { SectionSidebar, type SectionNavGroup } from "../../components/layout/SectionSidebar";

const groups: SectionNavGroup[] = [
  {
    title: "Navegação Geral",
    icon: Wallet,
    items: [
      { title: "Visão geral", path: "/app/financeiro", icon: PieChart },
      { title: "Faturas", path: "/app/financeiro/faturas", icon: FileText },
      { title: "A receber", path: "/app/financeiro/receber", icon: TrendingUp },
      { title: "A pagar", path: "/app/financeiro/pagar", icon: TrendingDown },
      { title: "Comissões", path: "/app/financeiro/comissoes", icon: DollarSign },
      { title: "Metas", path: "/app/financeiro/metas", icon: Target },
      { title: "DRE", path: "/app/financeiro/dre", icon: LayoutList },
      { title: "Categorias", path: "/app/financeiro/categorias", icon: Wallet },
      { title: "Configurações", path: "/app/financeiro/configuracoes", icon: Settings2 },
    ],
  },
];

export default function FinanceiroLayout() {
  return (
    <SectionSidebar heading="Financeiro" groups={groups}>
      <Outlet />
    </SectionSidebar>
  );
}
