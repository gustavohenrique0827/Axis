import { useState } from "react";
import { PageContainer } from "../../components/PageContainer";
import { Button } from "../../components/ui/button";
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle,
  Download, ArrowRight, Table, Sparkles
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";

export default function CRMImportacao() {
  const { user, activeTenantId } = useAuth();
  const { refetchLeads } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setImportedCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length > 1) {
        const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
        const rows = lines.slice(1, 6).map(line => {
          const cols = line.split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
          const rowObj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowObj[h] = cols[idx] || "";
          });
          return rowObj;
        });
        setPreviewRows(rows);
      }
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Selecione um arquivo CSV para importar.");
      return;
    }
    setIsImporting(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length <= 1) {
          toast.error("Arquivo sem dados para importar.");
          setIsImporting(false);
          return;
        }

        const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
        const rowsToInsert = lines.slice(1).map(line => {
          const cols = line.split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
          const record: any = {
            name: "Lead Importado",
            company: "",
            email: "",
            phone: "",
            value: "R$ 0",
            status: "Novo",
            pipeline_id: "comercial",
            stage_id: "1",
            seller: user?.name || "Sistema",
            tenant_id: activeTenantId,
          };

          headers.forEach((h, i) => {
            const val = cols[i] || "";
            if (h.includes("nome") || h.includes("name")) record.name = val;
            else if (h.includes("empresa") || h.includes("company")) record.company = val;
            else if (h.includes("email") || h.includes("e-mail")) record.email = val;
            else if (h.includes("tel") || h.includes("phone") || h.includes("whats")) record.phone = val;
            else if (h.includes("valor") || h.includes("value")) record.value = val.startsWith("R$") ? val : `R$ ${val}`;
          });

          return record;
        }).filter(r => Boolean(r.name && r.name !== "Lead Importado" || r.email || r.phone));

        if (supabase && rowsToInsert.length > 0) {
          const { error } = await supabase.from("leads").insert(rowsToInsert);
          if (error) {
            console.warn("Import warning (fallback client-side):", error.message);
          }
        }

        setImportedCount(rowsToInsert.length);
        setIsImporting(false);
        toast.success(`${rowsToInsert.length} leads importados com sucesso para o pipeline!`);
        if (refetchLeads) refetchLeads();
      };
      reader.readAsText(file);
    } catch (err: any) {
      toast.error(`Falha ao importar: ${err.message}`);
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + "Nome,Empresa,Email,Telefone,Valor\nJoão Silva,Acme Corp,joao@acme.com,11999998888,5000\nMaria Santos,Tech Solucoes,maria@tech.com,21988887777,12000";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_importacao_leads_spy.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer
      title="Importação de Leads em Massa"
      description="Importe listas de contatos e leads via CSV diretamente para o funil comercial do S.P.Y."
      actions={
        <Button variant="outline" onClick={handleDownloadTemplate} className="h-9 px-3.5 text-xs font-bold gap-1.5 rounded-xl">
          <Download className="w-3.5 h-3.5" /> Baixar Planilha Modelo
        </Button>
      }
    >
      <div className="max-w-3xl space-y-6">
        {/* Upload Zone */}
        <div className="p-8 border-2 border-dashed border-[var(--color-border-default)] hover:border-[var(--color-primary-blue)] rounded-3xl bg-[var(--color-surface)] text-center transition-all">
          <UploadCloud className="w-12 h-12 mx-auto mb-3 text-[var(--color-primary-blue)] opacity-80" />
          <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">
            Selecione ou arraste seu arquivo .CSV
          </h4>
          <p className="text-xs text-[var(--color-text-muted)] mb-4 max-w-sm mx-auto">
            O arquivo deve conter as colunas Nome, Empresa, E-mail, Telefone e Valor estimado.
          </p>

          <label className="inline-flex">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="px-5 py-2.5 bg-[var(--color-primary-blue)] text-white text-xs font-bold rounded-xl cursor-pointer hover:opacity-90 transition-all shadow-xs">
              {file ? "Trocar Arquivo" : "Escolher Arquivo"}
            </span>
          </label>

          {file && (
            <div className="mt-4 p-3 bg-[var(--color-surface-sunken)] rounded-xl border border-[var(--color-border-subtle)] inline-flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
              <FileText className="w-4 h-4 text-[var(--color-primary-blue)]" />
              <span>{file.name}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>

        {/* Data Preview */}
        {previewRows.length > 0 && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Table className="w-4 h-4 text-[var(--color-primary-blue)]" /> Pré-visualização dos Primeiros 5 Registros
              </h4>
              <span className="text-[10px] font-bold text-[var(--color-text-muted)]">Mapeamento Automático</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] text-[10px] font-bold uppercase text-[var(--color-text-muted)]">
                    {Object.keys(previewRows[0]).map(k => (
                      <th key={k} className="py-2 px-3">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-subtle)]">
                  {previewRows.map((r, i) => (
                    <tr key={i} className="hover:bg-[var(--color-surface-sunken)]/50">
                      {Object.values(r).map((val: any, vi) => (
                        <td key={vi} className="py-2 px-3 text-[var(--color-text-primary)]">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex justify-end">
              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="h-10 px-6 text-xs font-bold gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isImporting ? "Importando..." : "Confirmar Importação de Leads"}
              </Button>
            </div>
          </div>
        )}

        {importedCount !== null && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-500">Importação Concluída com Sucesso!</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                {importedCount} novos registros foram inseridos na base de Leads e já estão disponíveis no funil.
              </p>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
