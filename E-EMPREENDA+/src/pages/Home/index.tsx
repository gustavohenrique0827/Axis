import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import AnnouncementBar from '../../components/AnnouncementBar'
import Footer from '../../components/Footer'
import styles from './Home.module.css'
import { useLandingSection } from '../../lib/useLandingConfig'

// ── Defaults (fallback quando Supabase não retorna) ──
const DEFAULT_PILARES = [
  { num: '01', title: 'Identidade & Propósito', desc: 'Clareza total sobre quem você é e a marca que deseja deixar no mundo.' },
  { num: '02', title: 'Mentalidade de Legado', desc: 'Foco emocional e psicológico para empreender com resiliência e visão de longo prazo.' },
  { num: '03', title: 'Execução Prática', desc: 'Método e ferramentas para transformar ideias em negócios sustentáveis.' },
]

const DEFAULT_TESTIMONIALS = [
  { text: 'Escalar um negócio digital exige muito mais que apenas técnica; exige uma base sólida de princípios. Na E-Empreenda+ encontrei o equilíbrio perfeito entre métricas agressivas e propósito inegociável.', name: 'Gustavo Oliveira', role: 'Estrategista Digital', sector: 'Marketing' },
  { text: 'O crochê era meu refúgio, mas no movimento E+ virou meu negócio real. Aprendi a sair do amadorismo, valorizar meu trabalho e estruturar processos que me permitem crescer sem perder a essência do que eu faço com as mãos.', name: 'Renata Luz', role: 'Recriar Crochê', sector: 'Artesanato' },
  { text: 'Como servidor, eu buscava segurança, mas sentia um chamado latente para frutificar fora do sistema. A E-Empreenda+ me deu a coragem e, principalmente, o método para empreender com responsabilidade e clareza de direção.', name: 'Marcus Vinícius', role: 'Servidor Público', sector: 'Serviço Público' },
  { text: 'Eu já tinha a garra de vendas, mas me faltava a visão de dono. A mentoria me ensinou a transformar esforço individual em um modelo de negócio replicável. Hoje não apenas vendo, eu construo um ativo com base em valores.', name: 'Kevin Oliveira', role: 'Vendedor', sector: 'Vendas' },
  { text: 'Minha clínica mudou de patamar quando entendi que ser uma excelente profissional técnica é diferente de ser uma dona de clínica de sucesso. O E-EMPREENDA+ foi o divisor de águas na minha gestão.', name: 'Eduarda Porto', role: 'Farmacêutica Esteta', sector: 'Saúde & Estética' },
  { text: 'Viver de arte é um desafio constante. A E-Empreenda+ me ensinou a gerir minha carreira como uma empresa, trazendo previsibilidade financeira e uma autoridade que eu não conseguia construir sozinho no mercado de ensino.', name: 'Gustavo Silva', role: 'Instrutor de Canto', sector: 'Educação' },
]

const DEFAULT_FAQS = [
  { q: 'Para quem é o E-EMPREENDA + IMERSÃO?', a: 'Para quem quer começar ou crescer com estratégia, apoio e visão prática. Não importa se você ainda está no CLT ou se já possui um negócio estruturado. O que importa é a sua disposição para a transformação real.' },
  { q: 'Como funcionam os 12 encontros?', a: 'São 12 encontros presenciais intensivos com foco em execução. Cada encontro tem uma entrega específica: você sai com algo implementado no seu negócio, não só aprendido.' },
  { q: 'Qual é a diferença entre IMERSÃO, MASTERMIND e IA LAB?', a: 'IMERSÃO é para quem quer implementar sistemas de vendas e crescimento com método. MASTERMIND é para decisores de alta escala focados em networking e M&A. IA LAB é para quem quer automatizar processos corporativos com inteligência artificial.' },
  { q: 'Qual é a garantia?', a: 'Garantia total de resultados. Se você participar ativamente e não conseguir implementar ao menos um sistema novo no seu negócio, devolvemos 100% do investimento. Sem perguntas.' },
  { q: 'Quando começa a próxima turma?', a: 'A próxima turma começa em 5 de agosto de 2026. As vagas são limitadas — apenas 50 — e preenchidas por ordem de aplicação após a entrevista de qualificação com nossa equipe.' },
  { q: 'Tem suporte entre os encontros?', a: 'Sim. Todos os participantes têm acesso à comunidade de alumni e suporte direto dos mentores entre os encontros para garantir a implementação do que foi trabalhado.' },
]

const DEFAULT_GROUP_BENEFITS = [
  { step: '01', title: 'Conteúdos de Preparação', desc: 'Receba materiais exclusivos que vão preparar sua mente e seu negócio para a Turma 3.' },
  { step: '02', title: 'Bastidores da E-Empreenda+', desc: 'Entenda a estrutura por trás dos negócios que unem propósito e identidade que te leva ao lucro.' },
  { step: '03', title: 'Acesso Antecipado', desc: 'Garanta sua inscrição antes de todo mundo e tenha prioridade máxima na Turma 3.' },
  { step: '04', title: 'Networking Curado', desc: 'Conecte-se com empreendedores que buscam os mesmos valores e ambições que você.' },
]

