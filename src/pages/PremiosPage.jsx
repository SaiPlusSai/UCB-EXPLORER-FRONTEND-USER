import { useEffect, useState } from 'react'
import { premiosApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext.jsx'

export default function PremiosPage() {
  const { visitante, refresh } = useAuth()
  const [premios, setPremios] = useState([])
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [accion, setAccion] = useState(null)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const cargar = async () => {
    setCargando(true)
    try {
      const [p, h] = await Promise.all([premiosApi.listar(), premiosApi.historial()])
      setPremios(p.data.data)
      setHistorial(h.data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error cargando premios')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const canjear = async (id) => {
    setAccion(id)
    setError('')
    setOk('')
    try {
      const { data } = await premiosApi.canjear(id)
      setOk(`Canje exitoso. Te quedan ${data.data.puntos_restantes} puntos.`)
      await refresh()
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo canjear')
    } finally {
      setAccion(null)
    }
  }

  const puntos = visitante?.puntos_totales ?? 0

  if (cargando) return <div className="tg-page"><div className="tg-loader" /></div>

  return (
    <div className="tg-page">
      <h2 style={{ color: '#fff', margin: '4px 0 6px' }}>Catálogo de premios</h2>
      <p className="tg-text-muted" style={{ marginBottom: 14 }}>
        Tus puntos: <strong style={{ color: 'var(--ucb-dorado)' }}>{puntos}</strong>
      </p>

      {error && <div className="tg-error">{error}</div>}
      {ok && <div className="tg-success">{ok}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {premios.map((p) => {
          const puede = puntos >= p.costo_puntos && p.stock > 0
          return (
            <div className="tg-card" key={p.id} style={{ display: 'flex', gap: 12 }}>
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 12,
                  background: '#f1f3f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                }}
              >
                {p.imagen_url ? (
                  <img
                    src={p.imagen_url}
                    alt={p.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                  />
                ) : (
                  '🎁'
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                {p.descripcion && (
                  <div style={{ fontSize: 13, color: '#475569' }}>{p.descripcion}</div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 8,
                    fontSize: 13,
                  }}
                >
                  <span>💰 {p.costo_puntos} pts</span>
                  <span>📦 stock: {p.stock}</span>
                </div>
                <button
                  className="tg-btn"
                  style={{ marginTop: 8, padding: '8px 12px', fontSize: 14 }}
                  disabled={!puede || accion === p.id}
                  onClick={() => canjear(p.id)}
                >
                  {!puede ? 'No disponible' : accion === p.id ? 'Canjeando…' : 'Canjear'}
                </button>
              </div>
            </div>
          )
        })}
        {premios.length === 0 && (
          <div className="tg-card">No hay premios disponibles aún.</div>
        )}
      </div>

      {historial.length > 0 && (
        <>
          <h3 style={{ color: '#fff', marginTop: 22 }}>Mis canjes</h3>
          <ul className="tg-list">
            {historial.map((c) => (
              <li className="tg-list-item" key={c.id}>
                <span>{c.nombre}</span>
                <span className="tg-chip tg-chip--success">-{c.costo_puntos} pts</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
