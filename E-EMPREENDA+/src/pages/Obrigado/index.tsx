import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import styles from './Obrigado.module.css'

interface Consultor {
  nome: string
  phone: string
}

function buildWppLink(phone: string, nome: string): string {
  // phone vem da tabela como '63992621914' (sem código do país)
  const numero = phone.startsWith('55') ? phone : `55${phone}`
  const msg = encodeURIComponent(
    `Olá, ${nome}! Acabei de me inscrever no Método E+ – O Despertar do Empreendedor e gostaria de saber sobre os próximos passos. 🚀`
  )
  return `https://wa.me/${numero}?text=${msg}`
}

function getInitials(nome: string) {
  return nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

export default function Obrigado() {
  const { state } = useLocation() as { state: { consultor?: Consultor } | null }
  const consultor: Consultor = state?.consultor ?? {
    nome: 'Anna Cristiny',
    phone: '63992621914',
  }

  const wppLink = buildWppLink(consultor.phone, consultor.nome)

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.bg} aria-hidden="true" />

        <div className={styles.card}>
          <div className={styles.iconWrap} aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF5C00"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <div className={styles.tag}>Inscrição Confirmada</div>

          <h1>
            Você deu o primeiro<br />
            <span className={styles.orange}>passo para Despertar!</span>
          </h1>

          <p>
            Recebemos sua inscrição. Seu consultor já foi notificado e entrará em
            contato em até <strong>24 horas úteis</strong>. Se quiser adiantar a
            conversa — fale agora mesmo no WhatsApp.
          </p>

          {/* Bloco WhatsApp com rodízio */}
          <div className={styles.wppBlock}>
            <p className={styles.wppLabel}>Fale com um de nossos Consultores</p>

            <div className={styles.consultorCard}>
              <div className={styles.consultorAvatar}>
                {getInitials(consultor.nome)}
              </div>
              <div className={styles.consultorInfo}>
                <span className={styles.consultorNome}>{consultor.nome}</span>
                <span className={styles.consultorRole}>SDR · Método E+</span>
              </div>
              <div className={styles.onlineDot} aria-label="Online" />
            </div>

            <a
              href={wppLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnWhatsapp}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Iniciar Conversa no WhatsApp
            </a>

            <span className={styles.wppNote}>
              Seg–Sex, 9h às 18h · Resposta em até 1h
            </span>
          </div>

          {/* Próximos Passos */}
          <div className={styles.nextSteps}>
            <h3>Próximos Passos</h3>
            <ol className={styles.steps}>
              <li>
                <span className={styles.stepNumber}>01</span>
                <div>
                  <strong>Conversa de Diagnóstico</strong>
                  <p>30 minutos com seu consultor para entender seu momento e alinhar expectativas com o Método E+.</p>
                </div>
              </li>
              <li>
                <span className={styles.stepNumber}>02</span>
                <div>
                  <strong>Confirmação da Vaga</strong>
                  <p>Formalização do acesso e integração ao ambiente da sua turma.</p>
                </div>
              </li>
              <li>
                <span className={styles.stepNumber}>03</span>
                <div>
                  <strong>Início da Jornada</strong>
                  <p>12 semanas de formação online para estruturar e escalar o seu negócio.</p>
                </div>
              </li>
            </ol>
          </div>

          <div className={styles.actions}>
            <Link to="/" className={styles.btnOutline}>Voltar ao Início</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