const DEFAULT_HERO = {
  h1: 'Seu negócio não cresce porque ninguém te ensinou o caminho.',
  subtitle: 'A maioria das pessoas sonha em empreender, mas poucas têm coragem de começar. A Turma 3 da E-Empreenda+ é a sua oportunidade para construir um negócio lucrativo com propósito e visão estratégica.',
  quote: 'Empreender transforma vidas.',
  ctaText: 'Garantir Minha Vaga',
}

const targetAudience = [
  'Empregado CLT',
  'Empreendedor MEI',
  'Autônomo',
  'Sonha em Empreender',
]

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [pilares] = useLandingSection('pillars', DEFAULT_PILARES)
  const [testimonials] = useLandingSection('testimonials', DEFAULT_TESTIMONIALS)
  const [groupBenefits] = useLandingSection('benefits', DEFAULT_GROUP_BENEFITS)
  const [hero] = useLandingSection('hero', DEFAULT_HERO)
  const [faqItems] = useLandingSection('faq', DEFAULT_FAQS)

  return (
    <div className={styles.pageContainer}>
      <AnnouncementBar />
      <Navbar />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroContent}>
            <div className={styles.heroTag}>
              <span className={styles.heroTagDot} />
              5 de Agosto · Vagas Limitadas
            </div>

            <h1 className={styles.heroH1}>
              {hero.h1.split('o caminho.')[0]}
              <em>o caminho.</em>
            </h1>
            <p className={styles.heroSub}>{hero.subtitle}</p>

            <div className={styles.heroCredentials}>
              <div className={styles.credItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" /></svg>
                <span className={styles.heroQuote}>"{hero.quote}" Esteja pronto para liderar com consciência e valores inegociáveis.</span>
              </div>
            </div>

            <Link to="/inscricao" className={styles.heroBtn}>
              {hero.ctaText} →
            </Link>
          </div>
        </div>

        <div className={styles.heroRight}>
          <img
            src="/founders.jpeg"
            alt="Fundadores E-EMPREENDA+"
            className={styles.heroPhoto}
            draggable={false}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className={styles.heroPhotoGradient} />
        </div>
      </section>

      {/* INFO STRIP */}
      <div className={styles.infoStrip}>
        {[
          ['Próxima Turma', '5 de Agosto'],
          ['Formato', 'Presencial Intensivo'],
          ['Duração', '12 Encontros'],
          ['Vagas', '50 no Total'],
          ['Networking', 'Elite'],
        ].map(([label, value]) => (
          <div key={label} className={styles.infoItem}>
            <span className={styles.infoLabel}>{label}:</span>
            <span className={styles.infoValue}>{value}</span>
          </div>
        ))}
      </div>

      {/* LOGO BAR */}
      <div className={styles.logoBar}>
        <span className={styles.logoBarLabel}>Ativando o empreendedor através do propósito</span>
        <div className={styles.logoBarLogos}>
          {['VALIDADO 100%', '3ª TURMA', 'AMBIENTE VIP', 'PROPÓSITO & EXECUÇÃO'].map(logo => (
            <div key={logo} className={styles.logoItem}>{logo}</div>
          ))}
        </div>
      </div>

      {/* MOVEMENT — Para Quem É */}
      <section className={`${styles.section} ${styles.sectionDarker}`}>
        <div className="container">
          <span className={styles.sectionLabel}>A Mentoria</span>
          <h2 className={styles.sectionH2}>A E-Empreenda+ não é apenas um curso</h2>
          <p className={styles.sectionSub}>
            É um movimento focado em quem decidiu assumir a responsabilidade sobre a própria vida, unindo pilares inegociáveis para o sucesso com significado.
          </p>

          <div className={styles.movementGrid}>
            <div className={styles.movementLeft}>
              <p className={styles.movementQuestion}>Busca mais clareza e resultados no seu dia a dia?</p>
              <p className={styles.movementBody}>
                A Mentoria E-Empreenda+ foi criada justamente para ajudar quem quer começar ou crescer com estratégia, apoio e visão prática.
              </p>
              <p className={styles.movementBody}>
                Não importa se você ainda está no CLT ou se já possui um negócio estruturado. O que importa é a sua disposição para a transformação real.
              </p>
              <div className={styles.movementChecks}>
                {targetAudience.map((item) => (
                  <div key={item} className={styles.movementCheckItem}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${styles.movementRight} ${styles.glass}`}>
              <h3 className={styles.movementRightTitle}>A Ponte Estratégica para o seu Sucesso</h3>
              <p className={styles.movementBody}>
                O que você fizer nos próximos 90 dias define os próximos 12 meses. E os próximos 12 meses constroem seu 2026.
              </p>
              <p className={styles.movementBody}>
                A Mentoria E-Empreenda+ acelera esse processo para você não perder tempo nem oportunidades.
              </p>
              <Link to="/inscricao" className={styles.btnPrimary} style={{ marginTop: '32px' }}>
                Garantir Minha Vaga
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className={styles.section}>
        <div className="container">
          <span className={styles.sectionLabel}>A Metodologia</span>
          <h2 className={styles.sectionH2}>Os 4 Pilares da E-EMPREENDA+</h2>
          <p className={styles.sectionSub}>Unindo identidade, estratégia e execução real para construir negócios com propósito e significado.</p>
          <div className={styles.pillarsGrid}>
            {pilares.map((p: { num: string; title: string; desc: string }) => (
              <div key={p.num} className={`${styles.pillarCard} ${styles.glassHover}`}>
                <span className={styles.pillarNum}>{p.num}</span>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GROUP BENEFITS */}
      <section className={`${styles.section} ${styles.sectionDarker}`}>
        <div className="container">
          <span className={styles.sectionLabel}>Turma 3</span>
          <h2 className={styles.sectionH2}>Por que você PRECISA estar na Turma 3?</h2>
          <p className={styles.sectionSub}>Não é apenas um programa de encontros. É o seu ambiente de preparação intensiva para decidir com consciência o seu próximo passo.</p>
          <div className={styles.howGrid}>
            {groupBenefits.map((b: { step: string; title: string; desc: string }) => (
              <div key={b.step} className={`${styles.howCard} ${styles.glass}`}>
                <span className={styles.howNum}>{b.step}</span>
                <h3 className={styles.howTitle}>{b.title}</h3>
                <p className={styles.howDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
          <div className={styles.groupWarning}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <span>APENAS 50 VAGAS PRESENCIAIS — Prezamos pela curadoria detalhada. Uma vez preenchidas, não abriremos exceções para a Turma 3.</span>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" className={`${styles.section} ${styles.sectionDarker}`}>
        <div className="container">
          <span className={styles.sectionLabel}>Depoimentos Reais</span>
          <h2 className={styles.sectionH2}>Onde a estratégia encontra a Transformação</h2>
          <p className={styles.sectionSub}>Não vendemos "fique rico rápido". Nossos alunos constroem bases sólidas que suportam o crescimento a longo prazo.</p>
          <div className={styles.testimonialGrid}>
            {testimonials.map((t: { text: string; name: string; role: string; sector: string }, i: number) => (
              <div key={i} className={`${styles.testimonialCard} ${styles.glass} ${styles.glassHover}`}>
                <div className={styles.testimonialStars}>★★★★★</div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>{t.name.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <div className={styles.authorName}>{t.name}</div>
                    <div className={styles.authorRole}>{t.role}</div>
                    <div className={styles.authorSector}>{t.sector}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className={styles.section}>
        <div className="container">
          <div className={`${styles.guaranteeBanner} ${styles.glass}`}>
            <div className={styles.guaranteeIcon}>
              <svg viewBox="0 0 24 24" fill="none" width="40" height="40"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div className={styles.guaranteeContent}>
              <span className={styles.sectionLabel}>Nossa Garantia</span>
              <h2 className={styles.guaranteeTitle}>Garantia Total de Resultados</h2>
              <p className={styles.guaranteeText}>
                Se você participar ativamente dos 12 encontros e não conseguir implementar ao menos um sistema novo no seu negócio,{' '}
                <strong>devolvemos 100% do investimento. Sem perguntas.</strong>
              </p>
              <div className={styles.guaranteeItems}>
                {['Resultado validado em +2.400 empreendedores', 'Mentores com negócios reais e ativos', 'Comunidade permanente garantida'].map(item => (
                  <div key={item} className={styles.guaranteeItem}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#FF5C00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`${styles.section} ${styles.sectionDarker}`}>
        <div className="container">
          <span className={styles.sectionLabel} style={{ display: 'block', textAlign: 'center' }}>Dúvidas</span>
          <h2 className={styles.sectionH2} style={{ textAlign: 'center', marginBottom: '64px' }}>Perguntas Frequentes</h2>
          <div className={styles.faqList}>
            {faqItems.map((f: { q: string; a: string }, i: number) => (
              <div key={i} className={`${styles.faqItem} ${faqOpen === i ? styles.open : ''}`}>
                <button className={styles.faqBtn} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {f.q}
                  <div className={`${styles.faqIcon} ${faqOpen === i ? styles.faqIconOpen : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </button>
                <div className={styles.faqAnswer}>
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaTag}>Turma de Agosto — Apenas 50 Vagas</div>
          <h2>Essa não é uma decisão impulsiva. É consciente.</h2>
          <p>A decisão que separa seu 2026 dos seus últimos 5 anos. Esteja pronto para liderar com consciência e valores inegociáveis.</p>
          <Link to="/inscricao" className={styles.btnPrimary} style={{ margin: '0 auto', display: 'inline-flex' }}>
            Garantir Minha Vaga
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          <div className={styles.ctaTrustRow}>
            <span>Garantia total de resultados</span>
            <span aria-hidden>·</span>
            <span>Resultado ou reembolso</span>
            <span aria-hidden>·</span>
            <span>+2.400 alumni</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
