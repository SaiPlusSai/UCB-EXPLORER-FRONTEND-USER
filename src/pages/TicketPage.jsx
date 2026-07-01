import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { visitanteApi } from '../api/endpoints'

export default function TicketPage() {
  const { visitante } = useAuth()
  const [ci, setCi] = useState('')
  const [fechaNac, setFechaNac] = useState('')
  const [resultado, setResultado] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState('')
  const [buscado, setBuscado] = useState(false)

  const buscar = async (e) => {
    e.preventDefault()
    setError('')
    setResultado(null)

    if (!ci.trim()) { setError('Ingresa tu carnet de identidad'); return }
    if (!fechaNac) { setError('Ingresa tu fecha de nacimiento'); return }

    setBuscando(true)
    setBuscado(true)

    try {
      const { data } = await visitanteApi.buscarTicket({
        ci: ci.trim(),
        fecha_nacimiento: fechaNac,
      })
      setResultado(data.data)
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'No se encontró un ticket con esos datos'
      )
    } finally {
      setBuscando(false)
    }
  }

  const ticketId = resultado?.ticket_id || visitante?.ticket_id
  const ticketIdStr = ticketId ? String(ticketId).padStart(4, '0') : '----'

  return (
    <div className="tg-page">
      <h2 style={{
        fontSize: 26,
        fontWeight: 800,
        background: 'linear-gradient(135deg, var(--ucb-dorado) 0%, #fff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: '0 0 6px',
        letterSpacing: '-0.5px',
      }}>Mi Ticket</h2>
      <p className="tg-text-muted" style={{ marginBottom: 20, fontSize: 15 }}>
        Vincula tu ticket ingresando tu carnet y fecha de nacimiento.
      </p>

      {/* Search form */}
      <form onSubmit={buscar} className="tg-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div className="tg-label"><span>Carnet de Identidad (CI)</span></div>
            <input
              className="tg-input"
              placeholder="Ej: 12345678"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              type="text"
              inputMode="numeric"
            />
          </div>
          <div>
            <div className="tg-label"><span>Fecha de Nacimiento</span></div>
            <input
              className="tg-input"
              type="date"
              value={fechaNac}
              onChange={(e) => setFechaNac(e.target.value)}
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="tg-btn"
          style={{ marginTop: 18 }}
          disabled={buscando}
        >
          {buscando ? (
            <>
              <div className="tg-loader" style={{ width: 20, height: 20, borderWidth: 2 }} />
              Buscando…
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Buscar mi ticket
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="tg-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Ticket Display */}
      {resultado && (
        <div className="tg-ticket">
          <div className="tg-ticket__header">
            <div>
              <div className="tg-ticket__label">Estudiante</div>
              <div className="tg-ticket__name">{resultado.nombre}</div>
            </div>
            <div className="tg-ticket__id">
              <div className="tg-ticket__label">ID</div>
              <div className="tg-ticket__id-num">{ticketIdStr}</div>
            </div>
          </div>

          <div className="tg-ticket__body">
            <div className="tg-ticket__qr">
              {/* QR placeholder — could use a QR library here */}
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#002d54" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span style={{ fontSize: 10, color: '#002d54', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Código de Acceso
                </span>
              </div>
            </div>

            <div className="tg-ticket__info-block">
              <div>
                <div className="tg-ticket__label">Código Ticket</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ucb-blanco)', wordBreak: 'break-all' }}>
                  {resultado.codigo_ticket || 'N/A'}
                </div>
              </div>
              {resultado.colegio && (
                <div>
                  <div className="tg-ticket__label">Colegio</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                    {resultado.colegio}
                  </div>
                </div>
              )}
              <div>
                <div className="tg-ticket__label">CI</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                  {resultado.ci}
                </div>
              </div>
            </div>
          </div>

          <div className="tg-ticket__footer">
            ‹ ESTE TICKET ES DE USO ÚNICO Y PERSONAL. NO LO COMPARTAS ›
          </div>
        </div>
      )}

      {/* Current ticket info if no search done yet */}
      {!buscado && visitante && (
        <div className="tg-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Tu ticket actual</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--ucb-dorado)', lineHeight: 1, textShadow: '0 4px 15px rgba(255, 215, 0, 0.3)' }}>
            #{String(visitante.ticket_id).padStart(4, '0')}
          </div>
          <p className="tg-text-muted" style={{ marginTop: 12, fontSize: 13 }}>
            Ingresa tus datos arriba para vincular y ver tu ticket completo.
          </p>
        </div>
      )}
    </div>
  )
}
