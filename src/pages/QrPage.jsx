import { useEffect, useState } from 'react'
import { qrApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext.jsx'

export default function QrPage() {
  const { refresh } = useAuth()
  const [contenido, setContenido] = useState('')
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [ok, setOk] = useState('')
  const [error, setError] = useState('')

  const cargar = () =>
    qrApi
      .historial()
      .then(({ data }) => setHistorial(data.data))
      .catch(() => {})
      .finally(() => setCargando(false))

  useEffect(() => {
    cargar()
  }, [])

  const escanear = async (e) => {
    e.preventDefault()
    if (!contenido.trim()) return
    setEnviando(true)
    setError('')
    setOk('')
    try {
      const { data } = await qrApi.escanear(contenido.trim())
      setOk(
        `+${data.data.puntos_otorgados} puntos. Total: ${data.data.total_puntos}`
      )
      setContenido('')
      await refresh()
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo registrar el QR')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="tg-page">
      <h2 style={{ color: '#fff', margin: '4px 0 6px' }}>Escaneo QR</h2>
      <p className="tg-text-muted" style={{ marginBottom: 14 }}>
        En esta fase preliminar, ingresa el código del QR (lo entregaremos físicamente
        durante el evento). El lector con cámara se integrará después.
      </p>

      <form onSubmit={escanear} className="tg-card" style={{ marginBottom: 16 }}>
        <input
          className="tg-input tg-input--light"
          placeholder="Código del QR (ej: PUNTOS:100)"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
        />
        <button className="tg-btn" style={{ marginTop: 10 }} disabled={enviando}>
          {enviando ? 'Validando…' : 'Validar QR'}
        </button>
      </form>

      {ok && <div className="tg-success">{ok}</div>}
      {error && <div className="tg-error">{error}</div>}

      <h3 style={{ color: '#fff', marginTop: 18 }}>Historial</h3>
      {cargando ? (
        <div className="tg-loader" />
      ) : historial.length === 0 ? (
        <div className="tg-card--ghost tg-card" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
          Aún no has escaneado ningún QR.
        </div>
      ) : (
        <ul className="tg-list">
          {historial.map((h) => (
            <li className="tg-list-item" key={h.id}>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {h.contenido_qr.slice(0, 30)}
                  {h.contenido_qr.length > 30 ? '…' : ''}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                  {new Date(h.escaneado_en).toLocaleString()}
                </div>
              </div>
              <span className="tg-chip tg-chip--success">+{h.puntos_otorgados}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
