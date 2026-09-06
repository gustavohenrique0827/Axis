import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FileText, Calendar, Building2, AlertTriangle } from "lucide-react";
import { Card } from "../../components/ui/card";
import { fetchPublicProposal, PublicProposal } from "../../lib/publicProposal";

function formatMoney(v: number | null | undefined) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(v: string | null | undefined) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("pt-BR");
  } catch {
    return v;
  }
}

export default function PropostaPublica() {
  const { token } = useParams<{ token: string }>();
  const [proposta, setProposta] = useState<PublicProposal | null | undefined>(undefined);

  useEffect(() => {
    if (!token) {
      setProposta(null);
      return;
    }
    fetchPublicProposal(token).then(setProposta);
  }, [token]);

  if (proposta === undefined) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center">
        <div className="text-slate-500 text-sm">Carregando proposta...</div>
      </div>
    );
  }

  if (!proposta) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-14 h-14 text-amber-500 mx-auto mb-4 opacity-70" />
          <h1 className="text-xl font-black text-white mb-2">Proposta não encontrada</h1>
          <p className="text-slate-500 text-sm">
            O link acessado pode estar incorreto ou a proposta pode ter sido removida. Entre em contato com quem enviou este link.
          </p>
        </div>
      </div>
    );
  }

  const isVencida = proposta.validade ? new Date(proposta.validade) < new Date() : false;

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-8 text-slate-500">
          <Building2 className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest">Proposta Comercial</span>
        </div>

        <Card className="p-6 sm:p-8 bg-[var(--color-surface-elevated)]/60 border border-white/10 rounded-3xl mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-white/10">
            <div>
              <h1 className="text-2xl font-black text-white mb-1">{proposta.titulo}</h1>
              {proposta.cliente && <p className="text-sm text-slate-400">Para: {proposta.cliente}</p>}
            </div>
            {isVencida && (
              <span className="self-start px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                Proposta vencida
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-xs">
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-black mb-1">Valor</p>
              <p className="text-lg font-black text-emerald-400">{formatMoney(proposta.valor)}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-black mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Válida até
              </p>
              <p className="text-sm font-bold text-white">{formatDate(proposta.validade)}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-black mb-1">Status</p>
              <p className="text-sm font-bold text-white">{proposta.status || "—"}</p>
            </div>
          </div>

          {proposta.itens.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Itens
              </p>
              <div className="divide-y divide-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {proposta.itens.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 text-xs bg-white/[0.02]">
                    <span className="text-white font-semibold">{item.productName} <span className="text-slate-500 font-normal">x{item.quantidade}</span></span>
                    <span className="text-slate-300 font-mono">{formatMoney(item.precoUnitario * item.quantidade)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {proposta.conteudoTexto && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{proposta.conteudoTexto}</p>
            </div>
          )}
        </Card>

        <p className="text-center text-[11px] text-slate-600">Proposta gerada por <span className="text-blue-500 font-bold">S.P.Y. CRM</span></p>
      </div>
    </div>
  );
}
