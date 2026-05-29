import { Outlet, Navigate } from "react-router-dom";

export default function GenericPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-white">Página em Construção</h2>
      <p className="text-sm">Esta funcionalidade estará disponível em breve.</p>
    </div>
  );
}
