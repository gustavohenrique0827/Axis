import { forwardRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, FONT_DISPLAY } from "./shared";

const labelClass = "text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2";
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
      <Section id="cta-final" bordered={false} className="pt-24 sm:pt-32">
        <div className="text-center max-w-3xl mx-auto">
          <SectionTitle as="h2" className="text-3xl sm:text-5xl lg:text-6xl mb-6">
            Pare de apenas administrar seus leads.
            <br />
            <span className="text-slate-400">Comece a operar suas oportunidades.</span>
          </SectionTitle>
          <p className="text-slate-500 text-base sm:text-lg mb-2">
            Descubra como o Axis pode trabalhar dentro da sua operação comercial.
          </p>
        </div>
      </Section>

      <Section id="formulario" bordered={false} className="pt-0 pb-28 sm:pb-36">
        <FadeIn className="relative max-w-xl mx-auto">
          <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-blue-500/10 to-violet-500/10 blur-3xl" />
          <div className="relative rounded-2xl border border-slate-200 bg-white p-7 sm:p-10 shadow-xl shadow-blue-500/5">
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
                <Kicker>Vamos conversar</Kicker>
                <h3 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: FONT_DISPLAY }}>
                  Vamos entender sua operação.
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nome *</label>
                      <input value={data.nome} onChange={set("nome")} className={`${inputClass} ${errors.nome ? "border-rose-400" : ""}`} placeholder="Seu nome" />
                    </div>
                    <div>
                      <label className={labelClass}>Empresa *</label>
                      <input value={data.empresa} onChange={set("empresa")} className={`${inputClass} ${errors.empresa ? "border-rose-400" : ""}`} placeholder="Nome da empresa" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>WhatsApp *</label>
                      <input value={data.whatsapp} onChange={set("whatsapp")} className={`${inputClass} ${errors.whatsapp ? "border-rose-400" : ""}`} placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className={labelClass}>E-mail *</label>
                      <input type="email" value={data.email} onChange={set("email")} className={`${inputClass} ${errors.email ? "border-rose-400" : ""}`} placeholder="voce@empresa.com" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Quantidade aproximada de leads por mês</label>
                    <select value={data.volumeLeads} onChange={set("volumeLeads")} className={inputClass}>
                      <option value="">Selecione</option>
                      <option value="ate_50">Até 50</option>
                      <option value="50_200">50 a 200</option>
                      <option value="200_500">200 a 500</option>
                      <option value="500_mais">Mais de 500</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Principal desafio comercial</label>
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
      </Section>
    </div>
  );
});
