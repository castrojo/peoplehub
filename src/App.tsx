import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUsername } from './hooks/useUsername'
import { useTheme } from './hooks/useTheme'
import { FeedPage } from './pages/FeedPage'
import { SetupPage } from './pages/SetupPage'

function AppRoutes() {
  const { username, setUsername, clearUsername } = useUsername()
  // Ensure theme is applied on mount
  useTheme()

  return (
    <Routes>
      <Route
        path="/"
        element={
          username
            ? <FeedPage username={username} onChangeUsername={clearUsername} />
            : <Navigate to="/setup" replace />
        }
      />
      <Route path="/setup" element={<SetupPage onSave={setUsername} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter basename="/peoplehub">
      <AppRoutes />
    </BrowserRouter>
  )
}
