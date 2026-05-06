import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { useAuth } from './context/AuthContext.jsx'
import AppLayout from './components/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import HomePage from './pages/HomePage.jsx'
import TriviaPage from './pages/TriviaPage.jsx'
import PremiosPage from './pages/PremiosPage.jsx'
import FeedbackPage from './pages/FeedbackPage.jsx'
import RecordatoriosPage from './pages/RecordatoriosPage.jsx'
import QrPage from './pages/QrPage.jsx'

function ProtectedRoute({ children }) {
  const { token, cargandoSesion } = useAuth()
  if (cargandoSesion) {
    return (
      <div className="app-shell">
        <div style={{ margin: 'auto' }}>
          <div className="tg-loader" />
        </div>
      </div>
    )
  }
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="trivia" element={<TriviaPage />} />
        <Route path="premios" element={<PremiosPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="recordatorios" element={<RecordatoriosPage />} />
        <Route path="qr" element={<QrPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
