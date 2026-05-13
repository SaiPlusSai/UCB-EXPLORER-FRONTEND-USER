import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoUcb from '../assets/images/UCB.png'
import { useAuth } from '../context/AuthContext.jsx'
import { carrerasApi, colegiosApi, visitanteApi } from '../api/endpoints'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, token } = useAuth()

  const [carreras, setCarreras] = useState([])
  const [colegios, setColegios] = useState([])
  const [colegioId, setColegioId] = useState('')
  const [seleccion, setSeleccion] = useState([])

  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) navigate('/')
  }, [token, navigate])

  useEffect(() => {
    Promise.all([
      carrerasApi.listar(),
      colegiosApi.listar(),
    ])
      .then(([c, col]) => {
        setCarreras(c.data.data || [])
        setColegios(col.data.data || [])
      })
      .catch(() => {
        setError('No se pudo cargar carreras o colegios')
      })
      .finally(() => {
        setCargando(false)
      })
  }, [])

  const toggleCarrera = (id) => {
    setSeleccion((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id)
      }

      if (prev.length >= 3) {
        return prev
      }

      return [...prev, id]
    })
  }

  const submit = async (e) => {
    e.preventDefault()

    setError('')

    if (!colegioId) {
      setError('Selecciona tu colegio')
      return
    }

    if (seleccion.length === 0) {
      setError('Selecciona al menos 1 carrera (máximo 3)')
      return
    }

    setEnviando(true)

    try {
      const payload = {
        colegio_id: Number(colegioId),

        carreras: seleccion.map((carrera_id, idx) => ({
          carrera_id,
          prioridad: idx + 1,
        })),
      }

      const { data } = await visitanteApi.acceso(payload)

      login(data.data.token, data.data.visitante)

      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'No se pudo iniciar sesión'
      )
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="tg-loader" />
      </div>
    )
  }

  return (
    <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="tg-card" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <img src={logoUcb} alt="UCB" style={{ height: 100, filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4))', marginBottom: 20 }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ucb-blanco)', margin: '0 0 10px 0', letterSpacing: '-0.5px', textAlign: 'center' }}>UCB Explorer</h1>
          <p className="tg-text-muted" style={{ textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
            Bienvenido al Open House.<br />
            Selecciona tu colegio y hasta 3 carreras de interés.
          </p>
        </div>

        <form onSubmit={submit}>
          <div className="tg-label">
            <span>Colegio</span>
          </div>

          <div style={{ position: 'relative', marginBottom: 32 }}>
            <select
              className="tg-input"
              value={colegioId}
              onChange={(e) => setColegioId(e.target.value)}
            >
              <option value="">— Selecciona tu colegio —</option>
              {colegios.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255, 255, 255, 0.5)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          <div className="tg-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Carreras de interés</span>
            <span style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '3px 10px', borderRadius: 12, fontSize: 12, color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>{seleccion.length} / 3</span>
          </div>

          <div className="tg-list" style={{ marginBottom: 36, maxHeight: 300, overflowY: 'auto', paddingRight: 6 }}>
            {carreras.map((c) => {
              const checked = seleccion.includes(c.id)
              const idx = seleccion.indexOf(c.id)

              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleCarrera(c.id)}
                  className={`tg-list-item ${checked ? 'is-selected' : ''}`}
                >
                  <span>{c.nombre}</span>
                  {checked && (
                    <span className="tg-chip">
                      {idx + 1}
                    </span>
                  )}
                </button>
              )
            })}
            
            {carreras.length === 0 && (
              <div className="tg-text-muted" style={{textAlign: 'center', padding: '20px 0'}}>
                No hay carreras activas todavía.<br/>Pide al administrador que cree algunas.
              </div>
            )}
          </div>

          {error && (
            <div className="tg-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="tg-btn"
            disabled={enviando}
          >
            {enviando ? 'Iniciando…' : 'Iniciar Open House'}
            {!enviando && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            )}
          </button>

          <p className="tg-text-muted" style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
            Fase preliminar — el ticket oficial se integrará más adelante.
          </p>
        </form>
      </div>
    </div>
  )
}