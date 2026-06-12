import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import styles from './Home.module.css'

const pilares = [
  { num: '01', title: 'Clareza Estratégica', desc: 'Saia do operacional e defina exatamente para onde a sua empresa está indo nos próximos 3 anos.' },
  { num: '02', title: 'Comando e Liderança', desc: 'Construa um time de alta performance que entrega resultados sem depender de você o tempo todo.' },
  { num: '03', title: 'Escala com Margem', desc: 'Sistemas de vendas e marketing previsíveis para crescer sem sacrificar a lucratividade.' },
  { num: '04', title: 'Governança', desc: 'Implemente rituais de gestão, conselho e métricas para ter o controle do negócio na palma da mão.' },
  { num: '05', title: 'Aliança', desc: 'Conecte-se com um ecossistema de empresários do mesmo nível para fechar negócios e fazer benchmarking.' },
]

const programs = [
  {
    badge: 'MASTERMIND',
    title: 'Conselho de Elite',
    tagline: 'Para quem fatura acima de R$5M',
    desc: 'A sala onde apenas fundadores de alto calibre entram. Decisões reais, sem filtro, com pares que entendem suas dores.',
    benefits: ['Reuniões mensais de conselho entre pares', 'Cases reais sem filtro de empresas similares', 'Mentoria 1:1 sob demanda com especialistas', 'Networking restrito ao nível C-Suite'],
    slug: 'mastermind',
    featured: true,
  },
  {
    badge: 'IMERSÃO',
    title: 'Aceleração Tática',
    tagline: '72h presenciais de puro método',
    desc: 'Três dias para sair com diagnóstico completo, plano de 90 dias validado e clareza total sobre onde atacar.',
    benefits: ['Diagnóstico 360° do negócio no dia 1', 'Plano de ação para 90 dias validado', 'Frameworks e materiais práticos exclusivos', 'Comunidade permanente de alumni'],
    slug: 'imersao',
    featured: false,
  },
  {
    badge: 'IA LAB',
    title: 'Inovação Aplicada',
    tagline: 'IA nos processos em 30 dias',
    desc: 'Sprint hands-on para implementar IA real na sua operação. ROI mensurável no primeiro mês.',
    benefits: ['Mapeamento de processos automatizáveis', 'Redução de custo operacional comprovada', 'Sprint guiada com especialistas em IA', 'Resultados em semanas, não meses'],
    slug: 'ialab',
    featured: false,
  },
]

const mentors = [
  { name: 'Ricardo Mendes', role: 'Ex-CEO Grupo Votorantim', bio: 'Especialista em reestruturação e M&A. 28 anos liderando grandes operações.' },
  { name: 'Camila Souza', role: 'Fundadora de 3 scale-ups', bio: 'Especialista em vendas B2B e growth. Vendeu duas operações de SaaS.' },
  { name: 'Paulo Oliveira', role: 'Sócio McKinsey', bio: 'Estrategista corporativo com foco em eficiência e internacionalização.' },
  { name: 'Ana Lima', role: 'CTO & Investidora', bio: 'Líder do IA Lab. Especialista na aplicação de automações para PMEs.' },
]

const testimonials = [
  { result: '+340% de faturamento', text: 'Os mentores não entregam teoria. É a prática de quem já fez o negócio acontecer de verdade. Mudou nosso jogo.', name: 'Fernando Costa', role: 'CEO, Grupo Nexum', sector: 'Varejo' },
  { result: 'R$2,1M de lucro extra', text: 'Em três dias identificamos buracos gigantes na nossa margem. O plano de 90 dias foi o mais assertivo que já fizemos.', name: 'Mariana Teles', role: 'Diretora, Agro Teles', sector: 'Agronegócio' },
  { result: 'Redução de 67% no custo', text: 'O IA Lab automatizou áreas que eu nem sabia que podiam ser delegadas para máquinas. Retorno sobre investimento bizarro.', name: 'Thiago Braga', role: 'Fundador, BragaTech', sector: 'Tecnologia' },
  { result: 'Time 100% autônomo', text: 'Hoje minha equipe entrega sem precisar de mim em cada reunião. Recuperei 20 horas por semana para atuar só na estratégia.', name: 'Renata Alves', role: 'CEO, Alves Incorporações', sector: 'Construção Civil' },
  { result: '+180% de margem líquida', text: 'Revisamos o modelo de precificação inteiro. A metodologia de Escala com Margem mudou completamente como vendemos.', name: 'Carlos Drummond', role: 'Sócio, Drummond & Filhos', sector: 'Distribuição' },
]

