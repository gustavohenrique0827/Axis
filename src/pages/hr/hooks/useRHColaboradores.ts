import React, { useState } from "react";
import { useData } from "../../../contexts/DataContext";
import { Colaborador } from "../../../types";
import { toast } from "sonner";

export const INITIAL_COLABORADORES: Colaborador[] = [
  {
    id: "1",
    nome: "Eduardo Meirelles",
    cargo: "Desenvolvedor Backend Sr",
    departamento: "Tecnologia",
    status: 'Ativo',
    dataAdmissao: "12 Mar 2021",
    email: "eduardo.m@empresa.com",
    desempenho: 94
  },
  {
    id: "2",
    nome: "Beatriz Oliveira",
    cargo: "Product Manager",
    departamento: "Produtos",
    status: 'Ativo',
    dataAdmissao: "05 Jan 2022",
    email: "beatriz.o@empresa.com",
    desempenho: 88
  },
  {
    id: "3",
    nome: "Rodrigo Santos",
    cargo: "UX/UI Designer",
    departamento: "Design",
    status: 'Férias',
    dataAdmissao: "22 Set 2020",
    email: "rodrigo.s@empresa.com",
    desempenho: 91
  },
  {
    id: "4",
    nome: "Mariana Costa",
    cargo: "Analista de RH",
    departamento: "Pessoas & Cultura",
    status: 'Ativo',
    dataAdmissao: "15 Mai 2023",
    email: "mariana.c@empresa.com",
    desempenho: 82
  },
  {
    id: "5",
    nome: "Roberto Ramos",
    cargo: "SDR Comercial Executivo",
    departamento: "Vendas / SDR",
    status: 'Ativo',
    dataAdmissao: "10 Ago 2022",
    email: "roberto.ramos@axis.com",
    desempenho: 96
  },
  {
    id: "6",
    nome: "Carlos Eduardo Mendes",
    cargo: "Closer Comercial Sênior",
    departamento: "Vendas / Closers",
    status: 'Ativo',
    dataAdmissao: "15 Jan 2022",
    email: "carlos.mendes@axis.com",
    desempenho: 92
  },
  {
    id: "7",
    nome: "Ana Silva",
    cargo: "Closer Closer Specialist",
    departamento: "Vendas / Closers",
    status: 'Ativo',
    dataAdmissao: "20 Mar 2023",
    email: "ana.silva@axis.com",
    desempenho: 89
  }
];

export function useRHColaboradores() {
  const { squads, addSquad, updateSquad, deleteSquad, leads } = useData();
  const [colaboradores] = useState<Colaborador[]>(INITIAL_COLABORADORES);

  const [activeTab, setActiveTab] = useState<'membros' | 'squads'>('membros');
  const [search, setSearch] = useState("");
  
  // Squad modal creation states
  const [isNewSquadOpen, setIsNewSquadOpen] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadMeta, setNewSquadMeta] = useState("100000");
  const [newSquadBudget, setNewSquadBudget] = useState("10000");
  const [newSquadFoco, setNewSquadFoco] = useState("");

  // OTE Calculator states
  const [oteBaseSalary, setOteBaseSalary] = useState("3500");
  const [oteCommPercentage, setOteCommPercentage] = useState("5");
  const [oteVendasRealizadas, setOteVendasRealizadas] = useState("80000");
  const [oteAtingimentoMeta, setOteAtingimentoMeta] = useState("105");

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
      membros: ["Roberto Ramos (SDR)", "Carlos Mendes (Closer)"]
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
