import { useEffect, useState } from 'react'
import { feedbackApi } from '../api/endpoints'

export default function FeedbackPage() {
  const [preguntas, setPreguntas] = useState([])
  const [respuestas, setRespuestas] = useState({})
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    feedbackApi
      .listar()
      .then(({ data }) => setPreguntas(data.data))
      .catch((e) => setError(e.response?.data?.error || 'Error'))
      .finally(() => setCargando(false))
  }, [])

  const setRespuesta = (id, campo, valor) =>
    setRespuestas((r) => ({ ...r, [id]: { ...(r[id] || {}), [campo]: valor } }))

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      const payload = preguntas
        .map((p) => {
          const r = respuestas[p.id] || {}
          if (p.tipo_pregunta === 'rating' && r.valor_rating)
            return { pregunta_id: p.id, valor_rating: Number(r.valor_rating) }
          if (p.tipo_pregunta !== 'rating' && r.respuesta_texto?.trim())
            return { pregunta_id: p.id, respuesta_texto: r.respuesta_texto.trim() }
          return null
        })
        .filter(Boolean)
      if (payload.length === 0) {
        setError('Responde al menos una pregunta')
        setEnviando(false)
        return
      }
      await feedbackApi.responder(payload)
      setOk(true)
      setRespuestas({})
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo enviar')
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return <div className="tg-page"><div className="tg-loader" /></div>

  return (
    <div className="tg-page">
      <h2 style={{ color: '#fff', margin: '4px 0 6px' }}>Tu feedback</h2>
      <p className="tg-text-muted" style={{ marginBottom: 14 }}>
        Cuéntanos cómo te sientes. Esto ayuda a mejorar el Open House.
      </p>

      {ok && <div className="tg-success">¡Gracias por tu feedback! ✨</div>}
      {error && <div className="tg-error">{error}</div>}

      {preguntas.length === 0 ? (
        <div className="tg-card">No hay preguntas de feedback disponibles aún.</div>
      ) : (
        <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {preguntas.map((p) => {
            const r = respuestas[p.id] || {}
            return (
              <div className="tg-card" key={p.id}>
                {p.categoria && (
                  <div style={{ fontSize: 12, color: 'var(--ucb-azul)' }}>
                    {p.categoria}
                  </div>
                )}
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{p.pregunta}</div>
                {p.tipo_pregunta === 'rating' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setRespuesta(p.id, 'valor_rating', n)}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          borderRadius: 12,
                          border: '1px solid #d1d5db',
                          background: Number(r.valor_rating) === n ? '#ffd700' : '#fff',
                          fontSize: 18,
                        }}
                      >
                        {n}⭐
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    rows={3}
                    className="tg-input tg-input--light"
                    placeholder="Escribe tu respuesta…"
                    value={r.respuesta_texto || ''}
                    onChange={(e) =>
                      setRespuesta(p.id, 'respuesta_texto', e.target.value)
                    }
                  />
                )}
              </div>
            )
          })}

          <button className="tg-btn" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar feedback'}
          </button>
        </form>
      )}
    </div>
  )
}
