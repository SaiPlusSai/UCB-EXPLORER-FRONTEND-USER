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
  const [filtro, setFiltro] = useState('pendientes')

  const cargar = async () => {
    setCargando(true)

    try {
      const [p, h] = await Promise.all([
        triviaApi.listar(),
        triviaApi.historial(),
      ])

      setPreguntas(p.data.data)
      setHistorial(h.data.data)
    } catch (e) {
      setError(
        e.response?.data?.error ||
        'Error cargando trivia'
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const yaRespondida = (preguntaId) =>
    historial.some(
      (h) => h.pregunta_id === preguntaId
    )

  const responder = async (pregunta) => {
    const opcionId = seleccion[pregunta.id]

    if (!opcionId) return

    setEnviando(true)
    setError('')

    try {
      const { data } =
        await triviaApi.responder(
          pregunta.id,
          opcionId
        )

      setFeedback({
        ...data.data,
        pregunta_id: pregunta.id,
      })

      await refresh()

      const h =
        await triviaApi.historial()

      setHistorial(h.data.data)
    } catch (e) {
      setError(
        e.response?.data?.error ||
        'No se pudo enviar'
      )
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <div className="tg-page">
        <div className="tg-loader" />
      </div>
    )
  }

  const completadas = historial.length

  const pendientes =
    preguntas.length - completadas

  const preguntasFiltradas =
    preguntas.filter((p) => {
      const respondida =
        yaRespondida(p.id)

      if (filtro === 'respondidas') {
        return respondida
      }

      if (filtro === 'pendientes') {
        return !respondida
      }

      return true
    })

  return (
    <div className="tg-page">
      <h2
        style={{
          color: '#fff',
          margin: '4px 0 6px',
        }}
      >
        Trivia UCB
      </h2>

      <p
        className="tg-text-muted"
        style={{ marginBottom: 14 }}
      >
        Respondidas: {completadas} · Pendientes:{' '}
        {pendientes}
      </p>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        {[
          {
            key: 'pendientes',
            label: 'Pendientes',
          },
          {
            key: 'respondidas',
            label: 'Respondidas',
          },
          {
            key: 'todas',
            label: 'Todas',
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              setFiltro(tab.key)
            }
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '8px 14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: '.2s',
              background:
                filtro === tab.key
                  ? '#facc15'
                  : '#ffffff20',
              color:
                filtro === tab.key
                  ? '#001b44'
                  : '#fff',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="tg-error">
          {error}
        </div>
      )}

      {filtro !== 'respondidas' &&
        preguntas.length > 0 &&
        completadas === preguntas.length && (
          <div className="tg-card">
            ¡Has respondido toda la trivia
            disponible! 🎉
          </div>
        )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {preguntasFiltradas.map((p) => {
          const respondida =
            yaRespondida(p.id)

          const respuesta =
            historial.find(
              (h) =>
                h.pregunta_id === p.id
            )

          return (
            <div
              className="tg-card"
              key={p.id}
              style={{
                opacity: respondida
                  ? 0.92
                  : 1,
                border: respondida
                  ? respuesta?.correcta
                    ? '2px solid #22c55e'
                    : '2px solid #ef4444'
                  : '2px solid transparent',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--ucb-dorado)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {p.carrera_nombre || 'General'} · {p.puntos} pts
              </div>

              <h3
                style={{
                  margin:
                    '6px 0 12px',
                }}
              >
                {p.pregunta}
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection:
                    'column',
                  gap: 8,
                }}
              >
                {p.opciones.map((o) => {
                  const checked =
                    seleccion[p.id] ===
                    o.id

                  return (
                    <label
                      key={o.id}
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: '12px 16px',
                        border: checked ? '1px solid var(--ucb-dorado)' : '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 12,
                        background: checked ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: checked ? 'var(--ucb-dorado)' : 'rgba(255, 255, 255, 0.9)',
                        cursor: respondida ? 'not-allowed' : 'pointer',
                        opacity: respondida ? 0.85 : 1,
                        transition: 'all 0.2s',
                        alignItems: 'center'
                      }}
                    >
                      <input
                        type="radio"
                        disabled={
                          respondida
                        }
                        name={`p${p.id}`}
                        checked={
                          checked
                        }
                        onChange={() =>
                          setSeleccion(
                            (s) => ({
                              ...s,
                              [p.id]:
                                o.id,
                            })
                          )
                        }
                      />

                      <span>
                        {
                          o.texto_opcion
                        }
                      </span>
                    </label>
                  )
                })}
              </div>

              {respondida ? (
                <button
                  className="tg-btn"
                  style={{
                    marginTop: 14,
                    opacity: 0.9,
                    background:
                      respuesta?.correcta
                        ? '#16a34a'
                        : '#dc2626',
                  }}
                  disabled
                >
                  {respuesta?.correcta
                    ? '✅ Respondida correctamente'
                    : '❌ Ya respondida'}
                </button>
              ) : (
                <button
                  className="tg-btn"
                  style={{
                    marginTop: 14,
                  }}
                  disabled={
                    !seleccion[p.id] ||
                    enviando
                  }
                  onClick={() =>
                    responder(p)
                  }
                >
                  Responder
                </button>
              )}

              {feedback?.pregunta_id ===
                p.id && (
                <div
                  className={
                    feedback.correcta
                      ? 'tg-success'
                      : 'tg-error'
                  }
                  style={{ marginTop: 12 }}
                >
                  {feedback.correcta
                    ? `✅ ¡Correcto! +${feedback.puntos_otorgados} puntos`
                    : '❌ Respuesta incorrecta'}

                  {feedback.mensaje_feedback && (
                    <div
                      style={{
                        marginTop: 4,
                      }}
                    >
                      {
                        feedback.mensaje_feedback
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}