const faqs = [
  { q: 'Qual o perfil exigido para participar?', a: 'Buscamos empresários, fundadores e C-Levels de empresas com faturamento acima de R$1M/ano. É necessário poder de decisão na empresa. A seleção é rigorosa para garantir o nível da sala.' },
  { q: 'Qual a duração e o formato?', a: 'O Mastermind dura 12 meses com reuniões mensais. A Imersão são 3 dias presenciais intensos em São Paulo. O IA Lab é um sprint prático de 30 dias com sessões online e acompanhamento.' },
  { q: 'Tem garantia de resultado?', a: 'Garantimos o método, a profundidade e o networking. Se você implementar o framework e não ter clareza estratégica mensurável em 90 dias, você participa da próxima turma sem custo adicional.' },
  { q: 'Quanto tempo leva o processo de seleção?', a: 'Após preencher o formulário, avaliamos em até 48h úteis. Se aprovado, agendamos uma entrevista de 30 minutos para entender seus objetivos e confirmar o programa ideal para você.' },
  { q: 'Os programas são presenciais ou online?', a: 'Depende do programa. O Mastermind combina encontros presenciais e plataforma online. A Imersão é 100% presencial em São Paulo. O IA Lab é online com sessões ao vivo e sprint de implementação.' },
  { q: 'Qual é o retorno sobre investimento esperado?', a: 'Nossos alumni reportam retorno médio de 8x o investimento no primeiro ano. Os ganhos vêm de aumento de margem, redução de custos e aceleração de decisões. O IA Lab entrega em média 40% de redução em custo operacional em 90 dias.' },
  { q: 'Posso participar de mais de um programa ao mesmo tempo?', a: 'O Mastermind pode ser combinado com o IA Lab. Para empresas sem diagnóstico estruturado anterior, recomendamos iniciar pela Imersão — ela prepara o terreno para qualquer dos outros programas.' },
  { q: 'Como funciona o networking e a comunidade?', a: 'Todos os programas incluem acesso à comunidade exclusiva de alumni com +400 empresários, organizada por setor, faturamento e região. Parcerias comerciais, M&A e benchmarking entre membros acontecem com frequência.' },
]

const painPoints = [
  'Trabalho mais do que qualquer colaborador da minha empresa',
  'Crescemos em faturamento, mas a margem está cada vez mais apertada',
  'Não consigo delegar — ninguém entrega como eu entregaria',
  'Não tenho clareza do rumo do negócio para os próximos 3 anos',
  'O time para de funcionar quando não estou presente',
  'Sinto que o crescimento travou no mesmo patamar há meses',
]

