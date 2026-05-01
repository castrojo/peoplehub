import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { FeedPage } from './pages/FeedPage'
import { SetupPage } from './pages/SetupPage'
import { ProjectsPage } from './pages/ProjectsPage'

function AppRoutes() {
  const navigate = useNavigate()
  // Ensure theme is applied on mount
  useTheme()

  return (
    <Routes>
      <Route
        path="/"
        element={<FeedPage onGoToSetup={() => navigate('/setup')} />}
      />
      <Route
        path="/setup"
        element={
          <SetupPage
            onSave={() => {
              // SetupPage handles setToken + navigate internally; this is a no-op shim
            }}
          />
        }
      />
      <Route path="/projects" element={<ProjectsPage />} />
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
