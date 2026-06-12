import { useState, useEffect } from 'react'
import Logo from '../Logo'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Logo />
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Menu principal">
          <a href="/#programas" className={styles.link} onClick={() => setMenuOpen(false)}>Programas</a>
          <a href="/#mentores" className={styles.link} onClick={() => setMenuOpen(false)}>Mentores</a>
          <a href="/#depoimentos" className={styles.link} onClick={() => setMenuOpen(false)}>Cases</a>
          <a href="/#faq" className={styles.link} onClick={() => setMenuOpen(false)}>FAQ</a>
        </nav>
        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