const howSteps = [
  { step: '01', title: 'Aplicação', desc: 'Preencha o formulário em 3 minutos. Sem burocracia.' },
  { step: '02', title: 'Análise de Perfil', desc: 'Nossa equipe avalia sua aplicação em até 48 horas úteis.' },
  { step: '03', title: 'Entrevista', desc: 'Uma conversa de 30 min para recomendar o programa certo.' },
  { step: '04', title: 'Acesso', desc: 'Bem-vindo ao ecossistema. Materiais, agenda e primeiras conexões.' },
]

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [painVisible, setPainVisible] = useState(false)
  const painRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setPainVisible(true) },
      { threshold: 0.15 }
    )
    if (painRef.current) obs.observe(painRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div className={styles.pageContainer}>
      <Navbar />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className="container">
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.heroTag}>
                <span className={styles.heroTagDot} />
                Turma Q3 2026 — 72 vagas disponíveis
              </div>
              <h1 className={styles.heroH1}>
                Você construiu o negócio.<br />
                Agora é hora de ele<br />
                <em>funcionar sem você.</em>
              </h1>
              <p className={styles.heroSubText}>
                A imersão que fundadores e C-Levels de empresas com R$1M–R$500M/ano usam para escalar com margem, montar um time autônomo e ter clareza estratégica real.
              </p>
              <div className={styles.heroCtas}>
                <Link to="/inscricao" className={styles.btnPrimary}>
                  Solicitar minha vaga
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <a href="#programas" className={styles.btnOutline}>
                  Ver programas
                </a>
              </div>
              <div className={styles.heroTrustBar}>
                <div className={styles.trustItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#FF5C00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Sem risco — garantia do método
                </div>
                <div className={styles.trustItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#FF5C00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Seleção rigorosa de participantes
                </div>
                <div className={styles.trustItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#FF5C00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Resposta em até 48h
                </div>
              </div>
              <div className={styles.statsRow}>
                {[['+400', 'Empresas Aceleradas'], ['R$2,8 Bi', 'Faturamento dos Alumni'], ['9.4', 'NPS Médio']].map(([num, lbl]) => (
                  <div key={lbl} className={styles.statItem}>
                    <span className={styles.statNum}>{num}</span>
                    <span className={styles.statLabel}>{lbl}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.heroVideo}>
              <div className={styles.playBtn}>
                <svg viewBox="0 0 24 24" fill="white" width="32" height="32"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <div className={styles.heroVideoCaption}>2 min · Depoimento de alumni</div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO BAR */}
      <div className={styles.logoBar}>
        <span className={styles.logoBarLabel}>Empresas que já passaram pelo programa</span>
        <div className={styles.logoBarLogos}>
          {['NEXUM', 'AGRO TELES', 'BRAGATECH', 'ALVES CORP', 'DRUMMOND & FILHOS'].map(logo => (
            <div key={logo} className={styles.logoItem}>{logo}</div>
          ))}
        </div>
      </div>

      {/* PAIN POINTS */}
      <section className={`${styles.section} ${styles.sectionDarker}`}>
        <div className="container">
          <span className={styles.sectionLabel}>O Diagnóstico</span>
          <h2 className={styles.sectionH2}>Você se reconhece aqui?</h2>
          <p className={styles.sectionSub}>Se você marcou pelo menos 2 desses pontos, você está no lugar certo.</p>
          <div className={styles.painGrid} ref={painRef}>
            {painPoints.map((p, i) => (
              <div
                key={i}
                className={`${styles.painItem} ${styles.glass} ${painVisible ? styles.painVisible : ''}`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className={styles.painCheck}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div className={styles.painCta}>
            <Link to="/inscricao" className={styles.btnPrimary}>
              Quero resolver isso
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FOR WHO */}
      <section className={styles.section}>
        <div className="container">
          <span className={styles.sectionLabel}>Para Quem É</span>
          <h2 className={styles.sectionH2}>Com quem você vai sentar na mesa?</h2>
          <p className={styles.sectionSub}>O ecossistema é tão valioso quanto o conteúdo. A seleção é rigorosa por design.</p>
          <div className={styles.targetGrid}>
            <div className={`${styles.targetCard} ${styles.glass}`}>
              <div className={styles.targetIcon}>
                <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Este programa É para você se...</h3>
              <ul className={styles.targetList}>
                <li>Você é fundador, sócio ou C-Level com poder de decisão</li>
                <li>Sua empresa fatura acima de R$1M/ano</li>
                <li>Você quer sair do operacional e atuar na estratégia</li>
                <li>Você está comprometido a implementar o que aprender</li>
              </ul>
            </div>
            <div className={`${styles.targetCard} ${styles.glass} ${styles.targetCardNot}`}>
              <div className={`${styles.targetIcon} ${styles.targetIconNot}`}>
                <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <h3>Este programa NÃO é para você se...</h3>
              <ul className={`${styles.targetList} ${styles.targetListNot}`}>
                <li>Você busca mais teoria sem compromisso de implementação</li>
                <li>Sua empresa ainda fatura abaixo de R$1M/ano</li>
                <li>Você não tem disponibilidade para participar ativamente</li>
                <li>Você prefere cursos gravados sem accountability</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className={`${styles.section} ${styles.sectionDarker}`}>
        <div className="container">
          <span className={styles.sectionLabel}>A Metodologia</span>
          <h2 className={styles.sectionH2}>Os 5 Pilares da Aceleração</h2>
          <p className={styles.sectionSub}>Framework baseado no que funciona hoje nas empresas mais enxutas e eficientes do mercado.</p>
          <div className={styles.pillarsGrid}>
            {pilares.map((p) => (
              <div key={p.num} className={`${styles.pillarCard} ${styles.glassHover}`}>
                <span className={styles.pillarNum}>{p.num}</span>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.section}>
        <div className="container">
          <span className={styles.sectionLabel}>Processo</span>
          <h2 className={styles.sectionH2}>Como funciona a aplicação?</h2>
          <p className={styles.sectionSub}>Do formulário ao primeiro encontro em menos de uma semana.</p>
          <div className={styles.howGrid}>
            {howSteps.map((h) => (
              <div key={h.step} className={`${styles.howCard} ${styles.glass}`}>
                <span className={styles.howNum}>{h.step}</span>
                <h3 className={styles.howTitle}>{h.title}</h3>
                <p className={styles.howDesc}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programas" className={`${styles.section} ${styles.sectionDarker}`}>
        <div className="container">
          <span className={styles.sectionLabel}>A Experiência</span>
          <h2 className={styles.sectionH2}>Qual o seu próximo nível?</h2>
          <p className={styles.sectionSub}>Diferentes dores, diferentes soluções. Escolha o programa certo para o momento atual do seu negócio.</p>
          <div className={styles.programsGrid}>
            {programs.map(p => (
              <div key={p.slug} className={`${styles.programCard} ${styles.glass} ${styles.glassHover} ${p.featured ? styles.programCardFeatured : ''}`}>
                {p.featured && <div className={styles.featuredBadge}>MAIS PROCURADO</div>}
                <div className={styles.programBadge}>{p.badge}</div>
                <h3 className={styles.programTitle}>{p.title}</h3>
                <p className={styles.programTagline}>{p.tagline}</p>
                <p className={styles.programDesc}>{p.desc}</p>
                <ul className={styles.programBenefits}>
                  {p.benefits.map(b => (
                    <li key={b}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link to={`/inscricao?programa=${p.slug}`} className={p.featured ? styles.programCtaFeatured : styles.programCta}>
                  Aplicar agora
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MENTORS */}
      <section id="mentores" className={styles.section}>
        <div className="container">
          <span className={styles.sectionLabel}>Skin in the Game</span>
          <h2 className={styles.sectionH2}>Conheça seus mentores</h2>
          <p className={styles.sectionSub}>Ninguém ensina teoria de livro aqui. Você aprende com quem construiu empresas reais e venceu.</p>
          <div className={styles.mentorsGrid}>
            {mentors.map(m => (
              <div key={m.name} className={`${styles.mentorCard} ${styles.glass} ${styles.glassHover}`}>
                <div className={styles.mentorPhoto}>
                  <span className={styles.mentorInitial}>{m.name.charAt(0)}</span>
                </div>
                <div className={styles.mentorInfo}>
                  <p className={styles.mentorRole}>{m.role}</p>
                  <h3 className={styles.mentorName}>{m.name}</h3>
                  <p className={styles.mentorBio}>{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" className={`${styles.section} ${styles.sectionDarker}`}>
        <div className="container">
          <span className={styles.sectionLabel}>Nossos Alumni</span>
          <h2 className={styles.sectionH2}>Resultado fala mais alto</h2>
          <p className={styles.sectionSub}>Mais de 400 empresas já passaram pelo programa. Resultados reais, sem filtro.</p>
          <div className={styles.testimonialGrid}>
            {testimonials.map((t, i) => (
              <div key={i} className={`${styles.testimonialCard} ${styles.glass} ${styles.glassHover}`}>
                <div className={styles.testimonialStars}>★★★★★</div>
                <div className={styles.testimonialResult}>{t.result}</div>
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
              <svg viewBox="0 0 24 24" fill="none" width="40" height="40"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className={styles.guaranteeContent}>
              <span className={styles.sectionLabel}>Nossa Garantia</span>
              <h2 className={styles.guaranteeTitle}>Garantia do Método</h2>
              <p className={styles.guaranteeText}>
                Se você participar ativamente, implementar o framework e não ter clareza estratégica mensurável em 90 dias,{' '}
                <strong>você participa da próxima turma sem custo adicional.</strong>
              </p>
              <div className={styles.guaranteeItems}>
                {['Framework validado em +400 empresas', 'Mentores com histórico comprovado', 'Comunidade de alto nível garantida'].map(item => (
                  <div key={item} className={styles.guaranteeItem}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#FF5C00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
            {faqs.map((f, i) => (
              <div key={i} className={`${styles.faqItem} ${faqOpen === i ? styles.open : ''}`}>
                <button className={styles.faqBtn} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {f.q}
                  <div className={`${styles.faqIcon} ${faqOpen === i ? styles.faqIconOpen : ''}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
          <div className={styles.ctaTag}>Turma Q3 2026 — Vagas limitadas</div>
          <h2>Pronto para assumir o controle do seu crescimento?</h2>
          <p>O mercado não espera você organizar a casa. Junte-se ao ecossistema que está formando os líderes do amanhã.</p>
          <Link to="/inscricao" className={styles.btnPrimary} style={{ margin: '0 auto', display: 'inline-flex' }}>
            Solicitar minha vaga agora
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div className={styles.ctaTrustRow}>
            <span>Seleção criteriosa</span>
            <span aria-hidden>·</span>
            <span>Resposta em 48h</span>
            <span aria-hidden>·</span>
            <span>Garantia do método</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
