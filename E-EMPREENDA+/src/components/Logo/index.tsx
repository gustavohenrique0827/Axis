import { Link } from 'react-router-dom'

interface LogoProps {
  size?: number
  column?: boolean
  showText?: boolean
}

export default function Logo({ size = 48, column = false, showText = true }: LogoProps) {
  return (
    <Link to="/" style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      flexDirection: column ? 'column' : 'row',
      gap: column ? '12px' : '16px',
      textDecoration: 'none'
    }}>
      <svg width={size} height={size * 0.8} viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Escadinha (Bars) */}
        <rect x="25" y="50" width="16" height="35" rx="3" fill="#8B4527" />
        <rect x="50" y="30" width="16" height="55" rx="3" fill="#C25218" />
        <rect x="75" y="10" width="16" height="75" rx="3" fill="#FF5C00" />
        
        {/* Seta (Arrow) */}
        <path d="M 20 65 Q 60 75 88 32" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" />
        <polygon points="94,22 82,34 94,38" fill="white" />
        
        {/* Sinal de Mais (Plus) */}
        <rect x="94" y="8" width="20" height="6" rx="1" fill="white" />
        <rect x="101" y="1" width="6" height="20" rx="1" fill="white" />
      </svg>
      {showText && (
        <span style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 800,
          fontSize: column ? size * 0.45 : size * 0.55,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          color: '#FFFFFF',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}>
          E-EMPREENDA <span style={{ color: '#FF5C00' }}>+</span>
        </span>
      )}
    </Link>
  )
}
