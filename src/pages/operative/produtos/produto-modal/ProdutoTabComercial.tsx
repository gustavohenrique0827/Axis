import { DollarSign, Coins, Percent, TrendingUp } from "lucide-react";

interface ProdutoTabComercialProps {
  formPrice: string;
  setFormPrice: (v: string) => void;
  formCost: string;
  setFormCost: (v: string) => void;
  formCommission: string;
  setFormCommission: (v: string) => void;
  simulateTax: boolean;
  setSimulateTax: (v: boolean) => void;
}

export function ProdutoTabComercial({
  formPrice, setFormPrice, formCost, setFormCost,
  formCommission, setFormCommission, simulateTax, setSimulateTax,
}: ProdutoTabComercialProps) {
  const inputCls = "w-full bg-[#111827] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#2563EB]/40 font-mono font-bold transition-all";

  const p = parseFloat(formPrice) || 0;
  const c = parseFloat(formCost) || 0;
  const commPercent = parseFloat(formCommission) || 0;
  const commissionVal = (p * commPercent) / 100;
  const taxRate = simulateTax ? 0.08 : 0;
  const estimatedTaxVal = p * taxRate;
  const netProfitRaw = Math.max(0, p - c - commissionVal - estimatedTaxVal);
  const netMarginVal = p > 0 ? Math.round((netProfitRaw / p) * 1000) / 10 : 0;

  let rentabilityLabel = "Digite valores acima";
  let rentabilityColor = "text-slate-400 bg-slate-400/10 border-slate-400/20";
  if (p > 0) {
    if (netMarginVal >= 55) {
      rentabilityLabel = "Rentabilidade Excelente";
      rentabilityColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    } else if (netMarginVal >= 30) {
      rentabilityLabel = "Rentabilidade Saudável";
      rentabilityColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
    } else {
      rentabilityLabel = "Rentabilidade Baixa — Ajuste o Preço";
      rentabilityColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-[#111827] border border-white/5 p-4 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0 font-black text-xs font-mono">2</div>
        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-wider">Comercial & Precificação</h4>
          <p className="text-[10px] text-slate-500">Configure preço final, custo de origem e comissão dos vendedores.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">
            Preço de Venda (R$) <strong className="text-rose-400">*</strong>
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="number" step="any" value={formPrice} onChange={(e) => setFormPrice(e.target.value)}
              placeholder="Ex: 4500" className={`${inputCls} pl-9 text-emerald-400`} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Custo de Aquisição (R$)</label>
          <div className="relative">
            <Coins className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="number" step="any" value={formCost} onChange={(e) => setFormCost(e.target.value)}
              placeholder="Ex: 1200" className={`${inputCls} pl-9 text-slate-300`} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">Comissão Vendedor (%)</label>
          <div className="relative">
            <Percent className="w-3.5 h-3.5 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="number" value={formCommission} onChange={(e) => setFormCommission(e.target.value)}
              placeholder="Ex: 5" className={`${inputCls} pl-9 text-cyan-400`} />
          </div>
        </div>
      </div>

      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Detalhamento de Rentabilidade CRM
          </h5>
          {p > 0 && (
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${rentabilityColor}`}>
              {rentabilityLabel}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          {[
            { label: "Faturamento Bruto", value: `R$ ${p.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, cls: "text-white" },
            { label: "Custo Origem", value: `-R$ ${c.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, cls: "text-rose-400" },
            { label: `Comissão (${commPercent}%)`, value: `-R$ ${commissionVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, cls: "text-slate-400" },
            { label: "Lucro Estimado", value: `R$ ${netProfitRaw.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, cls: "text-emerald-400 font-black", highlight: true },
          ].map((item) => (
            <div key={item.label} className={`p-3 border rounded-xl ${item.highlight ? "bg-[#2563EB]/5 border-[#2563EB]/20" : "bg-white/[0.015] border-white/5"}`}>
              <span className="text-[9px] text-slate-500 uppercase font-black block">{item.label}</span>
              <span className={`text-sm font-bold font-mono block mt-1 ${item.cls}`}>{item.value}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2 select-none">
            <input type="checkbox" id="taxSimulationCheck" checked={simulateTax} onChange={(e) => setSimulateTax(e.target.checked)}
              className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] bg-slate-900 border-white/20 cursor-pointer" />
            <label htmlFor="taxSimulationCheck" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Simular imposto do Simples Nacional (8%)
            </label>
          </div>
          {p > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-white">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Margem Real Líquida:</span>
              <span className="font-mono font-black text-emerald-400 text-sm">{netMarginVal}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
