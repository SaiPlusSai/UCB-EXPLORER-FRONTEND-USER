import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { visitanteApi } from '../api/endpoints'

const AuthContext = createContext(null)

const TOKEN_KEY = 'ucb_visitor_token'
const VISITOR_KEY = 'ucb_visitor'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [visitante, setVisitante] = useState(() => {
    const raw = localStorage.getItem(VISITOR_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [cargandoSesion, setCargandoSesion] = useState(true)

  const persist = useCallback((tok, vis) => {
    if (tok) localStorage.setItem(TOKEN_KEY, tok)
    else localStorage.removeItem(TOKEN_KEY)
    if (vis) localStorage.setItem(VISITOR_KEY, JSON.stringify(vis))
    else localStorage.removeItem(VISITOR_KEY)
    setToken(tok || null)
    setVisitante(vis || null)
  }, [])

  const refresh = useCallback(async () => {
    if (!token) {
      setCargandoSesion(false)
      return
    }
    try {
      const { data } = await visitanteApi.me()
      const v = data.data
      persist(token, v)
    } catch {
      persist(null, null)
    } finally {
      setCargandoSesion(false)
    }
  }, [token, persist])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = (tok, vis) => persist(tok, vis)
  const logout = () => persist(null, null)

  const value = useMemo(
    () => ({ token, visitante, login, logout, refresh, cargandoSesion }),
    [token, visitante, refresh, cargandoSesion]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fuera de AuthProvider')
  return ctx
}
