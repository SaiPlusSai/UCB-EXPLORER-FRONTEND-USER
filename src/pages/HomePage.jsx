import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { visitanteApi } from '../api/endpoints'

const TILES = [
  { to: '/qr', icon: '📷', label: 'Escanear QR' },
  { to: '/trivia', icon: '🧠', label: 'Trivia' },
  { to: '/premios', icon: '🎁', label: 'Premios' },
  { to: '/recordatorios', icon: '🗓️', label: 'Agenda' },
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
      <h2 style={{ color: '#fff', margin: '4px 0 14px' }}>¡Bienvenido!</h2>
      <p className="tg-text-muted" style={{ marginBottom: 16 }}>
        Explora la UCB, gana puntos y canjea premios.
      </p>

      <div className="tg-points-card" style={{ marginBottom: 18 }}>
        <div>
          <div className="tg-points-card__label">Puntos acumulados</div>
          <div className="tg-points-card__num">{puntos}</div>
        </div>
        <div style={{ fontSize: 56 }}>🏆</div>
      </div>

      <div className="tg-grid-2" style={{ marginBottom: 18 }}>
        {TILES.map((t) => (
          <Link key={t.to} to={t.to} className="tg-tile">
            <span className="icon">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        ))}
      </div>

      <Link to="/feedback" className="tg-btn" style={{ marginBottom: 16 }}>
        Dejar Feedback ✨
      </Link>

      {carreras.length > 0 && (
        <div className="tg-card--ghost tg-card" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
          <h3 style={{ color: 'var(--ucb-dorado)', margin: '0 0 10px' }}>Tus carreras</h3>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {carreras.map((c) => (
              <li key={c.carrera_id} style={{ marginBottom: 4 }}>
                {c.nombre}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
