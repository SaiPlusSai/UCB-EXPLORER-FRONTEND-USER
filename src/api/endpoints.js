import { api } from './client'

export const visitanteApi = {
  acceso: (data) => api.post('/visitantes/acceso', data),
  me: () => api.get('/visitantes/me'),
}

export const carrerasApi = {
  listar: () => api.get('/carreras?activas=1'),
}

export const colegiosApi = {
  listar: () => api.get('/colegios'),
}

export const triviaApi = {
  listar: (carrera_id) =>
    api.get('/trivia/visitante', { params: carrera_id ? { carrera_id } : {} }),
  responder: (pregunta_id, opcion_id) =>
    api.post('/trivia/visitante/responder', { pregunta_id, opcion_id }),
  historial: () => api.get('/trivia/visitante/historial'),
}

export const premiosApi = {
  listar: () => api.get('/premios/visitante'),
  canjear: (id) => api.post(`/premios/visitante/${id}/canjear`),
  historial: () => api.get('/premios/visitante/historial'),
}

export const feedbackApi = {
  listar: () => api.get('/feedback/visitante'),
  responder: (respuestas) =>
    api.post('/feedback/visitante/responder', { respuestas }),
}

export const qrApi = {
  escanear: (contenido_qr) =>
    api.post('/qr/visitante/escanear', { contenido_qr }),
  historial: () => api.get('/qr/visitante/historial'),
}

export const recordatoriosApi = {
  listar: () => api.get('/recordatorios/visitante'),
  crear: (data) => api.post('/recordatorios/visitante', data),
  actualizar: (id, data) => api.put(`/recordatorios/visitante/${id}`, data),
  eliminar: (id) => api.delete(`/recordatorios/visitante/${id}`),
}
