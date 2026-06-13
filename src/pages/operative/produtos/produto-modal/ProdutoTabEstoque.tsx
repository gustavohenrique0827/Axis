import { Truck, ShieldAlert, Check } from "lucide-react";

interface ProdutoTabEstoqueProps {
  formStockMin: string;
  setFormStockMin: (v: string) => void;
  formStockMax: string;
  setFormStockMax: (v: string) => void;
  formCurrentStock: string;
  setFormCurrentStock: (v: string) => void;
  formProvider: string;
  setFormProvider: (v: string) => void;
  formDimensions: string;
  setFormDimensions: (v: string) => void;
  formWeight: string;
  setFormWeight: (v: string) => void;
  formMaterial: string;
  setFormMaterial: (v: string) => void;
}

export function ProdutoTabEstoque({
  formStockMin, setFormStockMin, formStockMax, setFormStockMax,
  formCurrentStock, setFormCurrentStock, formProvider, setFormProvider,
  formDimensions, setFormDimensions, formWeight, setFormWeight,
  formMaterial, setFormMaterial,
}: ProdutoTabEstoqueProps) {
  const inputCls = "w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563EB]/40 font-mono";

  const cur = parseInt(formCurrentStock) || 0;
  const min = parseInt(formStockMin) || 0;
  const isCritical = cur <= min;

  return (
    <div className="space-y-4">
      <div className="bg-[#111827] border border-white/5 p-4 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 font-black text-xs font-mono">3</div>
        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-wider">Controle Logístico & Fornecedor</h4>
          <p className="text-[10px] text-slate-500">Insira limites de estoque para avisos automáticos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Estoque Mínimo Alerta</label>
          <input type="number" value={formStockMin} onChange={(e) => setFormStockMin(e.target.value)} placeholder="Ex: 5" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Estoque Atual Físico</label>
          <input type="number" value={formCurrentStock} onChange={(e) => setFormCurrentStock(e.target.value)} placeholder="Ex: 50" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Estoque Máximo Alvo</label>
          <input type="number" value={formStockMax} onChange={(e) => setFormStockMax(e.target.value)} placeholder="Ex: 200" className={inputCls} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Fornecedor / Distribuidor</label>
        <input type="text" value={formProvider} onChange={(e) => setFormProvider(e.target.value)}
          placeholder="Ex: Cisco Solutions Inc" className={`${inputCls} font-medium`} />
      </div>

      <div className="bg-[#111827]/40 border border-white/5 p-4 rounded-xl flex items-center gap-3 text-xs">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCritical ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
          {isCritical ? <ShieldAlert className="w-4 h-4" /> : <Check className="w-4 h-4" />}
        </div>
        <div>
          <span className="text-[9px] text-slate-500 uppercase font-black block">Status Operacional Logística</span>
          <span className="font-semibold text-white">
            {isCritical ? "Alerta de Estoque Crítico (Comprar do Fornecedor)" : "Nível do Estoque Adequado (Operando normal)"}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-[#2563EB]" /> Dimensões Físicas (Opcional)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Dimensões (LxAxP)</label>
            <input type="text" value={formDimensions} onChange={(e) => setFormDimensions(e.target.value)} placeholder="Ex: 10x15x20 cm" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Peso Total (kg)</label>
            <input type="number" step="any" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} placeholder="Ex: 1.5" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Material / Composição</label>
            <input type="text" value={formMaterial} onChange={(e) => setFormMaterial(e.target.value)} placeholder="Ex: Alumínio Fundido" className={`${inputCls} font-medium`} />
          </div>
        </div>
      </div>
    </div>
  );
}
