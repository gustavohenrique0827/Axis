import { useState } from "react";
import { ArrowRight, Calculator, Check, Sparkles, TrendingUp, DollarSign } from "lucide-react";
import { Section, Kicker, SectionTitle, Lede, GlassCard, ThemedCTAButton, FONT_DISPLAY, FONT_MONO } from "./shared";
import { useLpTheme } from "./theme/LpThemeContext";

export function CalculadoraROISection({ onCta }: { onCta: () => void }) {
  const { theme, glow } = useLpTheme();

  const [leads, setLeads] = useState(250);
  const [ticket, setTicket] = useState(2500);
  const [conversionRate, setConversionRate] = useState(8);

  // Cálculos de impacto
  // Sem automação rápida, estima-se que ~35% dos leads esfriam por demora ou falta de follow-up
  const currentDeals = Math.round((leads * conversionRate) / 100);
  const currentRevenue = currentDeals * ticket;

  // Com SDR IA respondendo em <20s + rodízio + follow-up sistemático:
  // aumento conservador de +30% na taxa de conversão
  const improvedRate = conversionRate * 1.35;
  const newDeals = Math.round((leads * improvedRate) / 100);
  const additionalDeals = Math.max(newDeals - currentDeals, 1);
  const recoveredMonthly = additionalDeals * ticket;
  const recoveredAnnual = recoveredMonthly * 12;

  const formatBRL = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <Section id="calculadora" className="bg-white relative overflow-hidden" glow>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Kicker>Simulador de Impacto Financeiro</Kicker>
          <SectionTitle className="text-3xl sm:text-4xl lg:text-5xl mb-4">
            Quanto dinheiro sua empresa deixa na mesa todo mês?
          </SectionTitle>
          <Lede className="max-w-2xl mx-auto text-base sm:text-lg">
            A maioria dos negócios perde até 40% das vendas simplesmente porque o lead demora mais de 5 minutos
            para ser atendido ou não recebe o follow-up no momento certo.
          </Lede>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Sliders de Entrada */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-7 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Calculator className="w-5 h-5 text-slate-700" />
              <h4 className="text-base font-bold text-slate-900" style={{ fontFamily: FONT_DISPLAY }}>
                Parâmetros da sua Operação
              </h4>
            </div>

            {/* Slider 1: Leads/mês */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Leads recebidos por mês:
                </label>
                <span
                  className="px-3 py-1 rounded-lg text-sm font-black bg-white border border-slate-300 text-slate-900 shadow-sm"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {leads.toLocaleString("pt-BR")} leads
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="2500"
                step="10"
                value={leads}
                onChange={(e) => setLeads(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>30 leads</span>
                <span>1.000 leads</span>
                <span>2.500 leads</span>
              </div>
            </div>

            {/* Slider 2: Ticket Médio */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ticket Médio por Venda:
                </label>
                <span
                  className="px-3 py-1 rounded-lg text-sm font-black bg-white border border-slate-300 text-slate-900 shadow-sm"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {formatBRL(ticket)}
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="25000"
                step="100"
                value={ticket}
                onChange={(e) => setTicket(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>R$ 200</span>
                <span>R$ 10.000</span>
                <span>R$ 25.000+</span>
              </div>
            </div>

            {/* Slider 3: Taxa de conversão atual */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Taxa de Conversão Atual Estimada:
                </label>
                <span
                  className="px-3 py-1 rounded-lg text-sm font-black bg-white border border-slate-300 text-slate-900 shadow-sm"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {conversionRate}%
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="1"
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>2% (baixa)</span>
                <span>8% (média)</span>
                <span>25% (alta)</span>
              </div>
            </div>
          </div>

          {/* Resultado do Cálculo em Modo Claro */}
          <div
            className="lg:col-span-5 flex flex-col h-full justify-between p-7 sm:p-9 rounded-3xl bg-white text-slate-900 shadow-xl relative overflow-hidden border-2"
            style={{ borderColor: `${theme.primary}55` }}
          >
            {/* Glow sutil */}
            <div
              className="absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: theme.primary }}
            />

            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-6"
                style={{
                  background: `${theme.primary}18`,
                  borderColor: `${theme.primary}40`,
                  color: theme.primaryDark,
                }}
              >
                <Sparkles className="w-3 h-3" style={{ color: theme.primaryDark }} />
                Receita Adicional Estimada
              </div>

              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Potencial de recuperação mensal:
              </p>
              <div
                className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2"
                style={{ color: theme.primaryDark, fontFamily: FONT_DISPLAY }}
              >
                +{formatBRL(recoveredMonthly)}
                <span className="text-base text-slate-500 font-medium">/mês</span>
              </div>

              <p className="text-xs text-slate-600 mb-6 font-mono">
                Ou <strong className="text-slate-900 font-bold">+{formatBRL(recoveredAnnual)}</strong> em faturamento novo ao ano com +{additionalDeals} clientes fechados todo mês.
              </p>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Primeiro contato com o lead em menos de 20 segundos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Rodízio inteligente direto para os vendedores disponíveis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Follow-up automatizado de leads que pararam de responder</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <ThemedCTAButton
                onClick={onCta}
                className="w-full py-4 text-sm font-bold shadow-lg"
              >
                Recuperar Essa Receita Agora <ArrowRight className="w-4 h-4 ml-1" />
              </ThemedCTAButton>
              <p className="text-[10px] text-center text-slate-500 mt-2.5">
                Implantação assistida pela equipe técnica sem interromper sua operação.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
