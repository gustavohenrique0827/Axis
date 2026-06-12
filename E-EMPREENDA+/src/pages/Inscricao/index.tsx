import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Logo from '../../components/Logo'
import styles from './Inscricao.module.css'
import { supabase, AXIS } from '../../lib/supabase'

interface FormData {
  nome: string
  email: string
  telefone: string
  perfil: string
  desafio: string
  programa: string
  lgpd: boolean
}

const INITIAL: FormData = {
  nome: '', email: '', telefone: '',
  perfil: '', desafio: '', programa: '', lgpd: false,
}

const PERFIL_OPTIONS = [
  { value: 'aspirante', label: 'Quero Empreender', sub: 'Tenho uma ideia ou vontade de abrir um negócio', icon: '🌱' },
  { value: 'iniciante', label: 'Estou Começando', sub: 'Tenho um negócio recente (menos de 2 anos)', icon: '🚀' },
  { value: 'pequeno', label: 'Já Empreendo', sub: 'Tenho empresa, mas quero crescer e estruturar', icon: '📈' },
  { value: 'retomada', label: 'Quero Recomeçar', sub: 'Já empreendi antes e quero retomar', icon: '🔄' },
]

const DESAFIO_OPTIONS = [
  { value: 'validar', label: 'Validar minha ideia', icon: '💡' },
  { value: 'clientes', label: 'Conseguir meus primeiros clientes', icon: '🤝' },
  { value: 'gestao', label: 'Organizar e estruturar o negócio', icon: '⚙️' },
  { value: 'escalar', label: 'Escalar e crescer com consistência', icon: '⚡' },
]

const PROGRAMA_OPTIONS = [
  { value: 'metodo_eplus', label: 'Método E+', sub: 'Formação completa — 12 semanas online' },
  // { value: 'imersao', label: 'Imersão Despertar', sub: 'Aceleração presencial — 3 dias intensivos' },
  // { value: 'mentoria', label: 'Mentoria Individual', sub: 'Acompanhamento personalizado 1:1' },
  // { value: 'nao_sei', label: 'Me Indica', sub: 'Nossa equipe escolhe o melhor caminho' },
]

const TOTAL_STEPS = 5

