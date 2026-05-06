import { useEffect, useState } from 'react'
import { recordatoriosApi } from '../api/endpoints'

export default function RecordatoriosPage() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ titulo: '', descripcion: '', fecha_recordatorio: '' })
  const [enviando, setEnviando] = useState(false)

  const cargar = async () => {
    try {
      const { data } = await recordatoriosApi.listar()
      setItems(data.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) return
    setEnviando(true)
    try {
      await recordatoriosApi.crear({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        fecha_recordatorio: form.fecha_recordatorio || null,
      })
      setForm({ titulo: '', descripcion: '', fecha_recordatorio: '' })
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo guardar')
    } finally {
      setEnviando(false)
    }
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar recordatorio?')) return
    try {
      await recordatoriosApi.eliminar(id)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo eliminar')
    }
  }

  if (cargando) return <div className="tg-page"><div className="tg-loader" /></div>

  return (
    <div className="tg-page">
      <h2 style={{ color: '#fff', margin: '4px 0 12px' }}>Mi agenda</h2>

      {error && <div className="tg-error">{error}</div>}

      <form onSubmit={submit} className="tg-card" style={{ marginBottom: 16 }}>
        <input
          className="tg-input tg-input--light"
          placeholder="Título"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
        />
        <textarea
          className="tg-input tg-input--light"
          placeholder="Descripción (opcional)"
          rows={2}
          style={{ marginTop: 8 }}
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
        <input
          type="datetime-local"
          className="tg-input tg-input--light"
          style={{ marginTop: 8 }}
          value={form.fecha_recordatorio}
          onChange={(e) => setForm({ ...form, fecha_recordatorio: e.target.value })}
        />
        <button className="tg-btn" style={{ marginTop: 10 }} disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar recordatorio'}
        </button>
      </form>

      {items.length === 0 ? (
        <div className="tg-card--ghost tg-card" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}>
          Aún no tienes recordatorios.
        </div>
      ) : (
        <ul className="tg-list">
          {items.map((r) => (
            <li className="tg-list-item" key={r.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {r.titulo}
                    {r.creado_por_admin && (
                      <span className="tg-chip" style={{ marginLeft: 6 }}>oficial</span>
                    )}
                  </div>
                  {r.descripcion && (
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                      {r.descripcion}
                    </div>
                  )}
                  {r.fecha_recordatorio && (
                    <div style={{ fontSize: 12, color: 'var(--ucb-dorado)' }}>
                      📅 {new Date(r.fecha_recordatorio).toLocaleString()}
                    </div>
                  )}
                  {r.carrera_nombre && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                      {r.carrera_nombre}
                    </div>
                  )}
                </div>
                {!r.creado_por_admin && (
                  <button
                    onClick={() => eliminar(r.id)}
                    className="tg-btn tg-btn--ghost"
                    style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
