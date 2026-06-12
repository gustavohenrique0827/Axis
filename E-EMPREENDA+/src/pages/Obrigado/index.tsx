import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import styles from './Obrigado.module.css'

export default function Obrigado() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.bg} aria-hidden="true" />
        <div className={styles.card}>
          <div className={styles.iconWrap} aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <div className={styles.tag}>Inscrição Confirmada</div>

          <h1>
            Recebemos sua<br />
            <span className={styles.orange}>Inscrição com Sucesso</span>
          </h1>

          <p>
            Nossa equipe analisará seu perfil e entrará em contato em até <strong>24 horas úteis</strong>{' '}
            para agendar a conversa de alinhamento. Verifique sua caixa de entrada e spam.
          </p>

          <div className={styles.nextSteps}>
            <h3>Próximos Passos</h3>
            <ol className={styles.steps}>
              <li>
                <span className={styles.stepNumber}>01</span>
                <div>
                  <strong>Análise de Perfil</strong>
                  <p>Nossa equipe revisa as informações e identifica o programa mais adequado para seu momento de negócio.</p>
                </div>
              </li>
              <li>
                <span className={styles.stepNumber}>02</span>
                <div>
                  <strong>Conversa de Alinhamento</strong>
                  <p>Uma sessão de 30 minutos para entender seu contexto, desafios e alinhar expectativas com o programa.</p>
                </div>
              </li>
              <li>
                <span className={styles.stepNumber}>03</span>
                <div>
                  <strong>Início da Aceleração</strong>
                  <p>Confirmação da vaga, formalização do acesso e integração ao grupo da sua turma.</p>
                </div>
              </li>
            </ol>
          </div>

          <div className={styles.actions}>
            <Link to="/" className={styles.btnPrimary}>Voltar ao Início</Link>
            <a href="mailto:contato@eempreendamais.com.br" className={styles.btnOutline}>Falar com a Equipe</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
