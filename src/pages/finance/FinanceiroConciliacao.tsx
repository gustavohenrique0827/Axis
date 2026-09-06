import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  CheckCircle2, AlertCircle, RefreshCw, Upload, FileText,
  Building2, ArrowRight, ShieldCheck, Sparkles
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";

export default function FinanceiroConciliacao() {
  const [conciliados, setConciliados] = useState(14);
  const [pendentes, setPendentes] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConciliarAuto = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setConciliados(prev => prev + pendentes);
      setPendentes(0);
      setIsProcessing(false);
      toast.success("Conciliação bancária por IA concluída! 2 lançamentos correspondidos com sucesso.");
    }, 1200);
  };

  return (
    <PageContainer
      title="Conciliação Bancária & OFX"
      description="Importe extratos OFX/Excel e concilie automaticamente transações bancárias com o sistema."
      actions={
        <Button onClick={handleConciliarAuto} disabled={isProcessing || pendentes === 0} className="h-9 px-4 text-xs font-bold gap-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" /> {isProcessing ? "Processando..." : "Conciliar Automaticamente (IA)"}
        </Button>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 bg-[var(--color-surface)] border border-emerald-500/25 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Lançamentos Conciliados</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500">{conciliados}</div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">100% de precisão bancária</p>
        </Card>

        <Card className="p-5 bg-[var(--color-surface)] border border-amber-500/25 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Pendentes de Match</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">{pendentes}</div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Aguardando conferência</p>
        </Card>

        <Card className="p-5 bg-[var(--color-surface)] border border-[var(--color-border-default)] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Contas Bancárias Integradas</span>
            <Building2 className="w-5 h-5 text-[var(--color-primary-blue)]" />
          </div>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">2</div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Itaú Empresas & Inter PJ</p>
        </Card>
      </div>

      {/* Upload Zone */}
      <div className="p-8 border-2 border-dashed border-[var(--color-border-default)] rounded-2xl bg-[var(--color-surface)] text-center mb-6">
        <Upload className="w-10 h-10 mx-auto mb-2 text-[var(--color-primary-blue)] opacity-70" />
        <h4 className="text-xs font-bold text-[var(--color-text-primary)] mb-1">Importar Arquivo OFX ou Extrato CSV</h4>
        <p className="text-[11px] text-[var(--color-text-muted)] mb-3">Arraste seu arquivo OFX bancário para conciliação instantânea.</p>
        <button
          onClick={() => toast.info("Selecione um arquivo OFX para conciliar.")}
          className="px-4 py-2 bg-[var(--color-surface-sunken)] border border-[var(--color-border-default)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] text-xs font-bold rounded-xl transition-all"
        >
          Selecionar Arquivo OFX
        </button>
      </div>
    </PageContainer>
  );
}
