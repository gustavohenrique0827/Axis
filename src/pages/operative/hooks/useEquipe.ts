import { useState } from "react";

export interface TeamMember {
  name: string;
  role: string;
  email: string;
  deals: number;
  revenue: string;
  status: string;
  squad: string;
}

export interface Squad {
  name: string;
  leader: string;
}

export interface AuditLog {
  name: string;
  from: string;
  to: string;
  date: string;
}

export function useEquipe() {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const [memberSearch, setMemberSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
  const [newSquadExpanded, setNewSquadExpanded] = useState(false);
  const [newSquadData, setNewSquadData] = useState({ name: "", leader: "" });
  const [expandedSquads, setExpandedSquads] = useState<string[]>([]);
  const [squads, setSquads] = useState<Squad[]>([
    { name: "Squad Alpha", leader: "Carlos Eduardo Mendes" },
    { name: "Squad Beta", leader: "Juliana Costa" },
    { name: "Growth Team", leader: "N/A" }
  ]);
  const [team, setTeam] = useState<TeamMember[]>([
    { name: "Carlos Eduardo Mendes", role: "Vendedor Sênior", email: "carlos@g-tech.com", deals: 34, revenue: "R$ 450.000", status: "Ativo", squad: "Squad Alpha" },
    { name: "Ana Silva", role: "Vendedora Pleno", email: "ana@g-tech.com", deals: 28, revenue: "R$ 320.000", status: "Ativo", squad: "Squad Alpha" },
    { name: "Roberto Ramos", role: "Pré-Vendas (SDR)", email: "roberto@g-tech.com", deals: 89, revenue: "-", status: "Ocupado", squad: "Squad Beta" },
    { name: "Juliana Costa", role: "Gerente Comercial", email: "juliana@g-tech.com", deals: 0, revenue: "R$ 1.2M", status: "Ativo", squad: "Squad Beta" }
  ]);
  const [logs, setLogs] = useState<AuditLog[]>([
    {name: "Ana Silva", from: "Squad Beta", to: "Squad Alpha", date: "2026-05-20"}
  ]);

  const toggleSquad = (squadName: string) => {
    setExpandedSquads(prev => 
      prev.includes(squadName) ? prev.filter(n => n !== squadName) : [...prev, squadName]
    );
  };

  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredLogs = logs.filter(l => 
    l.name.toLowerCase().includes(filter.toLowerCase()) || 
    l.date.includes(filter)
  );

  const filteredTeam = team.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.role.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.squad.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const moveMember = (name: string, newSquad: string) => {
    const member = team.find(m => m.name === name);
    if (!member || member.squad === newSquad) return;
    
    setLogs(prev => [{name, from: member.squad, to: newSquad, date: new Date().toISOString().split('T')[0]}, ...prev]);
    setTeam(prev => prev.map(m => m.name === name ? {...m, squad: newSquad} : m));
  };

  return {
    activeTab,
    setActiveTab,
    memberSearch,
    setMemberSearch,
    isModalOpen,
    setIsModalOpen,
    isSquadModalOpen,
    setIsSquadModalOpen,
    newSquadExpanded,
    setNewSquadExpanded,
    newSquadData,
    setNewSquadData,
    expandedSquads,
    setExpandedSquads,
    squads,
    setSquads,
    team,
    setTeam,
    logs,
    setLogs,
    toggleSquad,
    filter,
    setFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredLogs,
    filteredTeam,
    paginatedLogs,
    totalPages,
    moveMember
  };
}
