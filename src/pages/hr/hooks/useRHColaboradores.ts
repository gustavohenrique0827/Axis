import React, { useState } from "react";
import { useData } from "../../../contexts/DataContext";
import { Colaborador } from "../../../types";
import { toast } from "sonner";

export const INITIAL_COLABORADORES: Colaborador[] = [];

export function useRHColaboradores() {
  const { squads, addSquad, updateSquad, deleteSquad, leads, colaboradores, addColaborador, updateColaborador, deleteColaborador } = useData();

  const [activeTab, setActiveTab] = useState<'membros' | 'squads'>('membros');
  const [search, setSearch] = useState("");
  
  // Squad modal creation states
  const [isNewSquadOpen, setIsNewSquadOpen] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadMeta, setNewSquadMeta] = useState("100000");
  const [newSquadBudget, setNewSquadBudget] = useState("10000");
  const [newSquadFoco, setNewSquadFoco] = useState("");

  // OTE Calculator states
  const [oteBaseSalary, setOteBaseSalary] = useState("0");
  const [oteCommPercentage, setOteCommPercentage] = useState("0");
  const [oteVendasRealizadas, setOteVendasRealizadas] = useState("0");
  const [oteAtingimentoMeta, setOteAtingimentoMeta] = useState("0");

  const handleCreateSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSquadName.trim()) {
      toast.error("Insira o nome do Squad comercial!");
      return;
    }
    const created = {
      nome: newSquadName,
      meta: parseFloat(newSquadMeta) || 100000,
      orcamentoMensal: parseFloat(newSquadBudget) || 10000,
      faturamentoAlcancado: 0,
      sdrCount: 1,
      closersCount: 1,
      focoComercial: newSquadFoco || "Prospecção Geral e Contatos Comerciais",
      membros: []
    };
    addSquad(created);
    setIsNewSquadOpen(false);
    setNewSquadName("");
    setNewSquadFoco("");
  };

  const handleDeleteSquad = (id: string) => {
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
    newSquadMeta,
    setNewSquadMeta,
    newSquadBudget,
    setNewSquadBudget,
    newSquadFoco,
    setNewSquadFoco,
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
