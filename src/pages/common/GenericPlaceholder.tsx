import { Outlet, Navigate } from "react-router-dom";

export default function GenericPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-6">
      <div className="w-24 h-24 rounded-3xl bg-[var(--color-premium-black)] border border-slate-700/50 flex items-center justify-center text-blue-500 shadow-2xl relative">
        <div className="absolute inset-0 bg-blue-500/10 rounded-3xl animate-pulse"></div>
        <svg className="w-12 h-12 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-[var(--color-white-text)]">Módulo Temporariamente Indisponível</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Esta área está sendo reestruturada para receber novas funcionalidades e relatórios avançados. Novidades em breve!
        </p>
      </div>
      <button 
        onClick={() => alert("Ação registrada! Você será notificado quando este módulo for lançado.")}
        className="px-6 py-2.5 bg-[var(--color-primary-blue)] hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all active:scale-95"
      >
        Notifique-me do Lançamento
      </button>
    </div>
  );
}
