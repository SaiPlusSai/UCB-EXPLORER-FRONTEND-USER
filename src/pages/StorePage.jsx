import { useEffect, useState } from 'react'
import { storeApi } from '../api/endpoints'

const EMOJI_MAP = {
  'Ropa': '👕',
  'Accesorios': '🎒',
  'Papelería': '📓',
  'Tecnología': '💻',
  'Bebidas': '☕',
}

function ProductModal({ producto, onClose, onReservar, reservando }) {
  if (!producto) return null

  return (
    <div className="tg-modal-overlay" onClick={onClose}>
      <div className="tg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tg-modal__img">
          <button className="tg-modal__close" onClick={onClose}>✕</button>
          {producto.imagen_url ? (
            <img src={producto.imagen_url} alt={producto.nombre} />
          ) : (
            EMOJI_MAP[producto.categoria] || '🛍️'
          )}
        </div>

        <div className="tg-modal__body">
          {producto.categoria && (
            <span className="tg-product-card__cat" style={{ marginBottom: 12, display: 'inline-block' }}>
              {producto.categoria}
            </span>
          )}

          <div className="tg-modal__name">{producto.nombre}</div>
          <div className="tg-modal__price">Bs. {Number(producto.precio).toFixed(2)}</div>

          {producto.descripcion && (
            <div className="tg-modal__desc">{producto.descripcion}</div>
          )}

          <div className="tg-modal__meta">
            <div className="tg-modal__meta-item">
              📦 Stock: {producto.stock}
            </div>
            <div className="tg-modal__meta-item">
              {producto.stock > 0 ? '✅ Disponible' : '❌ Agotado'}
            </div>
          </div>

          <button
            className="tg-btn"
            disabled={producto.stock <= 0 || reservando}
            onClick={() => onReservar(producto.id)}
          >
            {reservando ? (
              <>
                <div className="tg-loader" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Reservando…
              </>
            ) : producto.stock <= 0 ? (
              'Agotado'
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Reservar producto
              </>
            )}
          </button>

          <p className="tg-text-muted" style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}>
            La reserva debe recogerse en la UCB Store del campus.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function StorePage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtro, setFiltro] = useState('')
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [seleccionado, setSeleccionado] = useState(null)
  const [reservando, setReservando] = useState(false)
  const [verReservas, setVerReservas] = useState(false)

  const cargar = async () => {
    setCargando(true)
    try {
      const [p, c, r] = await Promise.all([
        storeApi.listarProductos(filtro || undefined),
        storeApi.listarCategorias(),
        storeApi.misReservas(),
      ])
      setProductos(p.data.data)
      setCategorias(c.data.data)
      setReservas(r.data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error cargando productos')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [filtro])

  const reservar = async (productoId) => {
    setReservando(true)
    setError('')
    setOk('')
    try {
      const { data } = await storeApi.reservar(productoId)
      setOk(`✅ ¡Reserva exitosa! "${data.data.producto.nombre}" reservado.`)
      setSeleccionado(null)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo reservar')
    } finally {
      setReservando(false)
    }
  }

  const cancelar = async (id) => {
    if (!window.confirm('¿Cancelar esta reserva?')) return
    try {
      await storeApi.cancelarReserva(id)
      setOk('Reserva cancelada')
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo cancelar')
    }
  }

  const productosFiltrados = filtro
    ? productos.filter((p) => p.categoria === filtro)
    : productos

  if (cargando) {
    return (
      <div className="tg-page">
        <div className="tg-loader" />
      </div>
    )
  }

  return (
    <div className="tg-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h2 style={{
          fontSize: 26,
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--ucb-dorado) 0%, #fff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          letterSpacing: '-0.5px',
        }}>UCB Store</h2>

        <button
          className="tg-btn tg-btn--ghost"
          style={{ width: 'auto', padding: '6px 14px', fontSize: 12, margin: 0, minHeight: 'auto', boxShadow: 'none' }}
          onClick={() => setVerReservas(!verReservas)}
        >
          {verReservas ? 'Ver productos' : `Mis reservas (${reservas.length})`}
        </button>
      </div>

      <p className="tg-text-muted" style={{ marginBottom: 16, fontSize: 15 }}>
        {verReservas
          ? 'Tus reservas de productos de la UCB Store.'
          : 'Productos exclusivos de la tienda UCB. ¡Reserva el tuyo!'}
      </p>

      {ok && <div className="tg-success">{ok}</div>}
      {error && <div className="tg-error">{error}</div>}

      {verReservas ? (
        /* ======= RESERVAS VIEW ======= */
        <>
          {reservas.length === 0 ? (
            <div className="tg-card" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
              Aún no tienes reservas. ¡Explora el catálogo!
            </div>
          ) : (
            <ul className="tg-list">
              {reservas.map((r) => (
                <li className="tg-list-item" key={r.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.nombre}</div>
                      <div style={{ fontSize: 13, color: 'var(--ucb-dorado)', fontWeight: 700 }}>
                        Bs. {Number(r.precio).toFixed(2)} × {r.cantidad}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                        {new Date(r.creado_en).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span className={`tg-status tg-status--${r.estado}`}>
                        {r.estado}
                      </span>
                      {r.estado === 'pendiente' && (
                        <button
                          className="tg-btn tg-btn--ghost"
                          style={{ width: 'auto', padding: '4px 10px', fontSize: 11, margin: 0, minHeight: 'auto', boxShadow: 'none' }}
                          onClick={() => cancelar(r.id)}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        /* ======= PRODUCTS VIEW ======= */
        <>
          {/* Category pills */}
          {categorias.length > 0 && (
            <div className="tg-cat-pills">
              <button
                className={`tg-cat-pill ${!filtro ? 'active' : ''}`}
                onClick={() => setFiltro('')}
              >
                Todos
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  className={`tg-cat-pill ${filtro === cat ? 'active' : ''}`}
                  onClick={() => setFiltro(cat)}
                >
                  {EMOJI_MAP[cat] || '📦'} {cat}
                </button>
              ))}
            </div>
          )}

          {/* Products grid */}
          <div className="tg-store-grid">
            {productosFiltrados.map((p) => (
              <div
                key={p.id}
                className="tg-product-card"
                onClick={() => setSeleccionado(p)}
              >
                <div className="tg-product-card__img">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.nombre} />
                  ) : (
                    EMOJI_MAP[p.categoria] || '🛍️'
                  )}
                </div>
                <div className="tg-product-card__body">
                  <div className="tg-product-card__name">{p.nombre}</div>
                  <div className="tg-product-card__price">Bs. {Number(p.precio).toFixed(2)}</div>
                  {p.categoria && (
                    <span className="tg-product-card__cat">{p.categoria}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="tg-card" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              No hay productos en esta categoría.
            </div>
          )}
        </>
      )}

      {/* Product detail modal */}
      {seleccionado && (
        <ProductModal
          producto={seleccionado}
          onClose={() => setSeleccionado(null)}
          onReservar={reservar}
          reservando={reservando}
        />
      )}
    </div>
  )
}
