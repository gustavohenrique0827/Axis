import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './AnnouncementBar.module.css'

const TARGET_DATE = new Date('2026-08-05T23:59:59')

function getCountdown() {
  const diff = TARGET_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 }
  return {
    days:  Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins:  Math.floor((diff % 3600000) / 60000),
    secs:  Math.floor((diff % 60000) / 1000),
  }
}

export default function AnnouncementBar() {
  const [count, setCount] = useState(getCountdown())
  const [online, setOnline] = useState(54)

  useEffect(() => {
    const t = setInterval(() => setCount(getCountdown()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setOnline(prev => Math.max(38, Math.min(89, prev + (Math.random() < 0.5 ? -1 : 1))))
    }, 4500)
    return () => clearInterval(t)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.dot} />
        <div className={styles.onlineText}>
          <strong>{online}</strong> empreendedores online agora
        </div>
      </div>

      <div className={styles.center}>
        <span className={styles.countLabel}>Inscrições encerram em:</span>
        <div className={styles.timer}>
          <span className={styles.timerUnit}>
            <strong>{count.days}</strong>
            <span className={styles.timerLabel}>DIAS</span>
          </span>
          <span className={styles.timerSep}>:</span>
          <span className={styles.timerUnit}>
            <strong>{pad(count.hours)}</strong>
            <span className={styles.timerLabel}>HORAS</span>
          </span>
          <span className={styles.timerSep}>:</span>
          <span className={styles.timerUnit}>
            <strong>{pad(count.mins)}</strong>
            <span className={styles.timerLabel}>MIN</span>
          </span>
          <span className={styles.timerSep}>:</span>
          <span className={styles.timerUnit}>
            <strong>{pad(count.secs)}</strong>
            <span className={styles.timerLabel}>SEG</span>
          </span>
        </div>
      </div>

      <div className={styles.right}>
        <Link to="/inscricao" className={styles.cta}>
          Garantir Minha Vaga
        </Link>
      </div>
    </div>
  )
}
