import { useMemo } from 'react';
import { 
  TrendingUp, ArrowUpRight, ArrowDownRight, 
  Download, FileText, AlertCircle, 
  CreditCard, Wallet, Landmark, PieChart as PieIcon,
  Inbox
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PageContainer } from "../../components/PageContainer";
import { useData } from "../../contexts/DataContext";
import { exportToCSV } from "../../lib/exportCsv";
import { toast } from "sonner";

const COLORS = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#64748B'];

export default function FaturamentoClinico() {
  const { financeEntries, appointments } = useData();

  const receivables = financeEntries.filter(f => f.type === 'Receber');
  
  const totalBilled = receivables.reduce((sum, f) => sum + f.value, 0);
  const totalReceived = receivables.filter(f => f.status === 'Pago').reduce((sum, f) => sum + f.value, 0);
  
  const totalLate = receivables.filter(f => f.status === 'Atrasado').reduce((sum, f) => sum + f.value, 0);
  const glosaRate = totalBilled > 0 ? ((totalLate / totalBilled) * 100).toFixed(1) + '%' : '0%';
  
  const avgTicket = appointments.length > 0 ? (totalReceived / appointments.length) : 0;

  const revenueData = useMemo(() => {
    const months: Record<string, { faturado: number, recebido: number, glosas: number }> = {};
    receivables.forEach(f => {
      try {
        const d = new Date(f.date || '');
        if (isNaN(d.getTime())) return;
        const month = d.toLocaleDateString('pt-BR', { month: 'short' });
        
        if (!months[month]) months[month] = { faturado: 0, recebido: 0, glosas: 0 };
        
        months[month].faturado += f.value;
        if (f.status === 'Pago') months[month].recebido += f.value;
        if (f.status === 'Atrasado') months[month].glosas += f.value;
      } catch {}
    });
    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data
    }));
  }, [receivables]);

  const insuranceData = useMemo(() => {
    const categories: Record<string, number> = {};
    receivables.forEach(f => {
      const c = f.category || 'Consultas';
      categories[c] = (categories[c] || 0) + f.value;
    });

    const total = Object.values(categories).reduce((a,b) => a + b, 0);
    return Object.entries(categories)
      .map(([name, val], i) => ({
        name,
        value: total > 0 ? Math.round((val / total) * 100) : 0,
        color: COLORS[i % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [receivables]);

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

  return (
    <PageContainer 
      title="Faturamento Clínico" 
      description="Gestão de honorários, controle de faturamento e repasses médicos."
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => {
              if (receivables.length === 0) return toast.error("Nenhum lançamento para exportar");
              exportToCSV(receivables, "Faturamento_Clinico_Axis");
              toast.success("Download do relatório iniciado!");
            }}
            className="h-9 px-4 text-xs font-bold gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Exportar Relatório
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-[1700px] mx-auto pb-12">
        
        {/* Financial KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Faturamento Bruto", value: fmt(totalBilled), trend: "+12%", icon: Landmark, color: "text-[var(--color-primary-blue)]" },
            { label: "Receita Recebida", value: fmt(totalReceived), trend: "+8.5%", icon: Wallet, color: "text-emerald-500" },
            { label: "Taxa de Inadimplência", value: glosaRate, trend: "-0.5%", icon: AlertCircle, color: "text-rose-500" },
            { label: "Ticket Médio por Consulta", value: fmt(avgTicket), trend: "+3%", icon: CreditCard, color: "text-purple-500" },
          ].map((stat, i) => (
            <Card key={i} className="p-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-black font-mono text-[var(--color-text-primary)]">{stat.value}</div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
            <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Evolução Financeira Trimestral
            </h3>
            {revenueData.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center gap-3 opacity-50">
                <Inbox className="w-10 h-10 text-[var(--color-text-faint)]" />
                <p className="text-xs font-bold text-[var(--color-text-muted)] text-center">
                  Nenhum lançamento financeiro registrado.
                </p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary-blue)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--color-primary-blue)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="var(--color-text-faint)" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="var(--color-text-faint)" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-default)', borderRadius: '8px', color: 'var(--color-text-primary)' }}
                    />
                    <Area type="monotone" dataKey="faturado" stroke="var(--color-primary-blue)" fillOpacity={1} fill="url(#colorFat)" strokeWidth={2} />
                    <Area type="monotone" dataKey="recebido" stroke="#10b981" fillOpacity={0} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Categories Mix */}
          <Card className="p-6 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] shadow-sm">
            <h3 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-wider mb-6 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[var(--color-primary-blue)]" /> Mix de Receitas por Categoria
            </h3>
            {insuranceData.length === 0 ? (
              <div className="h-[250px] flex flex-col items-center justify-center gap-3 opacity-50">
                <PieIcon className="w-8 h-8 text-[var(--color-text-faint)]" />
                <p className="text-xs font-bold text-[var(--color-text-muted)] text-center">
                  Sem categorias cadastradas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {insuranceData.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-[var(--color-text-muted)]">{item.name}</span>
                      <span className="text-xs font-bold font-mono text-[var(--color-text-primary)]">{item.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--color-surface-sunken)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </PageContainer>
  );
}
