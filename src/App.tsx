import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUsername } from './hooks/useUsername'
import { useTeamMembers } from './hooks/useTeamMembers'
import { useTheme } from './hooks/useTheme'
import { FeedPage } from './pages/FeedPage'
import { SetupPage } from './pages/SetupPage'

function AppRoutes() {
  const { username, setUsername, clearUsername } = useUsername()
  const { members, setMembers, clearMembers } = useTeamMembers()
  // Ensure theme is applied on mount
  useTheme()

  const isTeamMode = members.length > 0

  return (
    <Routes>
      <Route
        path="/"
        element={
          isTeamMode
            ? (
              <FeedPage
                teamMembers={members}
                onChangeSetup={clearMembers}
              />
            )
            : username
              ? <FeedPage username={username} onChangeSetup={clearUsername} />
              : <Navigate to="/setup" replace />
        }
      />
      <Route
        path="/setup"
        element={
          <SetupPage
            onSaveUsername={(name) => { clearMembers(); setUsername(name) }}
            onSaveTeam={(memberList) => { clearUsername(); setMembers(memberList) }}
            initialTab={isTeamMode ? 'team' : 'personal'}
          />
        }
      />
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
