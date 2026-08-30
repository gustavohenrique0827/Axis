import { forwardRef, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, Clock, Sparkles } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, PillarBadge, FONT_DISPLAY, FONT_MONO } from "./shared";

const labelStyle = { fontFamily: FONT_MONO };
const labelClass = "text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-2";
const inputClass =
  "w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all";

interface FormState {
  nome: string;
  empresa: string;
  whatsapp: string;
  email: string;
  volumeLeads: string;
  desafio: string;
}

const EMPTY: FormState = { nome: "", empresa: "", whatsapp: "", email: "", volumeLeads: "", desafio: "" };

const TRUST_POINTS = [
  { icon: Sparkles, text: "Conversa consultiva sobre sua operação, sem discurso genérico." },
  { icon: Clock, text: "Resposta em até 1 dia útil." },
  { icon: ShieldCheck, text: "Sem compromisso — você decide o próximo passo." },
];

export const CTAFinalFormSection = forwardRef<HTMLDivElement>(function CTAFinalFormSection(_props, ref) {
  const [data, setData] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setData((d) => ({ ...d, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof FormState, boolean>> = {};
    if (!data.nome.trim()) nextErrors.nome = true;
    if (!data.empresa.trim()) nextErrors.empresa = true;
    if (!data.whatsapp.trim()) nextErrors.whatsapp = true;
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) nextErrors.email = true;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    // Sem backend neste momento — validação client-side + estado local de sucesso.
    // Arquitetura pronta para, futuramente, trocar este setTimeout por uma chamada real.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div ref={ref}>
      <Section id="cta-final" bordered={false} className="pb-28 sm:pb-36 pt-24 sm:pt-32" glow>
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
              <PillarBadge label="Axis" tone="blue" />
              <PillarBadge label="Aurora" tone="emerald" />
            </div>
            <Kicker>Vamos conversar</Kicker>
            <SectionTitle as="h2" className="text-3xl sm:text-5xl lg:text-[3.4rem] mb-6">
              A próxima geração da<br />operação empresarial<br /><span className="text-slate-400">começa aqui.</span>
            </SectionTitle>
            <p className="text-slate-500 text-base sm:text-lg mb-8 max-w-md mx-auto lg:mx-0">
              Conecte sua empresa. Ative sua inteligência. Transforme operação em crescimento.
            </p>
            <div className="space-y-3 max-w-sm mx-auto lg:mx-0">
              {TRUST_POINTS.map((t) => (
                <div key={t.text} className="flex items-start gap-3 text-left">
                  <t.icon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-500">{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          <FadeIn delay={0.1} className="relative">
            <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-blue-500/10 to-violet-500/10 blur-3xl" />
            <div className="relative rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 shadow-xl shadow-blue-500/5">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: FONT_DISPLAY }}>
                    Recebemos seu pedido.
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Agora queremos entender melhor sua operação para mostrar onde o Axis pode gerar mais valor.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: FONT_DISPLAY }}>
                    Vamos entender sua operação.
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass} style={labelStyle}>Nome *</label>
                        <input value={data.nome} onChange={set("nome")} className={`${inputClass} ${errors.nome ? "border-rose-400" : ""}`} placeholder="Seu nome" />
                      </div>
                      <div>
                        <label className={labelClass} style={labelStyle}>Empresa *</label>
                        <input value={data.empresa} onChange={set("empresa")} className={`${inputClass} ${errors.empresa ? "border-rose-400" : ""}`} placeholder="Nome da empresa" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass} style={labelStyle}>WhatsApp *</label>
                        <input value={data.whatsapp} onChange={set("whatsapp")} className={`${inputClass} ${errors.whatsapp ? "border-rose-400" : ""}`} placeholder="(00) 00000-0000" />
                      </div>
                      <div>
                        <label className={labelClass} style={labelStyle}>E-mail *</label>
                        <input type="email" value={data.email} onChange={set("email")} className={`${inputClass} ${errors.email ? "border-rose-400" : ""}`} placeholder="voce@empresa.com" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass} style={labelStyle}>Quantidade aproximada de leads por mês</label>
                      <select value={data.volumeLeads} onChange={set("volumeLeads")} className={inputClass}>
                        <option value="">Selecione</option>
                        <option value="ate_50">Até 50</option>
                        <option value="50_200">50 a 200</option>
                        <option value="200_500">200 a 500</option>
                        <option value="500_mais">Mais de 500</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass} style={labelStyle}>Principal desafio comercial</label>
                      <input value={data.desafio} onChange={set("desafio")} className={inputClass} placeholder="Ex: leads esfriando, follow-up manual..." />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full mt-2 py-4 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/15 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {submitting ? "Enviando..." : "Quero conhecer o Axis"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </Section>
    </div>
  );
});
