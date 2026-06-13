import { Card } from "../../../../components/ui/card";
import { User, Check, Zap } from "lucide-react";

interface Doctor { id: string; name: string; esp: string; color: string; }

interface AgendaSidebarProps {
  doctors: Doctor[];
  selectedDrs: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  getStatusStyle: (status: string) => string;
}

export function AgendaSidebar({ doctors, selectedDrs, onToggle, onSelectAll, getStatusStyle }: AgendaSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className="p-8 bg-[#111827]/80 border-white/5 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Painel de Médicos</h3>
          <button onClick={onSelectAll} className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Marcar Todos</button>
        </div>
        <div className="space-y-3">
          {doctors.length === 0 ? (
            <div className="py-6 flex flex-col items-center justify-center opacity-40">
              <User className="w-8 h-8 text-slate-500 mb-2" />
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 text-center">Nenhum médico cadastrado (Squads)</span>
            </div>
          ) : doctors.map((dr) => (
            <button
              key={dr.id}
              onClick={() => onToggle(dr.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                selectedDrs.includes(dr.id)
                  ? 'bg-white/5 border-white/10 ring-1 ring-white/10'
                  : 'bg-transparent border-dashed border-white/5 opacity-40 grayscale'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dr.color }} />
              <div className="text-left flex-1">
                <p className="text-xs font-black text-white">{dr.name}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase">{dr.esp}</p>
              </div>
              {selectedDrs.includes(dr.id) && <Check className="w-3 h-3 text-emerald-400" />}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-8 bg-gradient-to-br from-[#10b981]/10 to-transparent border-emerald-500/10 group">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-3 h-3" /> Eficiência Global
          </h4>
          <div className="w-8 h-8 rounded-full border border-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-400">82%</div>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
              <span>Taxa de Espera</span>
              <span className="text-emerald-400">12min</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[45%]" />
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              "Previsão de **pico de fluxo** às 15:30 devido a 4 retornos simultâneos. Sala 02 disponível para triagem extra."
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-[#111827]/80 border-white/5">
        <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Legenda de Status</h4>
        <div className="grid grid-cols-2 gap-3">
          {['Aguardando', 'Em Atendimento', 'Atrasado', 'Confirmado'].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${getStatusStyle(s).split(' ')[1]}`} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{s}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
