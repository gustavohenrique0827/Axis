import { useState, useMemo } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Building2, Users, Eye, DollarSign, TrendingUp, MapPin, Star, Calendar } from "lucide-react";

const MOCK_IMOVEIS = [
  { id: "1", titulo: "Apartamento 3 quartos - Moema", tipo: "Apartamento", status: "Disponível", valor: 850000, corretor: "Ana Lima", visitas: 12, bairro: "Moema" },
  { id: "2", titulo: "Casa 4 quartos - Alphaville", tipo: "Casa", status: "Vendido", valor: 1500000, corretor: "Carlos Matos", visitas: 8, bairro: "Alphaville" },
  { id: "3", titulo: "Cobertura Duplex - Vila Olímpia", tipo: "Cobertura", status: "Disponível", valor: 2200000, corretor: "Fernanda Rocha", visitas: 5, bairro: "Vila Olímpia" },
  { id: "4", titulo: "Kitnet Centro", tipo: "Kitnet", status: "Locado", valor: 1800, corretor: "Ana Lima", visitas: 20, bairro: "Centro" },
  { id: "5", titulo: "Sala Comercial - Faria Lima", tipo: "Comercial", status: "Disponível", valor: 950000, corretor: "Carlos Matos", visitas: 3, bairro: "Itaim Bibi" },
];

const MOCK_CORRETORES = [
  { id: "1", nome: "Ana Lima", foto: null, vendas: 8, ativos: 14, avaliacao: 4.9 },
  { id: "2", nome: "Carlos Matos", foto: null, vendas: 5, ativos: 9, avaliacao: 4.7 },
  { id: "3", nome: "Fernanda Rocha", foto: null, vendas: 3, ativos: 6, avaliacao: 4.8 },
];

const MOCK_VISITAS = [
  { data: "2026-06-17", imovel: "Apartamento 3 quartos - Moema", cliente: "Roberto Silva", corretor: "Ana Lima", status: "Confirmada" },
  { data: "2026-06-18", imovel: "Casa 4 quartos - Alphaville", cliente: "Patrícia Costa", corretor: "Carlos Matos", status: "Pendente" },
  { data: "2026-06-19", imovel: "Cobertura Duplex - Vila Olímpia", cliente: "Marcos Alves", corretor: "Fernanda Rocha", status: "Confirmada" },
];

function KPICard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-white mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function ImobiliarioPainel() {
  const [tabCorretor, setTabCorretor] = useState<"ranking" | "visitas">("ranking");

  const disponiveis = MOCK_IMOVEIS.filter(i => i.status === "Disponível").length;
  const vendidos = MOCK_IMOVEIS.filter(i => i.status === "Vendido").length;
  const vgv = MOCK_IMOVEIS.filter(i => i.status === "Vendido").reduce((acc, i) => acc + i.valor, 0);
  const totalVisitas = MOCK_IMOVEIS.reduce((acc, i) => acc + i.visitas, 0);

  return (
    <PageContainer
      title="Painel Imobiliário"
      description="Visão geral do portfólio de imóveis, corretores e performance comercial."
    >
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={Building2} label="Disponíveis" value={disponiveis.toString()} sub="Imóveis no portfólio" color="bg-blue-500/10 text-blue-400" />
          <KPICard icon={TrendingUp} label="Vendidos" value={vendidos.toString()} sub="Este mês" color="bg-emerald-500/10 text-emerald-400" />
          <KPICard icon={DollarSign} label="VGV Vendido" value={`R$ ${(vgv / 1e6).toFixed(1)}M`} sub="Volume geral de vendas" color="bg-violet-500/10 text-violet-400" />
          <KPICard icon={Eye} label="Visitas" value={totalVisitas.toString()} sub="Total realizadas" color="bg-amber-500/10 text-amber-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Últimos imóveis */}
          <div className="lg:col-span-2 bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Portfólio Recente</h3>
            <div className="space-y-3">
              {MOCK_IMOVEIS.map(im => (
                <div key={im.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{im.titulo}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{im.bairro} · {im.corretor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">
                      {im.tipo === "Kitnet" ? `R$ ${im.valor.toLocaleString("pt-BR")}/mês` : `R$ ${(im.valor / 1000).toFixed(0)}k`}
                    </p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      im.status === "Disponível" ? "bg-emerald-500/10 text-emerald-400" :
                      im.status === "Vendido" ? "bg-blue-500/10 text-blue-400" :
                      "bg-amber-500/10 text-amber-400"
                    }`}>{im.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking Corretores + Visitas */}
          <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
            <div className="flex gap-2 mb-4">
              {(["ranking", "visitas"] as const).map(t => (
                <button key={t} onClick={() => setTabCorretor(t)} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tabCorretor === t ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:text-slate-300"}`}>
                  {t === "ranking" ? "Corretores" : "Próximas Visitas"}
                </button>
              ))}
            </div>

            {tabCorretor === "ranking" ? (
              <div className="space-y-3">
                {MOCK_CORRETORES.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-black">
                      {c.nome.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{c.nome}</p>
                      <p className="text-[10px] text-slate-500">{c.vendas} vendas · {c.ativos} ativos</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-[11px] font-black">{c.avaliacao}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {MOCK_VISITAS.map((v, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{v.data}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${v.status === "Confirmada" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{v.status}</span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{v.imovel}</p>
                    <p className="text-[10px] text-slate-500">{v.cliente} · {v.corretor}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
