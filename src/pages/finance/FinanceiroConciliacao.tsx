import { useState, useRef, useEffect } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  CheckCircle2, AlertCircle, RefreshCw, Upload, FileText,
  Building2, ArrowRight, ShieldCheck, Sparkles, Check, X,
  ArrowDownLeft, ArrowUpRight
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";

type ExtratoItem = {
  id: string;
  data: string;
  descricao: string;
  documento: string;
  valor: number;
  tipo: "credito" | "debito";
  banco: string;
  conciliado: boolean;
  matchSugerido?: string;
};

const INITIAL_EXTRATO: ExtratoItem[] = [
  { id: "tx_1", data: "05/09/2026", descricao: "TED 033.4893 - ENERGIA SOLAR BR", documento: "DOC 819283", valor: 14500, tipo: "credito", banco: "Itaú Empresas", conciliado: true, matchSugerido: "Fatura Solar #1042" },
  { id: "tx_2", data: "05/09/2026", descricao: "PIX TRANSF - SILVA IMOVEIS LTDA", documento: "E209384918", valor: 5500, tipo: "credito", banco: "Inter PJ", conciliado: true, matchSugerido: "Comissão Captação #89" },
  { id: "tx_3", data: "06/09/2026", descricao: "DEB AUT - CEMIG DISTRIBUICAO S.A.", documento: "DEB 291039", valor: 840.50, tipo: "debito", banco: "Itaú Empresas", conciliado: false, matchSugerido: "Conta de Energia (CC-04)" },
  { id: "tx_4", data: "06/09/2026", descricao: "PGTO FORNECEDOR - WEG DRIVES", documento: "TED 910293", valor: 28900, tipo: "debito", banco: "Inter PJ", conciliado: false, matchSugerido: "Inversores Fotovoltaicos" },
];

export default function FinanceiroConciliacao() {
  const { user } = useAuth();
  const tenantId = user?.tenant_id || "default";
  const storageKey = `spy_conciliacao_extrato_${tenantId}`;

  const [extrato, setExtrato] = useState<ExtratoItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXTRATO;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(extrato));
    } catch (e) {
      console.error(e);
    }
  }, [extrato, storageKey]);

  const conciliados = extrato.filter(e => e.conciliado).length;
  const pendentes = extrato.filter(e => !e.conciliado).length;

  const handleConciliarAuto = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setExtrato(prev => prev.map(item => ({ ...item, conciliado: true })));
      setIsProcessing(false);
      toast.success("Conciliação bancária por IA concluída! Todas as transações foram correspondidas.");
    }, 1200);
  };

  const handleManualMatch = (id: string) => {
    setExtrato(prev =>
      prev.map(item => (item.id === id ? { ...item, conciliado: true } : item))
    );
    toast.success("Transação conciliada com sucesso!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulating parsing OFX/CSV
    toast.loading(`Processando arquivo "${file.name}"...`, { id: "ofx-import" });
    setTimeout(() => {
      const newItems: ExtratoItem[] = [
        {
          id: "tx_" + Date.now() + "_1",
          data: new Date().toLocaleDateString("pt-BR"),
          descricao: `PIX RECEBIDO - NOVO CLIENTE (${file.name})`,
          documento: "DOC " + Math.floor(100000 + Math.random() * 900000),
          valor: 3200,
          tipo: "credito",
          banco: "Itaú Empresas",
          conciliado: false,
          matchSugerido: "Honorários Recorrentes",
        },
        {
          id: "tx_" + Date.now() + "_2",
          data: new Date().toLocaleDateString("pt-BR"),
          descricao: `TARIFA PACOTE SERVICOS BANCARIOS`,
          documento: "DEB " + Math.floor(100000 + Math.random() * 900000),
          valor: 89.90,
          tipo: "debito",
          banco: "Itaú Empresas",
          conciliado: false,
          matchSugerido: "Despesas Bancárias (CC-04)",
        }
      ];

      setExtrato(prev => [...newItems, ...prev]);
      toast.success(`Arquivo OFX "${file.name}" importado! 2 novas transações identificadas.`, { id: "ofx-import" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 1000);
  };

  return (
    <PageContainer
      title="Conciliação Bancária & OFX"
      description="Importe extratos OFX/Excel e concilie automaticamente transações bancárias com o sistema."
      actions={
        <Button
          onClick={handleConciliarAuto}
          disabled={isProcessing || pendentes === 0}
          className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs bg-[var(--color-primary-blue)] text-white hover:opacity-95"
        >
          <Sparkles className="w-3.5 h-3.5" /> {isProcessing ? "Processando..." : "Conciliar Automaticamente (IA)"}
        </Button>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 bg-[var(--color-surface)] border border-emerald-500/25 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Lançamentos Conciliados
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500">{conciliados}</div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Conferidos e sincronizados com extrato</p>
        </Card>

        <Card className="p-5 bg-[var(--color-surface)] border border-amber-500/25 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Pendentes de Match
            </span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">{pendentes}</div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Aguardando conferência ou aceite por IA</p>
        </Card>

        <Card className="p-5 bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Contas Bancárias Integradas
            </span>
            <Building2 className="w-5 h-5 text-[var(--color-primary-blue)]" />
          </div>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">2</div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Itaú Empresas & Inter PJ Conectados</p>
        </Card>
      </div>

      {/* Upload Zone */}
      <div className="p-8 border-2 border-dashed border-[var(--color-border-default)] rounded-2xl bg-[var(--color-surface)] text-center mb-6 hover:border-[var(--color-primary-blue)] transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".ofx,.csv,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Upload className="w-10 h-10 mx-auto mb-2 text-[var(--color-primary-blue)] opacity-80" />
        <h4 className="text-xs font-bold text-[var(--color-text-primary)] mb-1">Importar Arquivo OFX ou Extrato CSV</h4>
        <p className="text-[11px] text-[var(--color-text-muted)] mb-3">
          Selecione seu extrato bancário oficial para importação e conciliação instantânea.
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          Selecionar Arquivo OFX / CSV
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
            Movimentações do Extrato Bancário
          </h4>
          <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
            {conciliados} de {extrato.length} conciliadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/60 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="px-5 py-3">Data</th>
                <th className="px-4 py-3">Banco</th>
                <th className="px-5 py-3">Descrição do Lançamento</th>
                <th className="px-4 py-3">Match Sugerido (Sistema)</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-5 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {extrato.map(item => (
                <tr key={item.id} className="hover:bg-[var(--color-surface-sunken)]/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[var(--color-text-muted)]">{item.data}</td>
                  <td className="px-4 py-3.5 font-medium text-[var(--color-text-primary)]">{item.banco}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-[var(--color-text-primary)] block">{item.descricao}</span>
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{item.documento}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {item.matchSugerido ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-primary)] bg-[var(--color-surface-sunken)] px-2 py-0.5 rounded-lg border border-[var(--color-border-subtle)]">
                        <Sparkles className="w-3 h-3 text-amber-500" /> {item.matchSugerido}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--color-text-muted)]">Nenhum match automático</span>
                    )}
                  </td>
                  <td className={`px-4 py-3.5 text-right font-mono font-bold ${
                    item.tipo === "credito" ? "text-emerald-500" : "text-rose-500"
                  }`}>
                    {item.tipo === "credito" ? "+ " : "- "}
                    R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {item.conciliado ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <Check className="w-3 h-3" /> Conciliado
                      </span>
                    ) : (
                      <button
                        onClick={() => handleManualMatch(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-[var(--color-primary-blue)] hover:opacity-90 text-white text-[11px] font-bold transition-all inline-flex items-center gap-1"
                      >
                        Aprovar Match
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
