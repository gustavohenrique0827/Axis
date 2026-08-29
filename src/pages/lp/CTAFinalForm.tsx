import { forwardRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Section, Kicker, SectionTitle, FadeIn, FONT_DISPLAY } from "./shared";

const labelClass = "text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2";
const inputClass =
  "w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-400/50 focus:bg-white/[0.05] transition-all";

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
            <span className="text-slate-500">Comece a operar suas oportunidades.</span>
          </SectionTitle>
          <p className="text-slate-400 text-base sm:text-lg mb-2">
            Descubra como o Axis pode trabalhar dentro da sua operação comercial.
          </p>
        </div>
      </Section>

      <Section id="formulario" bordered={false} className="pt-0 pb-28 sm:pb-36">
        <FadeIn className="max-w-xl mx-auto">
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.025] backdrop-blur-sm p-7 sm:p-10 shadow-[0_0_80px_-30px_rgba(59,130,246,0.3)]">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: FONT_DISPLAY }}>
                  Recebemos seu pedido.
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                  Agora queremos entender melhor sua operação para mostrar onde o Axis pode gerar mais valor.
                </p>
              </div>
            ) : (
              <>
                <Kicker>Vamos conversar</Kicker>
                <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: FONT_DISPLAY }}>
                  Vamos entender sua operação.
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nome *</label>
                      <input value={data.nome} onChange={set("nome")} className={`${inputClass} ${errors.nome ? "border-rose-500/60" : ""}`} placeholder="Seu nome" />
                    </div>
                    <div>
                      <label className={labelClass}>Empresa *</label>
                      <input value={data.empresa} onChange={set("empresa")} className={`${inputClass} ${errors.empresa ? "border-rose-500/60" : ""}`} placeholder="Nome da empresa" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>WhatsApp *</label>
                      <input value={data.whatsapp} onChange={set("whatsapp")} className={`${inputClass} ${errors.whatsapp ? "border-rose-500/60" : ""}`} placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className={labelClass}>E-mail *</label>
                      <input type="email" value={data.email} onChange={set("email")} className={`${inputClass} ${errors.email ? "border-rose-500/60" : ""}`} placeholder="voce@empresa.com" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Quantidade aproximada de leads por mês</label>
                    <select value={data.volumeLeads} onChange={set("volumeLeads")} className={inputClass}>
                      <option value="" className="bg-[#0b0c10]">Selecione</option>
                      <option value="ate_50" className="bg-[#0b0c10]">Até 50</option>
                      <option value="50_200" className="bg-[#0b0c10]">50 a 200</option>
                      <option value="200_500" className="bg-[#0b0c10]">200 a 500</option>
                      <option value="500_mais" className="bg-[#0b0c10]">Mais de 500</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Principal desafio comercial</label>
                    <input value={data.desafio} onChange={set("desafio")} className={inputClass} placeholder="Ex: leads esfriando, follow-up manual..." />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 py-4 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-100 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] disabled:opacity-70 flex items-center justify-center gap-2"
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
