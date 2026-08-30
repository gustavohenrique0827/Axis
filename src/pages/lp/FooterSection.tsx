import { FONT_DISPLAY } from "./shared";

export function FooterSection() {
  return (
    <footer className="border-t border-slate-200 px-5 sm:px-8 py-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-2">
            <div className="w-7 h-7 flex items-center justify-center">
              <img src="/logo-icon.png" alt="Axis" className="w-full h-full object-contain" />
            </div>
            <span className="text-slate-900 font-bold" style={{ fontFamily: FONT_DISPLAY }}>AXIS</span>
          </div>
          <p className="text-[11px] text-slate-500">Sistema Operacional de Oportunidades Comerciais.</p>
          <p className="text-[11px] text-slate-400 italic mt-0.5">Encontra. Entende. Age. Converte.</p>
        </div>

        <div className="flex items-center gap-6 text-[12px] font-medium text-slate-500">
          <a href="#" className="hover:text-slate-900 transition-colors">Privacidade</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Termos</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Contato</a>
        </div>
      </div>
    </footer>
  );
}
