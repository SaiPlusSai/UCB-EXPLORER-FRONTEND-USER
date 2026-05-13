import { NavLink, Outlet, useLocation } from 'react-router-dom'
import banner from '../assets/images/banner.png'
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
      <header className="tg-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0, 20, 40, 0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <img src={banner} alt="UCB" style={{ height: 48, borderRadius: 8 }} />

        {visitante && (
          <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--ucb-dorado)' }}>
            Ticket #{visitante.ticket_id}
          </div>
        )}

        <button
          className="tg-btn tg-btn--ghost"
          style={{ width: 'auto', padding: '6px 14px', fontSize: 13, margin: 0, minHeight: 'auto', boxShadow: 'none' }}
          onClick={() => {
            if (window.confirm('¿Cerrar sesión?')) logout()
          }}
        >
          Salir
        </button>
      </header>

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
