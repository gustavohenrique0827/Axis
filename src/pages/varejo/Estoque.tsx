import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Boxes, ArrowUpCircle, ArrowDownCircle, Settings2, History } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { FormField } from "../../components/ui/form-field";
import { EmptyState } from "../../components/ui/empty-state";
import { useData } from "../../contexts/DataContext";
import { supabase } from "../../lib/supabase";

type Tipo = "entrada" | "saida" | "ajuste";

interface Movimentacao {
  id: string;
  product_id: string;
  tipo: Tipo | "venda";
  quantidade: number;
  motivo: string | null;
  created_at: string;
}

export default function VarejoEstoque() {
  const { products } = useData();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [tipo, setTipo] = useState<Tipo>("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);
  const [historico, setHistorico] = useState<Movimentacao[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);

  const fetchHistorico = () => {
    if (!supabase) return;
    setLoadingHistorico(true);
    supabase
      .from("estoque_movimentacoes")
      .select("id, product_id, tipo, quantidade, motivo, created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!error) setHistorico(data || []);
        setLoadingHistorico(false);
      });
  };

  useEffect(() => { fetchHistorico(); }, []);

  const produtoNome = (productId: string) => products.find((p: any) => p.id === productId)?.name || "Produto removido";

  const handleRegistrar = async () => {
    if (!supabase) { toast.error("Conexão com o banco indisponível."); return; }
    if (!selectedProductId) { toast.error("Selecione um produto."); return; }
    const qtd = Number(quantidade);
    if (!qtd || qtd <= 0) { toast.error("Informe uma quantidade válida."); return; }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc("registrar_movimentacao_estoque", {
        p_product_id: selectedProductId, p_tipo: tipo, p_quantidade: qtd, p_motivo: motivo || null,
      });
      if (error) throw new Error(error.message);
      toast.success(`Estoque atualizado — novo saldo: ${data?.novo_estoque ?? "?"} unidades.`);
      setQuantidade("");
      setMotivo("");
      fetchHistorico();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao registrar movimentação.");
    } finally {
      setSaving(false);
    }
  };

  const tipoLabel: Record<string, { label: string; color: string }> = {
    entrada: { label: "Entrada", color: "text-emerald-500" },
    saida: { label: "Saída", color: "text-red-500" },
    ajuste: { label: "Ajuste", color: "text-amber-500" },
    venda: { label: "Venda", color: "text-blue-500" },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--color-text-primary)] flex items-center gap-2.5">
          Movimentação de Estoque <Boxes className="w-5 h-5 text-[var(--color-primary-blue)]" />
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Registre entradas, saídas e ajustes manuais de estoque. Vendas baixam o estoque automaticamente e aparecem aqui como "Venda".
        </p>
      </div>

      <Card className="p-6 space-y-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Produto" required>
            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs font-bold text-[var(--color-text-primary)] h-10">
              <option value="">Selecione...</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} — {p.currentStock ?? 0} em estoque</option>
              ))}
            </select>
          </FormField>
          <FormField label="Tipo de Movimentação" required>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)}
              className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-[var(--radius-control)] px-3 py-2 text-xs font-bold text-[var(--color-text-primary)] h-10">
              <option value="entrada">Entrada (adiciona ao estoque)</option>
              <option value="saida">Saída (remove do estoque)</option>
              <option value="ajuste">Ajuste (define o saldo exato)</option>
            </select>
          </FormField>
          <FormField label={tipo === "ajuste" ? "Novo saldo (valor absoluto)" : "Quantidade"} required>
            <Input type="number" min={0} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="0" />
          </FormField>
          <FormField label="Motivo (opcional)">
            <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex: reposição, inventário, avaria..." />
          </FormField>
        </div>
        <Button onClick={handleRegistrar} loading={saving} className="w-full sm:w-auto font-bold text-xs gap-2">
          {tipo === "entrada" && <ArrowUpCircle className="w-4 h-4" />}
          {tipo === "saida" && <ArrowDownCircle className="w-4 h-4" />}
          {tipo === "ajuste" && <Settings2 className="w-4 h-4" />}
          Registrar Movimentação
        </Button>
      </Card>

      <Card className="p-5 space-y-4 bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <History className="w-4 h-4" /> Histórico Recente
        </h3>
        {loadingHistorico ? (
          <p className="text-xs text-[var(--color-text-faint)] text-center py-6">Carregando...</p>
        ) : historico.length === 0 ? (
          <EmptyState icon={History} title="Nenhuma movimentação registrada" description="As movimentações de estoque aparecerão aqui." className="py-8" />
        ) : (
          <div className="space-y-2">
            {historico.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs bg-[var(--color-surface-sunken)] p-3 rounded-[var(--radius-control)]">
                <div>
                  <span className={`font-bold ${tipoLabel[m.tipo]?.color || ""}`}>{tipoLabel[m.tipo]?.label || m.tipo}</span>
                  <span className="text-[var(--color-text-muted)]"> — {produtoNome(m.product_id)}</span>
                  {m.motivo && <span className="text-[var(--color-text-faint)]"> ({m.motivo})</span>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-mono font-bold ${m.quantidade < 0 ? "text-red-500" : "text-emerald-500"}`}>{m.quantidade > 0 ? "+" : ""}{m.quantidade}</span>
                  <span className="text-[var(--color-text-faint)]">{new Date(m.created_at).toLocaleString("pt-BR")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
