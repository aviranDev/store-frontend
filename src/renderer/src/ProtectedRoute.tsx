// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useLogin } from './Store/LoginProvider'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useLogin()
  const location = useLocation()

  // If not authenticated, send to /login and remember where we came from
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <>{children}</>
}
