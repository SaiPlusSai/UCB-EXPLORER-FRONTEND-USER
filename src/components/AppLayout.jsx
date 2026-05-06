import { NavLink, Outlet, useLocation } from 'react-router-dom'
import banner from '../assets/images/banner.jpg'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/', label: 'Inicio', icon: '🏠', end: true },
  { to: '/trivia', label: 'Trivia', icon: '🧠' },
  { to: '/qr', label: 'QR', icon: '📷' },
  { to: '/premios', label: 'Premios', icon: '🎁' },
  { to: '/recordatorios', label: 'Agenda', icon: '🗓️' },
]

export default function AppLayout() {
  const { logout, visitante } = useAuth()
  const location = useLocation()

  return (
    <div className="app-shell">
      <header className="tg-header">
        <img src={banner} alt="UCB" style={{ height: 36, borderRadius: 8 }} />
        <button
          className="tg-btn tg-btn--ghost"
          style={{ width: 'auto', padding: '6px 14px', fontSize: 13 }}
          onClick={() => {
            if (window.confirm('¿Cerrar sesión?')) logout()
          }}
        >
          Salir
        </button>
      </header>

      {visitante && (
        <div
          style={{
            background: 'var(--ucb-azul-oscuro)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 12,
            padding: '4px 16px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Ticket #{visitante.ticket_id}</span>
          <span>{visitante.colegio?.nombre || ''}</span>
        </div>
      )}

      <main key={location.pathname}>
        <Outlet />
      </main>

      <nav className="tg-bottom-bar">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `tg-bottom-bar__btn${isActive ? ' active' : ''}`
            }
          >
            <span className="tg-bottom-bar__icon">{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
