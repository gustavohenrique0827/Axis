import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { FONT_DISPLAY } from "./shared";

const LINKS = [
  { href: "#produto", label: "Produto" },
  { href: "#inteligencia", label: "Aurora" },
  { href: "#sinapse", label: "Sinapse" },
  { href: "#funcionalidades", label: "Recursos" },
  { href: "#segmentos", label: "Para empresas" },
];

export function Navbar({ onCtaClick }: { onCtaClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/85 backdrop-blur-xl border-b border-slate-200 shadow-sm" : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16 sm:h-20">
        <a href="#top" className="flex items-center gap-2.5 shrink-0" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <div className="w-9 h-9 flex items-center justify-center">
            <img src="/logo-icon.png" alt="Axis" className="w-full h-full object-contain" />
          </div>
          <span className="text-slate-900 font-bold text-lg tracking-tight" style={{ fontFamily: FONT_DISPLAY }}>AXIS</span>
        </a>

        <div className="hidden lg:flex items-center gap-8">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <button onClick={onCtaClick} className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
            Acessar
          </button>
          <button
            onClick={onCtaClick}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
          >
            Quero conhecer o Axis
          </button>
        </div>

        <button className="lg:hidden text-slate-900 p-2 -mr-2" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 px-5 py-6 space-y-4">
          {LINKS.map((l) => (
            <button key={l.href} onClick={() => go(l.href)} className="block w-full text-left text-sm font-medium text-slate-600 py-1.5">
              {l.label}
            </button>
          ))}
          <button
            onClick={() => { setMobileOpen(false); onCtaClick(); }}
            className="w-full mt-3 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold"
          >
            Quero conhecer o Axis
          </button>
        </div>
      )}
    </header>
  );
}
