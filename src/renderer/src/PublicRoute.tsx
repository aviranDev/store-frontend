import { Navigate } from 'react-router-dom'
import { useLogin } from './Store/LoginProvider'
import { getDefaultRouteByRole } from './utils/routeHelpers'

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useLogin()

  if (isLoggedIn) {
    return <Navigate to={getDefaultRouteByRole(user?.role)} replace />
  }

  return <>{children}</>
}
