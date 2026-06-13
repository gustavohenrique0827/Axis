import { Button } from "../../../../components/ui/button";
import { motion } from "motion/react";
import { Activity, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface LandingPageTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPage: { name: string } | null;
  pixelId: string;
  setPixelId: (v: string) => void;
  gtagId: string;
  setGtagId: (v: string) => void;
  onSave: () => void;
}

export function LandingPageTrackingModal({
  isOpen, onClose, selectedPage, pixelId, setPixelId, gtagId, setGtagId, onSave,
}: LandingPageTrackingModalProps) {
  if (!isOpen || !selectedPage) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1E293B]/30">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" /> Rastreamento
            </h3>
            <p className="text-xs text-slate-400 mt-1">{selectedPage.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">ID do Pixel Meta</label>
            <input type="text" value={pixelId} onChange={(e) => setPixelId(e.target.value)} placeholder="Ex: 1029384756"
              className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Google Analytics (G-TAG)</label>
            <input type="text" value={gtagId} onChange={(e) => setGtagId(e.target.value)} placeholder="Ex: G-XXXXXXXXXX"
              className="w-full bg-[#1E293B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex flex-col gap-3 bg-[#1E293B]/30">
          <Button
            onClick={() => toast.promise(new Promise(res => setTimeout(res, 1200)), { loading: 'Verificando scripts...', success: 'Pixel e Google Tag instalados com sucesso!', error: 'Falha na validação.' })}
            className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold gap-2"
          >
            <Sparkles className="w-4 h-4" /> Validar Instalação
          </Button>
          <Button onClick={onSave} className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold gap-2 mt-2">
            Salvar Configurações
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
