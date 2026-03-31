// src/components/PublicRoute.tsx
import { Navigate } from 'react-router-dom'
import { useLogin } from './Store/LoginProvider'

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useLogin()
  return isLoggedIn ? <Navigate to="/" replace /> : <>{children}</>
}
