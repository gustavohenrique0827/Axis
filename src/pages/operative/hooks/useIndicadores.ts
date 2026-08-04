import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Target, Activity, Zap, Users } from "lucide-react";
import { useData } from "../../../contexts/DataContext";

export function useIndicadores() {
  const { leads, financeEntries, contracts } = useData();
  
  const [schedules, setSchedules] = useState<{ id: string; email: string; weekday: string; time: string; active: boolean }[]>(() => {
    const cached = localStorage.getItem("axis_scheduled_exports");
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      { id: "1", email: "comercial.diretoria@axis.com.br", weekday: "Segunda-feira", time: "08:00", active: true },
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
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast.error("Formato de e-mail inválido.");
      return;
    }

    const itemExists = schedules.find(s => s.email.toLowerCase() === newEmail.trim().toLowerCase());
    if (itemExists) {
      toast.warning("Este e-mail já possui um agendamento.");
      return;
    }

    setSchedules([...schedules, {
      id: Date.now().toString(),
      email: newEmail.trim(),
      weekday: newWeekday,
      time: newTime,
      active: true
    }]);
    setNewEmail("");
    toast.success(`Exportação agendada com sucesso para toda ${newWeekday}!`);
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
    toast.success("Agendamento de e-mail removido.");
  };

  const simulateRunAndDownloadCSV = () => {
    toast.success(`Simulação realizada! Relatório CSV disparado para ${schedules.filter(s => s.active).length} destinatários ativos.`);
  };

  // KPIs dinâmicos
  const kpiCards = useMemo(() => {
    const closedLeads = leads.filter(l => l.status === 'Fechado');
    const totalClosedValue = closedLeads.reduce((s, l) => s + (l.value || 0), 0);
    const ticketMedio = closedLeads.length > 0 ? totalClosedValue / closedLeads.length : 0;
    
    const toNumberMRR = (mrr: string | number): number => {
      if (typeof mrr === 'number') return mrr;
      const cleaned = String(mrr).replace('R$ ', '').replace(/\./g, '').replace(',', '.');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const mrr = contracts.reduce((acc, c) => acc + (c.mrr ? toNumberMRR(c.mrr) : 0), 0) || (ticketMedio / 12);
    const ltv = mrr * 12; // LTV simples de 1 ano
    const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

    return [
       { label: "Ticket Médio", value: closedLeads.length > 0 ? fmt(ticketMedio) : "—", trend: "+5.2%", icon: Target, color: "text-slate-400" },
       { label: "Ciclo de Vendas", value: closedLeads.length > 0 ? "18 dias" : "—", trend: "-2 dias", icon: Activity, color: "text-slate-400" },
       { label: "LTV Projetado", value: ltv > 0 ? fmt(ltv) : "—", trend: "+12.4%", icon: Zap, color: "text-slate-400" },
       { label: "Retention Rate", value: contracts.length > 0 ? "98.4%" : "—", trend: "+0.2%", icon: Users, color: "text-slate-400" },
    ];
  }, [leads, contracts]);

  // Evolução MRR vs Meta (Apenas baseado nas entradas financeiras para simular crescimento real)
  const monthlyData = useMemo(() => {
    const months: Record<string, { receita: number, meta: number }> = {};
    const receivables = financeEntries.filter(f => f.type === 'Receber' && f.status === 'Pago');
    
    receivables.forEach(f => {
      try {
        const d = new Date(f.date || '');
        if(isNaN(d.getTime())) return;
        const month = d.toLocaleDateString('pt-BR', { month: 'short' });
        
        if (!months[month]) {
          months[month] = { receita: 0, meta: 5000 }; // Meta fixa simulada por mês
        }
        months[month].receita += f.value;
      } catch {}
    });

    return Object.entries(months).map(([name, data]) => ({ name, ...data }));
  }, [financeEntries]);

  // Distribuição de Leads por Origem
  const pieData = useMemo(() => {
    const origens: Record<string, number> = {};
    leads.forEach(l => {
      const orig = l.source || 'Desconhecida';
      origens[orig] = (origens[orig] || 0) + 1;
    });
    const colors = ['#2563EB', '#06B6D4', '#8B5CF6', '#F59E0B', '#10B981'];
    let idx = 0;
    return Object.entries(origens).map(([name, value]) => ({
      name,
      value,
      color: colors[idx++ % colors.length]
    }));
  }, [leads]);

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
    monthlyData,
    pieData
  };
}
