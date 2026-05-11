import { useEffect, useMemo, useState } from 'react'
import { feedbackApi } from '../api/endpoints'

export default function FeedbackPage() {

  const [preguntas, setPreguntas] =
    useState([])

  const [respuestas, setRespuestas] =
    useState({})

  const [originales, setOriginales] =
    useState({})

  const [cargando, setCargando] =
    useState(true)

  const [enviando, setEnviando] =
    useState(false)

  const [ok, setOk] =
    useState(false)

  const [error, setError] =
    useState('')

  useEffect(() => {

    const cargar = async () => {

      try {

        const [pregRes, misRes] =
          await Promise.all([
            feedbackApi.listar(),
            feedbackApi.misRespuestas(),
          ])

        const preguntasData =
          pregRes.data.data || []

        const respuestasData =
          misRes.data.data || []

        setPreguntas(preguntasData)

        const map = {}

        respuestasData.forEach((r) => {

          map[r.pregunta_id] = {

            id: r.id,

            valor_rating:
              r.valor_rating,

            respuesta_texto:
              r.respuesta_texto || '',
          }
        })

        setRespuestas(map)

        setOriginales(
          JSON.parse(
            JSON.stringify(map)
          )
        )

      } catch (e) {

        setError(
          e.response?.data?.error ||
          'Error cargando feedback'
        )

      } finally {

        setCargando(false)
      }
    }

    cargar()

  }, [])

  const setRespuesta = (
    id,
    campo,
    valor
  ) => {

    setRespuestas((r) => ({
      ...r,
      [id]: {
        ...(r[id] || {}),
        [campo]: valor,
      },
    }))

    setOk(false)
  }

  const respondidas =
    Object.values(respuestas).filter(
      (r) =>
        r.valor_rating ||
        r.respuesta_texto?.trim()
    ).length

  const porcentaje =
    preguntas.length
      ? Math.round(
          (respondidas /
            preguntas.length) *
            100
        )
      : 0

  const cambios =
    JSON.stringify(respuestas) !==
    JSON.stringify(originales)

  const preguntasAgrupadas =
    useMemo(() => {

      const grupos = {}

      preguntas.forEach((p) => {

        const key =
          p.categoria || 'General'

        if (!grupos[key]) {
          grupos[key] = []
        }

        grupos[key].push(p)
      })

      return grupos

    }, [preguntas])

  const enviar = async (e) => {

    e.preventDefault()

    setEnviando(true)

    setError('')

    try {

      const payload =
        preguntas
          .map((p) => {

            const r =
              respuestas[p.id] || {}

            if (
              p.tipo_pregunta ===
                'rating' &&
              r.valor_rating
            ) {

              return {
                pregunta_id: p.id,
                valor_rating:
                  Number(
                    r.valor_rating
                  ),
              }
            }

            if (
              p.tipo_pregunta !==
                'rating' &&
              r.respuesta_texto?.trim()
            ) {

              return {
                pregunta_id: p.id,
                respuesta_texto:
                  r.respuesta_texto.trim(),
              }
            }

            return null
          })
          .filter(Boolean)

      if (payload.length === 0) {

        setError(
          'Responde al menos una pregunta'
        )

        setEnviando(false)

        return
      }

      await feedbackApi.responder(
        payload
      )

      setOriginales(
        JSON.parse(
          JSON.stringify(respuestas)
        )
      )

      setOk(true)

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

  return (
    <div className="tg-page">

      <h2
        style={{
          color: '#fff',
          margin: '4px 0 6px',
        }}
      >
        Tu feedback
      </h2>

      <p
        className="tg-text-muted"
        style={{
          marginBottom: 14,
        }}
      >
        Cuéntanos cómo te sientes.
        Esto ayuda a mejorar el
        Open House.
      </p>

      <div
        style={{
          marginBottom: 16,
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            marginBottom: 6,
            color: '#fff',
            fontSize: 13,
          }}
        >

          <span>
            Progreso
          </span>

          <span>
            {respondidas}/
            {preguntas.length}
          </span>

        </div>

        <div
          style={{
            width: '100%',
            height: 10,
            borderRadius: 999,
            background:
              'rgba(255,255,255,.15)',
            overflow: 'hidden',
          }}
        >

          <div
            style={{
              width: `${porcentaje}%`,
              height: '100%',
              background:
                '#ffd700',
              transition:
                'width .3s ease',
            }}
          />

        </div>

      </div>

      {ok && (

        <div className="tg-success">
          ✓ Feedback guardado correctamente
        </div>

      )}

      {error && (
        <div className="tg-error">
          {error}
        </div>
      )}

      {preguntas.length === 0 ? (

        <div className="tg-card">
          No hay preguntas de feedback disponibles aún.
        </div>

      ) : (

        <form
          onSubmit={enviar}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >

          {Object.entries(
            preguntasAgrupadas
          ).map(
            ([categoria, lista]) => (

              <div key={categoria}>

                <div
                  style={{
                    color: '#fff',
                    fontWeight: 700,
                    marginBottom: 10,
                    paddingLeft: 4,
                  }}
                >
                  {categoria}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >

                  {lista.map((p) => {

                    const r =
                      respuestas[p.id] || {}

                    const respondida =
                      r.valor_rating ||
                      r.respuesta_texto?.trim()

                    return (

                      <div
                        className="tg-card"
                        key={p.id}
                      >

                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: 12,
                            color:
                              '#002d54',
                          }}
                        >
                          {p.pregunta}
                        </div>

                        {p.tipo_pregunta ===
                        'rating' ? (

                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                            }}
                          >

                            {[1, 2, 3, 4, 5].map(
                              (n) => {

                                const active =
                                  Number(
                                    r.valor_rating
                                  ) === n

                                return (

                                  <button
                                    type="button"
                                    key={n}
                                    onClick={() =>
                                      setRespuesta(
                                        p.id,
                                        'valor_rating',
                                        n
                                      )
                                    }
                                    style={{
                                      flex: 1,
                                      padding:
                                        '12px 0',
                                      borderRadius: 14,
                                      border:
                                        active
                                          ? '2px solid #ffd700'
                                          : '1px solid #d1d5db',
                                      background:
                                        active
                                          ? '#fff7cc'
                                          : '#fff',
                                      fontSize: 20,
                                      fontWeight: 700,
                                      transition:
                                        '.2s',
                                      transform:
                                        active
                                          ? 'scale(1.03)'
                                          : 'scale(1)',
                                    }}
                                  >
                                    {active
                                      ? '⭐'
                                      : '☆'}{' '}
                                    {n}
                                  </button>
                                )
                              }
                            )}

                          </div>

                        ) : (

                          <textarea
                            rows={3}
                            className="tg-input tg-input--light"
                            placeholder="Escribe tu respuesta..."
                            value={
                              r.respuesta_texto ||
                              ''
                            }
                            onChange={(e) =>
                              setRespuesta(
                                p.id,
                                'respuesta_texto',
                                e.target.value
                              )
                            }
                          />

                        )}

                        {respondida && (

                          <div
                            style={{
                              marginTop: 10,
                              fontSize: 12,
                              color:
                                '#16a34a',
                              fontWeight: 600,
                            }}
                          >
                            ✓ Respondida
                          </div>

                        )}

                      </div>
                    )
                  })}

                </div>

              </div>
            )
          )}

          <button
            className="tg-btn"
            disabled={
              enviando ||
              !cambios
            }
          >

            {enviando
              ? 'Guardando...'
              : cambios
                ? 'Guardar cambios'
                : 'Feedback guardado ✓'}

          </button>

        </form>
      )}

    </div>
  )
}