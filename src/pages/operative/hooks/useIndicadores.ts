import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Target, Activity, Zap, Users } from "lucide-react";

export function useIndicadores() {
  const [schedules, setSchedules] = useState<{ id: string; email: string; weekday: string; time: string; active: boolean }[]>(() => {
    const cached = localStorage.getItem("axis_scheduled_exports");
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      { id: "1", email: "comercial.diretoria@axis.com.br", weekday: "Segunda-feira", time: "08:00", active: true },
      { id: "2", email: "gerencia.operacoes@axis.com.br", weekday: "Segunda-feira", time: "07:30", active: true }
    ];
  });

  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const [criticalKPIs] = useState<string[]>(["Retention Rate"]);

  // Form states for scheduled exports
  const [newEmail, setNewEmail] = useState("");
  const [newWeekday, setNewWeekday] = useState("Segunda-feira");
  const [newTime, setNewTime] = useState("08:00");

  useEffect(() => {
    localStorage.setItem("axis_scheduled_exports", JSON.stringify(schedules));
  }, [schedules]);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error("Por favor, digite um e-mail válido.");
      return;
    }
    if (!newEmail.includes("@") || !newEmail.includes(".")) {
      toast.error("Formato de e-mail inválido.");
      return;
    }

    const itemExists = schedules.find(s => s.email.toLowerCase() === newEmail.trim().toLowerCase());
    if (itemExists) {
      toast.warning("Este e-mail já possui um agendamento.");
      return;
    }

    const scheduledItem = {
      id: Date.now().toString(),
      email: newEmail.trim(),
      weekday: newWeekday,
      time: newTime,
      active: true
    };

    setSchedules([...schedules, scheduledItem]);
    setNewEmail("");
    toast.success(`Exportação agendada com sucesso para toda ${newWeekday}!`);
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, active: !s.active } : s));
    toast.info("Status do agendamento atualizado.");
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
    toast.success("Agendamento de e-mail removido.");
  };

  const simulateRunAndDownloadCSV = () => {
    const csvRows = [
      ["Mes", "Receita Real (R$)", "Meta Comercial (R$)", "Total de Leads Atendidos", "SLA Compliance Rate (%)"],
      ["Jan", "R$ 4.000", "R$ 3.800", "240", "85%"],
      ["Fev", "R$ 3.000", "R$ 3.200", "139", "85%"],
      ["Mar", "R$ 2.000", "R$ 3.500", "980", "85%"],
      ["Abr", "R$ 2.780", "R$ 3.000", "390", "85%"],
      ["Mai", "R$ 1.890", "R$ 2.500", "480", "85%"],
      ["Jun", "R$ 3.200", "R$ 2.800", "600", "85%"],
      ["Indicadores Gerais", "Ticket Medio: R$ 2.450", "Ciclo Medio: 18 dias", "LTV Medio: R$ 18.200", "Retencao: 98.4%"]
    ];

    const csvString = "\uFEFF" + csvRows.map(row => row.map(cell => `"${cell}"`).join(";")).join("\r\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `axis_weekly_performance_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Simulação realizada! Relatório CSV disparado para ${schedules.filter(s => s.active).length} destinatários ativos.`);
  };

  const [kpiCards, setKpiCards] = useState([
     { label: "Ticket Médio", value: "R$ 2.450", trend: "+5.2%", icon: Target, color: "text-[#2563EB]" },
     { label: "Ciclo de Vendas", value: "18 dias", trend: "-2 dias", icon: Activity, color: "text-[#06B6D4]" },
     { label: "LTV Projetado", value: "R$ 18.200", trend: "+12.4%", icon: Zap, color: "text-purple-400" },
     { label: "Retention Rate", value: "98.4%", trend: "+0.2%", icon: Users, color: "text-emerald-400" },
  ]);

  return {
    schedules,
    selectedKPI,
    setSelectedKPI,
    criticalKPIs,
    newEmail,
    setNewEmail,
    newWeekday,
    setNewWeekday,
    newTime,
    setNewTime,
    handleCreateSchedule,
    handleToggleSchedule,
    handleDeleteSchedule,
    simulateRunAndDownloadCSV,
    kpiCards,
    setKpiCards
  };
}
