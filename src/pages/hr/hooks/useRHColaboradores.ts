import { useState } from "react";
import { useData } from "../../../contexts/DataContext";
import { Colaborador } from "../../../types";
import { toast } from "sonner";
import { confirmDialog } from "../../../components/ui/confirm-dialog";

export const INITIAL_COLABORADORES: Colaborador[] = [];

export function useRHColaboradores() {
  const { squads, addSquad, updateSquad, deleteSquad, leads, colaboradores, addColaborador, updateColaborador, deleteColaborador } = useData();

  const [activeTab, setActiveTab] = useState<'membros' | 'squads'>('membros');
  const [search, setSearch] = useState("");
  
  // Squad modal creation states
  const [isNewSquadOpen, setIsNewSquadOpen] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadDepartamento, setNewSquadDepartamento] = useState("");
  const [newSquadFoco, setNewSquadFoco] = useState("");
  const [newSquadCor, setNewSquadCor] = useState("#6366f1");
  const [newSquadLogo, setNewSquadLogo] = useState("");
  const [newSquadLeader, setNewSquadLeader] = useState("");

  // OTE Calculator states
  const [oteBaseSalary, setOteBaseSalary] = useState("0");
  const [oteCommPercentage, setOteCommPercentage] = useState("0");
  const [oteVendasRealizadas, setOteVendasRealizadas] = useState("0");
  const [oteAtingimentoMeta, setOteAtingimentoMeta] = useState("0");

  const handleCreateSquad = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!newSquadName.trim()) {
      toast.error("Insira o nome do Squad!");
      return;
    }
    addSquad({
      nome: newSquadName,
      departamento: newSquadDepartamento || "Geral",
      focoComercial: newSquadFoco || "",
      membros: [],
      cor: newSquadCor || "#6366f1",
      logo: newSquadLogo || "",
      leader: newSquadLeader || "",
      membrosFuncoes: {},
      clientes: [],
    });
    setIsNewSquadOpen(false);
    setNewSquadName("");
    setNewSquadDepartamento("");
    setNewSquadFoco("");
    setNewSquadCor("#6366f1");
    setNewSquadLogo("");
    setNewSquadLeader("");
  };

  const handleDeleteSquad = async (id: string) => {
    const squad = squads.find(s => s.id === id);
    if (!(await confirmDialog({
      title: "Excluir squad",
      description: `Excluir o squad "${squad?.nome || "selecionado"}"? Essa ação não pode ser desfeita.`,
    }))) return;
    deleteSquad(id);
  };

  const filtered = colaboradores.filter(c => 
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cargo.toLowerCase().includes(search.toLowerCase())
  );

  // OTE Calculations: Base + (Vendas * %comissao) + Performance_Bonus (if meta > 100%, +20% base)
  const calcVariable = (parseFloat(oteVendasRealizadas) || 0) * ((parseFloat(oteCommPercentage) || 0) / 100);
  const calcBonus = (parseFloat(oteAtingimentoMeta) || 0) >= 100 ? (parseFloat(oteBaseSalary) || 0) * 0.25 : 0;
  const totalOTE = (parseFloat(oteBaseSalary) || 0) + calcVariable + calcBonus;

  return {
    squads,
    addSquad,
    updateSquad,
    deleteSquad,
    leads,
    colaboradores,
    addColaborador,
    updateColaborador,
    deleteColaborador,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    isNewSquadOpen,
    setIsNewSquadOpen,
    newSquadName,
    setNewSquadName,
    newSquadDepartamento,
    setNewSquadDepartamento,
    newSquadFoco,
    setNewSquadFoco,
    newSquadCor,
    setNewSquadCor,
    newSquadLogo,
    setNewSquadLogo,
    newSquadLeader,
    setNewSquadLeader,
    oteBaseSalary,
    setOteBaseSalary,
    oteCommPercentage,
    setOteCommPercentage,
    oteVendasRealizadas,
    setOteVendasRealizadas,
    oteAtingimentoMeta,
    setOteAtingimentoMeta,
    handleCreateSquad,
    handleDeleteSquad,
    filtered,
    calcVariable,
    calcBonus,
    totalOTE
  };
}
