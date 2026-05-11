import { useEffect, useState } from 'react'

import {
  Scanner,
} from '@yudiel/react-qr-scanner'

import { qrApi } from '../api/endpoints'

import { useAuth } from '../context/AuthContext.jsx'

export default function QrPage() {

  const { refresh } =
    useAuth()

  const [historial, setHistorial] =
    useState([])

  const [cargando, setCargando] =
    useState(true)

  const [procesando, setProcesando] =
    useState(false)

  const [ok, setOk] =
    useState('')

  const [error, setError] =
    useState('')

  const [infoQR, setInfoQR] =
    useState(null)

  const cargar = () =>

    qrApi
      .historial()

      .then(({ data }) =>
        setHistorial(
          data.data
        )
      )

      .catch(() => {})

      .finally(() =>
        setCargando(false)
      )

  useEffect(() => {

    cargar()

  }, [])

  const procesarQR = async (
    valor
  ) => {

    if (
      !valor ||
      procesando
    ) return

    setProcesando(true)

    setError('')
    setOk('')
    setInfoQR(null)

    try {

      const { data } =
        await qrApi.escanear(
          valor
        )

      if (
        data.data.tipo ===
        'puntos'
      ) {

        setOk(
          `🎉 +${data.data.puntos_otorgados} puntos`
        )

      } else if (
        data.data.tipo ===
        'informacion'
      ) {

        setInfoQR({
          titulo:
            data.data.titulo,
          descripcion:
            data.data.descripcion,
        })

        setOk(
          'ℹ️ Información cargada'
        )
      }

      await refresh()

      cargar()

      setTimeout(() => {

        setProcesando(false)

      }, 2500)

    } catch (e) {

      setError(
        e.response?.data?.error ||
        'QR inválido'
      )

      setTimeout(() => {

        setProcesando(false)

      }, 2000)
    }
  }

  return (
    <div className="tg-page">

      <h2
        style={{
          color: '#fff',
          margin:
            '4px 0 6px',
        }}
      >
        Escaneo QR
      </h2>

      <p
        className="tg-text-muted"
        style={{
          marginBottom: 14,
        }}
      >
        Escanea los QR del
        Open House para
        obtener puntos e
        información.
      </p>

      <div
        className="tg-card"
        style={{
          overflow: 'hidden',
          padding: 10,
          marginBottom: 16,
        }}
      >

        <Scanner
          onScan={(result) => {

            if (
              result?.[0]?.rawValue
            ) {

              procesarQR(
                result[0].rawValue
              )
            }
          }}

          onError={(err) =>
            console.log(err)
          }

          constraints={{
            facingMode:
              'environment',
          }}

          styles={{
            container: {
              width: '100%',
              borderRadius: 18,
              overflow:
                'hidden',
            },
          }}
        />

      </div>

      {ok && (
        <div className="tg-success">
          {ok}
        </div>
      )}

      {error && (
        <div className="tg-error">
          {error}
        </div>
      )}

      {infoQR && (

        <div
          className="tg-card"
          style={{
            marginTop: 14,
            background:
              '#ffffff',
          }}
        >

          <div
            style={{
              fontSize: 13,
              color:
                'var(--ucb-azul)',
              marginBottom: 6,
            }}
          >
            Información QR
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 8,
            }}
          >
            {infoQR.titulo}
          </div>

          <div
            style={{
              color: '#374151',
              lineHeight: 1.5,
            }}
          >
            {infoQR.descripcion}
          </div>

        </div>
      )}

      <h3
        style={{
          color: '#fff',
          marginTop: 20,
        }}
      >
        Historial
      </h3>

      {cargando ? (

        <div className="tg-loader" />

      ) : historial.length === 0 ? (

        <div
          className="tg-card"
          style={{
            background:
              'rgba(255,255,255,0.08)',
            color: '#fff',
          }}
        >
          Aún no escaneaste
          ningún QR.
        </div>

      ) : (

        <ul className="tg-list">

          {historial.map((h) => {

            let contenido = {}

            try {

              contenido =
                JSON.parse(
                  h.contenido_qr
                )

            } catch {}

            return (

              <li
                className="tg-list-item"
                key={h.id}
              >

                <div>

                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >

                    {contenido.tipo ===
                    'puntos'
                      ? '🎁 QR de puntos'
                      : 'ℹ️ QR información'}

                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color:
                        'rgba(255,255,255,.7)',
                    }}
                  >

                    {contenido.tipo ===
                    'puntos'
                      ? `+${h.puntos_otorgados} puntos`
                      : contenido.titulo}

                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      marginTop: 4,
                      color:
                        'rgba(255,255,255,.45)',
                    }}
                  >
                    {new Date(
                      h.escaneado_en
                    ).toLocaleString()}
                  </div>

                </div>

                <span
                  className={`tg-chip ${
                    contenido.tipo ===
                    'puntos'
                      ? 'tg-chip--success'
                      : ''
                  }`}
                >

                  {contenido.tipo ===
                  'puntos'
                    ? `+${h.puntos_otorgados}`
                    : 'INFO'}

                </span>

              </li>
            )
          })}

        </ul>
      )}

    </div>
  )
}