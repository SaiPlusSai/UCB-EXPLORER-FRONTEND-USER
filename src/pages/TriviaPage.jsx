import { useEffect, useState } from 'react'
import { triviaApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext.jsx'

export default function TriviaPage() {
  const { refresh } = useAuth()
  const [preguntas, setPreguntas] = useState([])
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [seleccion, setSeleccion] = useState({})
  const [error, setError] = useState('')

  const cargar = async () => {
    setCargando(true)
    try {
      const [p, h] = await Promise.all([triviaApi.listar(), triviaApi.historial()])
      setPreguntas(p.data.data)
      setHistorial(h.data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error cargando trivia')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const yaRespondida = (preguntaId) =>
    historial.some((h) => h.pregunta_id === preguntaId)

  const responder = async (pregunta) => {
    const opcionId = seleccion[pregunta.id]
    if (!opcionId) return
    setEnviando(true)
    setError('')
    try {
      const { data } = await triviaApi.responder(pregunta.id, opcionId)
      setFeedback({ ...data.data, pregunta_id: pregunta.id })
      await refresh()
      const h = await triviaApi.historial()
      setHistorial(h.data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo enviar')
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return <div className="tg-page"><div className="tg-loader" /></div>

  const pendientes = preguntas.filter((p) => !yaRespondida(p.id))
  const completadas = historial.length

  return (
    <div className="tg-page">
      <h2 style={{ color: '#fff', margin: '4px 0 6px' }}>Trivia UCB</h2>
      <p className="tg-text-muted" style={{ marginBottom: 14 }}>
        Respondidas: {completadas} · Pendientes: {pendientes.length}
      </p>

      {error && <div className="tg-error">{error}</div>}

      {pendientes.length === 0 && (
        <div className="tg-card">¡Has respondido toda la trivia disponible! 🎉</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {pendientes.map((p) => (
          <div className="tg-card" key={p.id}>
            <div style={{ fontSize: 12, color: 'var(--ucb-azul)' }}>
              {p.carrera_nombre || 'General'} · {p.puntos} pts
            </div>
            <h3 style={{ margin: '6px 0 12px' }}>{p.pregunta}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {p.opciones.map((o) => {
                const checked = seleccion[p.id] === o.id
                return (
                  <label
                    key={o.id}
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: 10,
                      border: '1px solid #e5e7eb',
                      borderRadius: 12,
                      background: checked ? '#fff7c0' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name={`p${p.id}`}
                      checked={checked}
                      onChange={() =>
                        setSeleccion((s) => ({ ...s, [p.id]: o.id }))
                      }
                    />
                    <span>{o.texto_opcion}</span>
                  </label>
                )
              })}
            </div>

            <button
              className="tg-btn"
              style={{ marginTop: 14 }}
              disabled={!seleccion[p.id] || enviando}
              onClick={() => responder(p)}
            >
              Responder
            </button>

            {feedback?.pregunta_id === p.id && (
              <div
                className={feedback.correcta ? 'tg-success' : 'tg-error'}
                style={{ color: feedback.correcta ? '#065f46' : '#7f1d1d' }}
              >
                {feedback.correcta
                  ? `✅ ¡Correcto! +${feedback.puntos_otorgados} puntos`
                  : '❌ Respuesta incorrecta'}
                {feedback.mensaje_feedback && (
                  <div style={{ marginTop: 4 }}>{feedback.mensaje_feedback}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
