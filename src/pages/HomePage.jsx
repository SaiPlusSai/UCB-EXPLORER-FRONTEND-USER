import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { visitanteApi } from '../api/endpoints'

const TILES = [
  { to: '/qr', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line><line x1="15" y1="15" x2="15.01" y2="15"></line><line x1="9" y1="15" x2="9.01" y2="15"></line></svg>, label: 'Escanear QR' },
  { to: '/trivia', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>, label: 'Trivia' },
  { to: '/premios', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>, label: 'Premios' },
  { to: '/recordatorios', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>, label: 'Agenda' },
]

export default function HomePage() {
  const { visitante, refresh } = useAuth()
  const [perfil, setPerfil] = useState(visitante)

  useEffect(() => {
    refresh()
    visitanteApi.me().then(({ data }) => setPerfil(data.data)).catch(() => {})
  }, [refresh])

  const puntos = perfil?.puntos_totales ?? visitante?.puntos_totales ?? 0
  const carreras = perfil?.carreras || []

  return (
    <div className="tg-page">
      <h2 style={{ fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg, var(--ucb-dorado) 0%, #fff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 6px', letterSpacing: '-0.5px' }}>¡Bienvenido!</h2>
      <p className="tg-text-muted" style={{ marginBottom: 24, fontSize: 15 }}>
        Explora la UCB, gana puntos y canjea premios.
      </p>

      <div className="tg-points-card">
        <div>
          <div className="tg-points-card__label">Puntos acumulados</div>
          <div className="tg-points-card__num">{puntos}</div>
        </div>
        <div style={{ background: 'rgba(255, 215, 0, 0.1)', width: 64, height: 64, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 215, 0, 0.2)', color: 'var(--ucb-dorado)', boxShadow: '0 10px 20px rgba(255, 215, 0, 0.15)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
        </div>
      </div>

      <div className="tg-grid-2">
        {TILES.map((t) => (
          <Link key={t.to} to={t.to} className="tg-tile">
            <span className="icon">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        ))}
      </div>

      <Link to="/feedback" className="tg-btn tg-btn--ghost" style={{ marginBottom: 24 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        Dejar Feedback
      </Link>

      {carreras.length > 0 && (
        <div className="tg-card">
          <h3 style={{ fontSize: 17, color: 'var(--ucb-blanco)', fontWeight: 700, margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'block', width: 4, height: 18, background: 'var(--ucb-dorado)', borderRadius: 4 }}></span>
            Tus carreras de interés
          </h3>
          <div className="tg-list">
            {carreras.map((c, index) => (
              <div key={c.carrera_id} className="tg-list-item" style={{ pointerEvents: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="tg-chip">{index + 1}</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 15, fontWeight: 500 }}>{c.nombre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
