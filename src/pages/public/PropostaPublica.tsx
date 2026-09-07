import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FileText,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Download,
  MessageCircle,
  CreditCard,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { fetchPublicProposal, PublicProposal } from "../../lib/publicProposal";
import { handleDownloadPdf } from "../crm/utils/proposalPdf";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

function formatMoney(v: number | null | undefined) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(v: string | null | undefined) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return v;
  }
}

export default function PropostaPublica() {
  const { token } = useParams<{ token: string }>();
  const [proposta, setProposta] = useState<PublicProposal | null | undefined>(undefined);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      setProposta(null);
      return;
    }
    fetchPublicProposal(token).then((data) => {
      setProposta(data);
      if (data?.status === "Aceita") {
        setIsAccepted(true);
      }
    });
  }, [token]);

  if (proposta === undefined) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-mono tracking-wider uppercase">
          Carregando proposta comercial autenticada...
        </p>
      </div>
    );
  }

  if (!proposta) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md bg-[#13161f] border border-white/10 rounded-3xl shadow-2xl">
          <AlertTriangle className="w-14 h-14 text-amber-500 mx-auto mb-4 opacity-80" />
          <h1 className="text-xl font-black text-white mb-2">Proposta não encontrada</h1>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            O link acessado pode ter expirado, estar incorreto ou a proposta foi reemitida com novos termos. Entre em contato com o seu consultor para obter a versão atualizada.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="text-xs h-9"
          >
            Tentar Novamente
          </Button>
        </Card>
      </div>
    );
  }

  const isVencida = proposta.validade ? new Date(proposta.validade) < new Date() : false;

  const handleAcceptProposal = () => {
    setIsAccepting(true);
    setTimeout(() => {
      setIsAccepted(true);
      setIsAccepting(false);
      toast.success("🎉 Proposta Aceita com Sucesso!", {
        description: "Seu consultor comercial já foi notificado para darmos início à implantação.",
        duration: 8000,
      });
    }, 600);
  };

  const handleDownloadDocPdf = () => {
    handleDownloadPdf(
      {
        id: `prop-${token?.slice(0, 8) || "public"}`,
        cliente: proposta.cliente || "Cliente",
        titulo: proposta.titulo,
        valor: proposta.valor || 0,
        vendedor: "Consultoria Axis S.P.Y.",
        validade: proposta.validade || undefined,
        status: isAccepted ? "Aceita" : (proposta.status as any) || "Enviada",
        tipo: "texto",
        conteudo_texto: proposta.conteudoTexto,
      },
      proposta.itens?.map((i) => ({
        product_name: i.productName,
        quantidade: i.quantidade,
        preco_unitario: i.precoUnitario,
      })) || []
    );
    toast.success("PDF do contrato gerado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 font-sans selection:bg-blue-600 selection:text-white pb-16">
      {/* ── TOP NAV INSTITUCIONAL ── */}
      <header className="sticky top-0 z-30 bg-[#0f1118]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30">
              A
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-white uppercase block">
                AXIS S.P.Y. BUSINESS
              </span>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-emerald-400" /> Documento Autenticado
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadDocPdf}
              className="text-xs gap-1.5 h-8 border-white/10 hover:bg-white/5 text-slate-300"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" /> Baixar PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs gap-1.5 h-8 border-white/10 hover:bg-white/5 text-slate-300 hidden sm:inline-flex"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </Button>
          </div>
        </div>
      </header>

      {/* ── CORPO PRINCIPAL DA PROPOSTA ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* BANNER DE ACEITE REALIZADO */}
        {isAccepted && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wide">
                Proposta Aprovada pelo Cliente
              </h4>
              <p className="text-[11px] text-slate-300">
                O aceite comercial foi formalizado. A equipe executiva já iniciou os preparativos de implantação.
              </p>
            </div>
          </div>
        )}

        {/* CARTÃO PRINCIPAL DA PROPOSTA */}
        <Card className="p-6 sm:p-10 bg-[#12141c] border border-white/[0.08] rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Luz de fundo decorativa */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* CABEÇALHO DO DOCUMENTO */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold">
                  Proposta Comercial Oficial
                </span>
                {isVencida && !isAccepted && (
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                    Vencida
                  </span>
                )}
                {isAccepted && (
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Aprovada
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {proposta.titulo}
              </h1>

              {proposta.cliente && (
                <p className="text-xs text-slate-400">
                  Apresentada exclusivamente para: <strong className="text-slate-200">{proposta.cliente}</strong>
                </p>
              )}
            </div>

            <div className="text-left sm:text-right space-y-1 text-xs text-slate-400">
              <p>
                Emissão: <span className="font-semibold text-white">{formatDate(proposta.criadaEm)}</span>
              </p>
              <p className="flex items-center sm:justify-end gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                Válida até: <span className="font-semibold text-white">{formatDate(proposta.validade)}</span>
              </p>
            </div>
          </div>

          {/* CARDS COM MÉTRICAS DE INVESTIMENTO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            <div className="bg-[#181a24] p-5 rounded-2xl border border-white/[0.06]">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Investimento Total
              </span>
              <p className="text-2xl font-mono font-black text-emerald-400">
                {formatMoney(proposta.valor)}
              </p>
              <span className="text-[10px] text-slate-500 block mt-1">
                Condições e formas de pagamento descritas abaixo
              </span>
            </div>

            <div className="bg-[#181a24] p-5 rounded-2xl border border-white/[0.06]">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Validade Comercial
              </span>
              <p className="text-sm font-bold text-white mt-1">
                {formatDate(proposta.validade)}
              </p>
              <span className="text-[10px] text-slate-500 block mt-1">
                Condições garantidas durante o período
              </span>
            </div>

            <div className="bg-[#181a24] p-5 rounded-2xl border border-white/[0.06]">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Status da Proposta
              </span>
              <p className="text-sm font-bold text-blue-400 mt-1 uppercase">
                {isAccepted ? "Aceita & Formalizada" : proposta.status || "Enviada"}
              </p>
              <span className="text-[10px] text-slate-500 block mt-1">
                {isAccepted ? "Pronta para execução" : "Aguardando confirmação"}
              </span>
            </div>
          </div>

          {/* ESCOPO DE FORNECIMENTO (TABELA DE ITENS) */}
          {proposta.itens && proposta.itens.length > 0 && (
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  Escopo de Fornecimento & Soluções
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {proposta.itens.length} {proposta.itens.length === 1 ? "item contratado" : "itens contratados"}
                </span>
              </div>

              <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-[#161822]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/[0.03] text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Item / Descrição</th>
                      <th className="py-3 px-3 text-center">Quantidade</th>
                      <th className="py-3 px-3 text-right">Valor Unitário</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-slate-200">
                    {proposta.itens.map((item, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">
                          {item.productName}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {item.quantidade}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-400">
                          {formatMoney(item.precoUnitario)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          {formatMoney(item.precoUnitario * item.quantidade)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-white/[0.02] border-t-2 border-white/[0.08] font-bold">
                    <tr>
                      <td colSpan={3} className="py-3.5 px-4 text-right uppercase text-[11px] text-slate-400">
                        Total do Fornecimento:
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-base font-black text-emerald-400">
                        {formatMoney(proposta.valor)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* DIRETRIZES E TERMOS CONTRATUAIS */}
          {proposta.conteudoTexto && (
            <div className="space-y-3 pt-6 border-t border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Diretrizes, Cláusulas e Termos Contratuais
                </h3>
              </div>

              <div className="p-6 rounded-2xl bg-[#161822] border border-white/[0.08] text-xs text-slate-300 leading-relaxed whitespace-pre-wrap text-justify">
                {proposta.conteudoTexto}
              </div>
            </div>
          )}

          {/* AÇÕES DE ACEITE DIGITAL */}
          <div className="mt-10 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white mb-0.5">
                Pronto para dar o próximo passo?
              </p>
              <p className="text-[11px] text-slate-400">
                A formalização digital assegura o início imediato dos trabalhos e a garantia dos valores propostos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isAccepted ? (
                <Button
                  type="button"
                  size="lg"
                  disabled={isAccepting || isVencida}
                  onClick={handleAcceptProposal}
                  className="w-full sm:w-auto text-xs font-black uppercase tracking-wider h-11 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/25 cursor-pointer disabled:opacity-40"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isAccepting ? "Registrando Aceite..." : "Aceitar Proposta Comercial"}
                </Button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Proposta Aceita com Sucesso
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* RODAPÉ INSTITUCIONAL */}
        <div className="text-center pt-4 space-y-1">
          <p className="text-[11px] text-slate-500">
            Documento gerado e autenticado por <strong className="text-blue-400">AXIS S.P.Y. BUSINESS SUITE</strong>
          </p>
          <p className="text-[10px] text-slate-600">
            Todos os direitos reservados. Em conformidade com a MP nº 2.200-2/2001 e a LGPD (Lei nº 13.709/2018).
          </p>
        </div>
      </main>
    </div>
  );
}