export default function Inscricao() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState<FormData>({
    ...INITIAL,
    programa: searchParams.get('programa') || '',
  })
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * -60
      const y = (e.clientY / window.innerHeight - 0.5) * -60
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const set = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const applyPhoneMask = (val: string) => {
    const digits = val.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validateStep = (s: number): boolean => {
    switch (s) {
      case 0:
        if (formData.nome.trim().length < 3) { setError('Insira seu nome completo.'); return false }
        break
      case 1:
        if (!validateEmail(formData.email)) { setError('Insira um e-mail válido.'); return false }
        if (formData.telefone.replace(/\D/g, '').length < 10) { setError('Insira um telefone com DDD.'); return false }
        break
      case 2:
        if (!formData.perfil) { setError('Selecione o perfil que melhor te descreve.'); return false }
        break
      case 3:
        if (!formData.desafio) { setError('Selecione seu maior desafio agora.'); return false }
        break
      case 4:
        if (!formData.programa) { setError('Selecione um programa de interesse.'); return false }
        if (!formData.lgpd) { setError('Aceite a Política de Privacidade para continuar.'); return false }
        break
    }
    setError('')
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1))
  }
  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 0))
    setError('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (step < TOTAL_STEPS - 1) nextStep()
      else handleSubmit(e as unknown as React.FormEvent)
    }
  }

  const selectCard = (field: keyof FormData, value: string) => {
    set(field, value)
    setTimeout(() => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1)), 380)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(step)) return
    setLoading(true)
    setError('')

    const perfilLabel = PERFIL_OPTIONS.find(o => o.value === formData.perfil)?.label ?? formData.perfil
    const desafioLabel = DESAFIO_OPTIONS.find(o => o.value === formData.desafio)?.label ?? formData.desafio

    const { error: dbError } = await supabase.from('leads').insert({
      tenant_id:              AXIS.TENANT_ID,
      pipeline_id:            AXIS.PIPELINE_ID,
      stage_id:               AXIS.STAGE_ID,
      seller_id:              AXIS.SELLER_ID,
      pipelineId:             AXIS.PIPELINE_SLUG,
      stageId:                AXIS.STAGE_SLUG,
      name:                   formData.nome,
      email:                  formData.email,
      mobile_wa:              formData.telefone,
      phone:                  formData.telefone,
      source:                 'landing_empreenda',
      value:                  1997.00,
      status:                 'Open',
      temperature:            'Warm',
      priority:               'Medium',
      lead_interesse_cliente: 'Método E+ – O Despertar do Empreendedor',
      iaSummary:              `Perfil: ${perfilLabel}. Desafio: ${desafioLabel}. Programa: Método E+.`,
      customFields: {
        perfil:   formData.perfil,
        desafio:  formData.desafio,
        programa: formData.programa,
      },
    })

    setLoading(false)
    if (dbError) {
      setError('Erro ao enviar. Tente novamente.')
      return
    }
    navigate('/obrigado')
  }

  const isCardStep = step === 2 || step === 3
  const firstName = formData.nome.trim().split(' ')[0]

  return (
    <div className={styles.pageContainer}>
      <div className={styles.interactiveBackground}>
        <div
          className={styles.bgStairs}
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        >
          <div className={`${styles.bgBar} ${styles.bgBar1}`} />
          <div className={`${styles.bgBar} ${styles.bgBar2}`} />
          <div className={`${styles.bgBar} ${styles.bgBar3}`} />
        </div>
      </div>

      <header className={styles.header}>
        <Logo size={42} />
        <div className={styles.headerMeta}>
          <span className={styles.headerStep}>Passo {step + 1} de {TOTAL_STEPS}</span>
          <span className={styles.headerGuarantee}>Processo seletivo · Resposta em 48h</span>
        </div>
      </header>

      <div className={styles.progressTopBar}>
        <div className={styles.progressFill} style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
      </div>

      <main className={styles.mainContent}>
        <div className={styles.formWrapper}>

          <div className={styles.socialProof}>
            <div className={styles.socialProofAvatars}>
              {['AL', 'MC', 'RP', 'JB', 'KS'].map(initials => (
                <div key={initials} className={styles.socialProofAvatar}>{initials}</div>
              ))}
            </div>
            <span>+1.200 empreendedores já passaram pelo Método E+</span>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit(e) }}
            noValidate
            className={styles.form}
          >
            {/* STEP 0 — NOME */}
            {step === 0 && (
              <div className={`${styles.questionContainer} ${styles.animateSlideUp}`}>
                <div className={styles.stepIndicator}>1 → IDENTIFICAÇÃO</div>
                <label htmlFor="nome">Qual é o seu nome?</label>
                <input
                  id="nome" type="text" placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChange={(e) => set('nome', e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus autoComplete="name"
                />
              </div>
            )}

            {/* STEP 1 — EMAIL + TELEFONE */}
            {step === 1 && (
              <div className={`${styles.questionContainer} ${styles.animateSlideUp}`}>
                <div className={styles.stepIndicator}>2 → CONTATO</div>
                <label>
                  {firstName ? `Oi, ${firstName}! Como podemos te encontrar?` : 'Como podemos te encontrar?'}
                </label>
                <div className={styles.multiField}>
                  <div className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>Seu melhor e-mail</span>
                    <input
                      id="email" type="email" placeholder="voce@email.com"
                      value={formData.email}
                      onChange={(e) => set('email', e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus autoComplete="email"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>WhatsApp / Celular</span>
                    <input
                      id="telefone" type="tel" placeholder="(11) 99999-9999"
                      value={formData.telefone}
                      onChange={(e) => set('telefone', applyPhoneMask(e.target.value))}
                      onKeyDown={handleKeyDown}
                      autoComplete="tel" maxLength={15}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — PERFIL (cards visuais, auto-avança) */}
            {step === 2 && (
              <div className={`${styles.questionContainer} ${styles.animateSlideUp}`}>
                <div className={styles.stepIndicator}>3 → SEU PERFIL</div>
                <label>Qual melhor descreve você hoje?</label>
                <p className={styles.cardHint}>Selecione para avançar automaticamente</p>
                <div className={styles.visualCardGrid}>
                  {PERFIL_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.visualCard} ${styles.visualCardTall} ${formData.perfil === opt.value ? styles.visualCardSelected : ''}`}
                      onClick={() => selectCard('perfil', opt.value)}
                    >
                      <span className={styles.cardIcon}>{opt.icon}</span>
                      <div>
                        <span className={styles.cardLabel}>{opt.label}</span>
                        <span className={styles.cardSub}>{opt.sub}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3 — MAIOR DESAFIO (cards visuais, auto-avança) */}
            {step === 3 && (
              <div className={`${styles.questionContainer} ${styles.animateSlideUp}`}>
                <div className={styles.stepIndicator}>4 → SEU DESAFIO</div>
                <label>Qual é seu maior desafio agora?</label>
                <p className={styles.cardHint}>Selecione para avançar automaticamente</p>
                <div className={styles.visualCardGrid}>
                  {DESAFIO_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.visualCard} ${formData.desafio === opt.value ? styles.visualCardSelected : ''}`}
                      onClick={() => selectCard('desafio', opt.value)}
                    >
                      <span className={styles.cardIcon}>{opt.icon}</span>
                      <span className={styles.cardLabel}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4 — PROGRAMA + LGPD */}
            {step === 4 && (
              <div className={`${styles.questionContainer} ${styles.animateSlideUp}`}>
                <div className={styles.stepIndicator}>5 → FINALIZAR</div>
                <label>
                  {firstName ? `Quase lá, ${firstName}! Por onde quer começar?` : 'Por onde quer começar?'}
                </label>
                <div className={styles.programCardGrid}>
                  {PROGRAMA_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.programVisualCard} ${formData.programa === opt.value ? styles.visualCardSelected : ''}`}
                      onClick={() => set('programa', opt.value)}
                    >
                      <span className={styles.progCardLabel}>{opt.label}</span>
                      <span className={styles.progCardSub}>{opt.sub}</span>
                    </button>
                  ))}
                </div>

                <div className={styles.finalExtras}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.lgpd}
                      onChange={(e) => set('lgpd', e.target.checked)}
                    />
                    <span>
                      Concordo com a{' '}
                      <a href="#" target="_blank" rel="noopener noreferrer">Política de Privacidade</a>
                      {' '}e autorizo o contato da equipe do Método E+.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {error && <p className={styles.error} role="alert">{error}</p>}

            <div className={styles.actions}>
              <div className={styles.actionsLeft}>
                {step > 0 && (
                  <button type="button" onClick={prevStep} className={styles.backBtn} disabled={loading}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
              </div>
              <div className={styles.actionsRight}>
                {!isCardStep && step < TOTAL_STEPS - 1 && (
                  <button type="button" onClick={nextStep} className={styles.submitBtn}>
                    Continuar
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                {step === TOTAL_STEPS - 1 && (
                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? 'Enviando...' : 'Quero Despertar 🔥'}
                  </button>
                )}
              </div>
            </div>

            {!isCardStep && step < TOTAL_STEPS - 1 && (
              <div className={styles.pressEnterHint}>
                Pressione <strong>Enter ↵</strong> para avançar
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
