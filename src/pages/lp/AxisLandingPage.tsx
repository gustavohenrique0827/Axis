import { useEffect, useRef } from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { ProblemSection, NovaLogicaSection } from "./ProblemAndLogic";
import { ComoFuncionaSection } from "./ComoFunciona";
import { DataFlywheelSection } from "./DataFlywheel";
import { InteligenciaSection } from "./Inteligencia";
import { ExemploOportunidadeSection } from "./ExemploOportunidade";
import { RadarOportunidadesSection } from "./RadarOportunidades";
import { AgentesSection } from "./Agentes";
import { EquipeHumanaSection } from "./EquipeHumana";
import { DashboardMockupSection } from "./DashboardMockup";
import { AutonomiaSection } from "./Autonomia";
import { PlanosSection } from "./Planos";
import { CanaisSection, BeneficiosSection } from "./CanaisEBeneficios";
import { FAQSection } from "./FAQ";
import { CTAFinalFormSection } from "./CTAFinalForm";
import { FooterSection } from "./FooterSection";
import { FONT_BODY } from "./shared";

const SEO_TITLE = "Axis — Sistema Operacional de Oportunidades Comerciais";
const SEO_DESCRIPTION =
  "Axis é um sistema operacional de oportunidades comerciais que utiliza inteligência artificial e agentes autônomos para encontrar, entender e agir sobre oportunidades de vendas.";
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap";

function useLandingPageSeo() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = SEO_TITLE;

    const upsertMeta = (attr: "name" | "property", key: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      const created = !el;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute("content");
      el.setAttribute("content", content);
      return { el, prev, created };
    };

    const touched = [
      upsertMeta("name", "description", SEO_DESCRIPTION),
      upsertMeta("property", "og:title", SEO_TITLE),
      upsertMeta("property", "og:description", SEO_DESCRIPTION),
      upsertMeta("property", "og:type", "website"),
    ];

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = GOOGLE_FONTS_HREF;
    document.head.appendChild(fontLink);

    // A LP é sempre clara, independente do tema claro/escuro que o usuário logado tenha
    // escolhido no CRM — sem isso, quem visita /lp já com o tema escuro salvo veria o
    // <html>/<body> escuro atrás do conteúdo branco da página.
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = "#FFFFFF";
    document.body.style.backgroundColor = "#FFFFFF";

    return () => {
      document.title = prevTitle;
      touched.forEach(({ el, prev, created }) => {
        if (created) el.remove();
        else if (prev !== null) el.setAttribute("content", prev);
      });
      fontLink.remove();
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
    };
  }, []);
}

export default function AxisLandingPage() {
  useLandingPageSeo();
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToComoFunciona = () =>
    document.querySelector("#como-funciona")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased" style={{ fontFamily: FONT_BODY }}>
      <Navbar onCtaClick={scrollToForm} />
      <main>
        <Hero onPrimaryCta={scrollToForm} onSecondaryCta={scrollToComoFunciona} />
        <ProblemSection />
        <NovaLogicaSection />
        <ComoFuncionaSection />
        <DataFlywheelSection />
        <InteligenciaSection />
        <ExemploOportunidadeSection />
        <RadarOportunidadesSection />
        <AgentesSection />
        <EquipeHumanaSection />
        <DashboardMockupSection />
        <AutonomiaSection />
        <PlanosSection onCta={scrollToForm} />
        <CanaisSection />
        <BeneficiosSection />
        <FAQSection />
        <CTAFinalFormSection ref={formRef} />
      </main>
      <FooterSection />
    </div>
  );
}
