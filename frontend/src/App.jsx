import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MockInterview from './pages/MockInterview'
import CodingPractice from './pages/CodingPractice'
import Behavioral from './pages/Behavioral'
import Aptitude from './pages/Aptitude'

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/mock-interview" element={<Protected><MockInterview /></Protected>} />
          <Route path="/coding-practice" element={<Protected><CodingPractice /></Protected>} />
          <Route path="/behavioral" element={<Protected><Behavioral /></Protected>} />
          <Route path="/aptitude" element={<Protected><Aptitude /></Protected>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
