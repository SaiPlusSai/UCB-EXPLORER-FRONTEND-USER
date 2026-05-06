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
  const [colegioNuevo, setColegioNuevo] = useState('')
  const [seleccion, setSeleccion] = useState([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) navigate('/')
  }, [token, navigate])

  useEffect(() => {
    Promise.all([carrerasApi.listar(), colegiosApi.listar()])
      .then(([c, col]) => {
        setCarreras(c.data.data || [])
        setColegios(col.data.data || [])
      })
      .catch(() => setError('No se pudo cargar carreras o colegios'))
      .finally(() => setCargando(false))
  }, [])

  const toggleCarrera = (id) => {
    setSeleccion((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!colegioId && !colegioNuevo.trim()) {
      setError('Selecciona o ingresa tu colegio')
      return
    }
    if (seleccion.length === 0) {
      setError('Selecciona al menos 1 carrera (máximo 3)')
      return
    }
    setEnviando(true)
    try {
      const payload = {
        carreras: seleccion.map((carrera_id, idx) => ({
          carrera_id,
          prioridad: idx + 1,
        })),
      }
      if (colegioId) payload.colegio_id = Number(colegioId)
      else payload.colegio = colegioNuevo.trim()

      const { data } = await visitanteApi.acceso(payload)
      login(data.data.token, data.data.visitante)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar sesión')
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <div className="app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="tg-loader" style={{ margin: 'auto' }} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="tg-page">
        <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
          <img src={logoUcb} alt="UCB" style={{ height: 140 }} />
          <h1 style={{ color: '#fff', margin: '12px 0 4px' }}>UCB Explorer</h1>
          <p className="tg-text-muted" style={{ marginBottom: 18 }}>
            Bienvenido al Open House. Selecciona tu colegio y hasta 3 carreras de interés.
          </p>
        </div>

        <form onSubmit={submit}>
          <label className="tg-label">Colegio</label>
          <select
            className="tg-input"
            value={colegioId}
            onChange={(e) => setColegioId(e.target.value)}
          >
            <option value="">— Selecciona tu colegio —</option>
            {colegios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          {!colegioId && (
            <input
              type="text"
              className="tg-input"
              placeholder="o escribe el nombre de tu colegio"
              style={{ marginTop: 10 }}
              value={colegioNuevo}
              onChange={(e) => setColegioNuevo(e.target.value)}
            />
          )}

          <div style={{ marginTop: 22 }}>
            <label className="tg-label">
              Carreras de interés ({seleccion.length}/3)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {carreras.map((c) => {
                const checked = seleccion.includes(c.id)
                const idx = seleccion.indexOf(c.id)
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCarrera(c.id)}
                    className="tg-list-item"
                    style={{
                      cursor: 'pointer',
                      borderColor: checked
                        ? 'var(--ucb-dorado)'
                        : 'rgba(255,255,255,0.1)',
                      background: checked
                        ? 'rgba(255, 215, 0, 0.18)'
                        : 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      textAlign: 'left',
                    }}
                  >
                    <span>{c.nombre}</span>
                    {checked && <span className="tg-chip">#{idx + 1}</span>}
                  </button>
                )
              })}
              {carreras.length === 0 && (
                <div className="tg-text-muted">
                  No hay carreras activas todavía. Pide al administrador que cree algunas.
                </div>
              )}
            </div>
          </div>

          {error && <div className="tg-error">{error}</div>}

          <button
            type="submit"
            className="tg-btn"
            style={{ marginTop: 20 }}
            disabled={enviando}
          >
            {enviando ? 'Iniciando…' : 'Iniciar Open House'}
          </button>

          <p className="tg-text-muted" style={{ textAlign: 'center', marginTop: 20, fontSize: 12 }}>
            Fase preliminar — el ticket oficial se integrará más adelante.
          </p>
        </form>
      </div>
    </div>
  )
}
