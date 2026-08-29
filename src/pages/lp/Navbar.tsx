import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { FONT_DISPLAY } from "./shared";

const LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#inteligencia", label: "Inteligência" },
  { href: "#agentes", label: "Agentes" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "FAQ" },
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
        scrolled ? "bg-black/70 backdrop-blur-xl border-b border-white/[0.08]" : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16 sm:h-20">
        <a href="#top" className="flex items-center gap-2.5 shrink-0" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <span className="text-white font-black text-sm" style={{ fontFamily: FONT_DISPLAY }}>A</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: FONT_DISPLAY }}>AXIS</span>
        </a>

        <div className="hidden lg:flex items-center gap-8">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <button onClick={onCtaClick} className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors">
            Acessar
          </button>
          <button
            onClick={onCtaClick}
            className="px-5 py-2.5 rounded-xl bg-white text-black text-[13px] font-bold hover:bg-slate-100 transition-colors shadow-[0_0_30px_-8px_rgba(255,255,255,0.4)]"
          >
            Quero conhecer o Axis
          </button>
        </div>

        <button className="lg:hidden text-white p-2 -mr-2" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/[0.08] px-5 py-6 space-y-4">
          {LINKS.map((l) => (
            <button key={l.href} onClick={() => go(l.href)} className="block w-full text-left text-sm font-medium text-slate-300 py-1.5">
              {l.label}
            </button>
          ))}
          <button
            onClick={() => { setMobileOpen(false); onCtaClick(); }}
            className="w-full mt-3 px-5 py-3 rounded-xl bg-white text-black text-sm font-bold"
          >
            Quero conhecer o Axis
          </button>
        </div>
      )}
    </header>
  );
}
