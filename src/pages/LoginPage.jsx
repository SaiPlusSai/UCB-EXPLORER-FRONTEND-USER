import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import logoUcb from '../assets/images/UCB.png'
import { useAuth } from '../context/AuthContext.jsx'
import { carrerasApi, colegiosApi, visitanteApi } from '../api/endpoints'

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const PARENTESCOS = [
  { value: '', label: '— Seleccionar —' },
  { value: 'padre_madre', label: 'Padre / Madre' },
  { value: 'hermano_a', label: 'Hermano/a' },
  { value: 'tio_a', label: 'Tío/a' },
  { value: 'abuelo_a', label: 'Abuelo/a' },
  { value: 'primo_a', label: 'Primo/a' },
  { value: 'otro', label: 'Otro familiar' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, token } = useAuth()

  const [tipoUsuario, setTipoUsuario] = useState('estudiante')
  const [carreras, setCarreras] = useState([])
  const [colegios, setColegios] = useState([])
  const [colegioId, setColegioId] = useState('')
  const [colegioOtro, setColegioOtro] = useState('')
  const [seleccion, setSeleccion] = useState([])

  // Familiar fields
  const [famNombre, setFamNombre] = useState('')
  const [famEmail, setFamEmail] = useState('')
  const [famTelefono, setFamTelefono] = useState('')
  const [famParentesco, setFamParentesco] = useState('')
  const [famNombreEstudiante, setFamNombreEstudiante] = useState('')

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

  const esOtro = colegioId === 'otro'

  const buildColegioPayload = () => {
    if (esOtro) {
      if (!colegioOtro.trim()) return { valid: false, msg: 'Escribe el nombre de tu colegio' }
      return { valid: true, colegio: colegioOtro.trim() }
    }
    if (!colegioId) return { valid: false, msg: 'Selecciona tu colegio' }
    return { valid: true, colegio_id: Number(colegioId) }
  }

  const submitEstudiante = async (e) => {
    e.preventDefault()
    setError('')

    const col = buildColegioPayload()
    if (!col.valid) { setError(col.msg); return }

    if (seleccion.length === 0) {
      setError('Selecciona al menos 1 carrera (máximo 3)')
      return
    }

    setEnviando(true)

    try {
      const payload = {
        ...col,
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

  const submitFamiliar = async (e) => {
    e.preventDefault()
    setError('')

    if (!famNombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!famTelefono.trim()) { setError('El número de contacto es obligatorio'); return }

    const col = buildColegioPayload()
    if (!col.valid) { setError(col.msg); return }

    if (seleccion.length === 0) {
      setError('Selecciona al menos 1 carrera (máximo 3)')
      return
    }

    setEnviando(true)

    try {
      const payload = {
        nombre: famNombre.trim(),
        email: famEmail.trim() || null,
        telefono: famTelefono.trim(),
        parentesco: famParentesco || null,
        nombre_estudiante: famNombreEstudiante.trim() || null,
        ...col,
        carreras: seleccion.map((carrera_id, idx) => ({
          carrera_id,
          prioridad: idx + 1,
        })),
      }

      const { data } = await visitanteApi.accesoFamiliar(payload)

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

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('')
      const col = buildColegioPayload()
      if (!col.valid) { setError(col.msg); return }

      if (seleccion.length === 0) {
        setError('Selecciona al menos 1 carrera (máximo 3)')
        return
      }

      setEnviando(true)

      try {
        const payload = {
          access_token: tokenResponse.access_token,
          ...col,
          carreras: seleccion.map((carrera_id, idx) => ({
            carrera_id,
            prioridad: idx + 1,
          })),
        }

        const { data } = await visitanteApi.accesoGoogle(payload)

        login(data.data.token, data.data.visitante)
        navigate('/')
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudo iniciar sesión con Google')
      } finally {
        setEnviando(false)
      }
    },
    onError: () => {
      setError('Falló el inicio de sesión con Google')
    }
  })

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <img src={logoUcb} alt="UCB" style={{ height: 100, filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4))', marginBottom: 20 }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ucb-blanco)', margin: '0 0 10px 0', letterSpacing: '-0.5px', textAlign: 'center' }}>UCB Explorer</h1>
          <p className="tg-text-muted" style={{ textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
            Bienvenido al Open House.<br />
            {tipoUsuario === 'estudiante'
              ? 'Selecciona tu colegio y hasta 3 carreras de interés.'
              : 'Registra tus datos como familiar o acompañante.'}
          </p>
        </div>

        {/* Toggle estudiante / familiar */}
        <div className="tg-user-toggle">
          <button
            type="button"
            className={`tg-user-toggle__btn ${tipoUsuario === 'estudiante' ? 'active' : ''}`}
            onClick={() => { setTipoUsuario('estudiante'); setError('') }}
          >
            🎓 Estudiante
          </button>
          <button
            type="button"
            className={`tg-user-toggle__btn ${tipoUsuario === 'familiar' ? 'active' : ''}`}
            onClick={() => { setTipoUsuario('familiar'); setError('') }}
          >
            👨‍👩‍👧 Familiar
          </button>
        </div>

        <form onSubmit={tipoUsuario === 'estudiante' ? submitEstudiante : submitFamiliar}>

          {/* ======= FAMILIAR FIELDS ======= */}
          {tipoUsuario === 'familiar' && (
            <>
              <div className="tg-form-group">
                <div className="tg-label"><span>Nombre completo *</span></div>
                <input
                  className="tg-input"
                  placeholder="Ej: Juan Pérez"
                  value={famNombre}
                  onChange={(e) => setFamNombre(e.target.value)}
                />
              </div>

              <div className="tg-form-row">
                <div className="tg-form-group">
                  <div className="tg-label"><span>Correo</span></div>
                  <input
                    className="tg-input"
                    type="email"
                    placeholder="correo@email.com"
                    value={famEmail}
                    onChange={(e) => setFamEmail(e.target.value)}
                  />
                </div>
                <div className="tg-form-group">
                  <div className="tg-label"><span>Teléfono *</span></div>
                  <input
                    className="tg-input"
                    type="tel"
                    placeholder="Ej: 75851671"
                    value={famTelefono}
                    onChange={(e) => setFamTelefono(e.target.value)}
                  />
                </div>
              </div>

              <div className="tg-form-row">
                <div className="tg-form-group">
                  <div className="tg-label"><span>Parentesco</span></div>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="tg-input"
                      value={famParentesco}
                      onChange={(e) => setFamParentesco(e.target.value)}
                    >
                      {PARENTESCOS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255, 255, 255, 0.5)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>
                <div className="tg-form-group">
                  <div className="tg-label"><span>Estudiante</span></div>
                  <input
                    className="tg-input"
                    placeholder="Nombre del estudiante"
                    value={famNombreEstudiante}
                    onChange={(e) => setFamNombreEstudiante(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* ======= GOOGLE SIGN-IN (only for students) ======= */}
          {tipoUsuario === 'estudiante' && (
            <>
              <button
                type="button"
                className="tg-btn--google"
                onClick={() => loginWithGoogle()}
              >
                <GoogleIcon />
                Continuar con Google
              </button>

              <div className="tg-divider">o</div>
            </>
          )}

          {/* ======= COLEGIO SELECT ======= */}
          <div className="tg-label">
            <span>{tipoUsuario === 'familiar' ? 'Colegio del estudiante' : 'Colegio'}</span>
          </div>

          <div style={{ position: 'relative', marginBottom: esOtro ? 0 : 32 }}>
            <select
              className="tg-input"
              value={colegioId}
              onChange={(e) => { setColegioId(e.target.value); if (e.target.value !== 'otro') setColegioOtro('') }}
            >
              <option value="">— Selecciona tu colegio —</option>
              {colegios.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
              <option value="otro">✏️ Otro (escribir nombre)</option>
            </select>
            <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255, 255, 255, 0.5)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          {esOtro && (
            <div className="tg-otro-input" style={{ marginBottom: 32 }}>
              <input
                className="tg-input"
                placeholder="Escribe el nombre de tu colegio..."
                value={colegioOtro}
                onChange={(e) => setColegioOtro(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* ======= CARRERAS ======= */}
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
            {enviando ? 'Iniciando…' : tipoUsuario === 'estudiante' ? 'Iniciar Open House' : 'Registrarme como familiar'}
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