import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { TrendingUp, ArrowUpRight, Mail, Calendar, Clock, Send, Trash2, Settings2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PageContainer } from "../../components/PageContainer";
import { useIndicadores } from "./hooks/useIndicadores";

import { Inbox } from "lucide-react";

export default function Indicadores() {
  const {
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
  } = useIndicadores();

  return (
    <PageContainer
      title="BI & Analytics Axis"
      description="Deep dive nos KPIs corporativos, projeção de faturamento e governança de dados estratégica."
      actions={
        <div className="flex gap-2">
           <Button variant="outline" className="border-white/10 bg-[#111827] text-slate-300 h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]">
             Exportar PDF
           </Button>
           <select className="bg-[#111827] border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500 text-white h-11">
              <option>Anual (2026)</option>
              <option>Semestre 1</option>
              <option>Semestre 2</option>
           </select>
        </div>
      }
    >
      <div className="space-y-8 pb-12">

      {/* KPI Cards */}
      <AnimatePresence>
        {selectedKPI && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedKPI(null)}
          >
             <motion.div 
               initial={{ scale: 0.9 }}
               animate={{ scale: 1 }}
               exit={{ scale: 0.9 }}
               className="bg-[#111827] border border-white/10 p-8 rounded-2xl max-w-lg w-full"
               onClick={e => e.stopPropagation()}
             >
                <h3 className="text-xl font-bold text-white mb-4">{selectedKPI.label} - Histórico (30 dias)</h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...Array(30).keys()].map(i => ({ day: i, value: 0 }))}>
                        <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        <XAxis dataKey="day" hide />
                        <YAxis hide />
                      </LineChart>
                   </ResponsiveContainer>
                </div>
                <Button className="mt-6 w-full" onClick={() => setSelectedKPI(null)}>Fechar</Button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        id="indicadores-draggable-container"
      >
         {kpiCards.map((kpi) => (
           <div 
             key={kpi.label} 
             className="h-full"
           >
             <Card 
               className={`p-6 bg-[#111827]/80 border-white/5 backdrop-blur-xl relative overflow-hidden group ${criticalKPIs.includes(kpi.label) ? 'animate-pulse' : ''}`}
               onDoubleClick={() => setSelectedKPI(kpi)}
             >
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                      <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                   </div>
                   <span className={`text-[10px] font-bold ${kpi.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{kpi.trend}</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-1 tracking-tight">{kpi.value}</h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{kpi.label}</p>
             </Card>
           </div>
         ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-2 p-8 border-white/5 bg-[#111827]/80 backdrop-blur-xl group">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-xl text-white">Evolução de MRR vs Meta</h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Real</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Benchmark</span>
                 </div>
              </div>
           </div>
           {monthlyData.length === 0 ? (
             <div className="h-[350px] flex flex-col items-center justify-center gap-4 opacity-40">
               <Inbox className="w-12 h-12 text-slate-500" />
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">
                 Sem histórico financeiro para montar o gráfico.
               </p>
             </div>
           ) : (
             <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dy={5} />
                    <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} dx={-5} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0B1120', borderColor: '#ffffff10', borderRadius: '16px' }}
                      cursor={{ fill: '#ffffff03' }}
                    />
                    <Bar dataKey="receita" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={40} />
                    <Bar dataKey="meta" fill="#ffffff10" radius={[6, 6, 0, 0]} barSize={10} />
                  </BarChart>
               </ResponsiveContainer>
             </div>
           )}
        </Card>

        <Card className="p-8 border-white/5 bg-[#111827]/80 backdrop-blur-xl flex flex-col relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="w-24 h-24 text-[#10B981]" />
           </div>
           <h3 className="font-bold text-xl text-white mb-8">Cumprimento de SLA</h3>
           <div className="flex-1 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie 
                     data={[
                       { name: 'Dentro do Prazo', value: 100, color: '#10B981' },
                       { name: 'Em Risco', value: 0, color: '#F59E0B' },
                       { name: 'Ultrapassado (Violado)', value: 0, color: '#EF4444' }
                     ]} 
                     innerRadius={80} 
                     outerRadius={115} 
                     paddingAngle={8} 
                     dataKey="value" 
                     cornerRadius={6}
                   >
                     {[
                       { name: 'Dentro do Prazo', value: 100, color: '#10B981' },
                       { name: 'Em Risco', value: 0, color: '#F59E0B' },
                       { name: 'Ultrapassado (Violado)', value: 0, color: '#EF4444' }
                     ].map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0B1120', border: 'none', borderRadius: '12px' }}
                     itemStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                     formatter={(value: number) => `${value}%`}
                   />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-4xl font-black text-white">0%</span>
                 <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Health Score</span>
              </div>
           </div>
           <div className="mt-8 grid grid-cols-1 gap-2">
              {[
                { name: 'Dentro do Prazo', value: 100, color: '#10B981' },
                { name: 'Em Risco', value: 0, color: '#F59E0B' },
                { name: 'Ultrapassado', value: 0, color: '#EF4444' }
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                   <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{d.name} ({d.value}%)</span>
                </div>
              ))}
           </div>
        </Card>

        <Card className="p-8 border-white/5 bg-[#111827]/80 backdrop-blur-xl flex flex-col relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp className="w-24 h-24 text-[#06B6D4]" />
           </div>
           <h3 className="font-bold text-xl text-white mb-8">Conversão por Origem</h3>
           <div className="flex-1 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={pieData} innerRadius={80} outerRadius={115} paddingAngle={8} dataKey="value" cornerRadius={6}>
                     {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0B1120', border: 'none', borderRadius: '12px' }}
                     itemStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                   />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-4xl font-black text-white">{pieData.reduce((acc, curr) => acc + curr.value, 0)}</span>
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Leads Atuais</span>
              </div>
           </div>
           <div className="mt-8 grid grid-cols-2 gap-4">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                   <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{d.name}</span>
                </div>
              ))}
           </div>
        </Card>
      </div>

      {/* SEÇÃO DE EXPORTAÇÃO AGENDADA */}
      <Card className="p-8 border border-white/5 bg-[#111827]/80 backdrop-blur-xl rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/[0.03] blur-[120px] rounded-full pointer-events-none text-transparent">glow</div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings2 className="text-blue-400 w-5 h-5 animate-pulse" /> Exportação Agendada de Performance (CSV)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Configure o envio automático de planilhas de performance comercial diretamente para os e-mails dos gestores e diretores. Em conformidade com as regras de governança, o relatório é consolidado e disparado **toda segunda-feira de manhã** de forma transparente.
            </p>
          </div>
          <Button 
            type="button" 
            onClick={simulateRunAndDownloadCSV}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 flex items-center gap-2 h-9 px-4 rounded-lg cursor-pointer"
          >
            <Send className="w-4 h-4" /> Simular Disparo (Segunda-feira)
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Formulário de Configuração */}
          <form onSubmit={handleCreateSchedule} className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> Novo Destinatário
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase block">E-mail do Gestor</label>
              <input
                type="text"
                placeholder="exemplo@axis.com.br"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-[#0B1120] text-sm text-white placeholder-slate-600 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase block">Frequência</label>
                <select 
                  value={newWeekday}
                  onChange={(e) => setNewWeekday(e.target.value)}
                  className="w-full bg-[#0B1120] text-xs text-white border border-white/10 rounded-xl px-3.5 py-3 outline-none font-bold text-slate-350"
                >
                  <option value="Segunda-feira">Toda Segunda (Recomendado)</option>
                  <option value="Terça-feira">Toda Terça</option>
                  <option value="Quarta-feira">Toda Quarta</option>
                  <option value="Quinta-feira">Toda Quinta</option>
                  <option value="Sexta-feira">Toda Sexta</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase block">Horário Disparo</label>
                <div className="relative">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#0B1120] text-xs font-bold text-white border border-white/10 rounded-xl px-4 py-3 outline-none font-mono text-center text-slate-350"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 border-0"
            >
              <Calendar className="w-4 h-4" /> Adicionar Agendamento
            </button>
          </form>

          {/* Lista de Envios Agendados Ativos */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            <div className="space-y-3.5">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Lista de Envio Ativa
              </h3>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {schedules.length > 0 ? (
                  schedules.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${
                        item.active 
                          ? "bg-[#0B1120]/60 border-blue-500/10 hover:border-blue-500/20" 
                          : "bg-slate-900/20 border-white/5 opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 truncate text-left">
                        <div className={`p-2 rounded-lg ${item.active ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-slate-400"}`}>
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-white text-xs font-black block truncate">{item.email}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Agenda: Toda {item.weekday} às {item.time}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Switch button */}
                        <button
                          type="button"
                          onClick={() => handleToggleSchedule(item.id)}
                          className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition-all cursor-pointer border ${
                            item.active 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : "bg-slate-800 text-slate-400 border-white/5"
                          }`}
                        >
                          {item.active ? "Ativo" : "Pausado"}
                        </button>

                        {/* Trash */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSchedule(item.id)}
                          className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2 bg-[#0B1120]/20 rounded-xl border border-dashed border-white/5">
                    <Mail className="w-8 h-8 text-slate-600" />
                    <span className="text-xs font-bold text-slate-300">Sem agendamentos activos</span>
                    <span className="text-[10px] text-slate-500 max-w-[200px]">Nenhuma entrega de emails configurada no painel de relatórios.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0B1120]/60 p-3.5 rounded-xl border border-white/5 flex items-start gap-2.5 mt-4 text-left">
              <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-normal">
                <strong>Dispensadores automáticos:</strong> Os relatórios são disparados através de rotinas CRON agendadas. Você também pode baixar o arquivo CSV compilado imediatamente pressionando a opção <strong>"Simular Disparo"</strong> acima.
              </p>
            </div>
          </div>

        </div>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
         {[
           { title: "Indicações", value: "0", sub: "0%", color: "text-emerald-400" },
           { title: "Instagram", value: "0", sub: "0%", color: "text-purple-400" },
           { title: "LinkedIn", value: "0", sub: "0%", color: "text-blue-400" },
           { title: "Google Ads", value: "0", sub: "0%", color: "text-[#06B6D4]" },
         ].map((item, i) => (
           <Card key={i} className="p-5 border-white/5 bg-white/5 backdrop-blur-lg flex items-center justify-between group hover:bg-white/[0.08] transition-colors cursor-pointer">
              <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">{item.title}</p>
                 <h4 className="text-xl font-bold text-white">{item.value}</h4>
              </div>
              <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                 <ArrowUpRight className="w-4 h-4" />
              </div>
           </Card>
         ))}
      </div>
    </div>
  </PageContainer>
  );
}
