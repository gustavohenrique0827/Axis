import type { ReactNode } from "react";
import { motion } from "motion/react";

export const FONT_DISPLAY = "'Sora', 'Inter', ui-sans-serif, system-ui, sans-serif";
export const FONT_BODY = "'Inter', ui-sans-serif, system-ui, sans-serif";

export function Section({
  id,
  children,
  className = "",
  bordered = true,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}) {
  return (
    <section
      id={id}
      className={`relative py-20 sm:py-28 lg:py-32 px-5 sm:px-8 ${bordered ? "border-t border-slate-200" : ""} ${className}`}
    >
      <div className="max-w-6xl mx-auto relative z-10">{children}</div>
    </section>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-5"
    >
      <span className="w-6 h-px bg-gradient-to-r from-blue-500 to-violet-500" />
      {children}
    </motion.div>
  );
}

export function SectionTitle({
  children,
  className = "",
  as = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  const Comp = motion[as] as any;
  return (
    <Comp
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{ fontFamily: FONT_DISPLAY }}
      className={`font-bold tracking-tight text-slate-900 leading-[1.08] ${className}`}
    >
      {children}
    </Comp>
  );
}

export function Lede({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className={`text-slate-500 leading-relaxed ${className}`}
    >
      {children}
    </motion.p>
  );
}

export function GlassCard({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-slate-200 bg-white ${
        glow ? "shadow-[0_20px_60px_-15px_rgba(59,130,246,0.2)]" : "shadow-sm"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function BrandLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-xl sm:text-2xl font-medium text-slate-700 italic leading-snug" style={{ fontFamily: FONT_DISPLAY }}>
      {children}
    </p>
  );
}

export const ACCENT_GRADIENT = "bg-gradient-to-r from-blue-500 via-blue-400 to-violet-500 bg-clip-text text-transparent";
