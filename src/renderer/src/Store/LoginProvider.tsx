import { useState, createContext, Fragment, ReactNode, useContext, useEffect } from 'react'
import { registerCustomer } from '../Services/user'
import {
  getStoredUser,
  hasValidAccessToken,
  setAuthSession,
  clearAuthSession,
  resetRedirectFlag,
  logoutService,
  signin
} from '../Services/auth'
import { DecodedToken, SigninResponse, SigninPayload } from '../types/auth.type'
import { RegisterCustomerPayload, RegisterCustomerResponse } from '../types/user.type'

export interface LoginContextProps {
  register: (data: RegisterCustomerPayload) => Promise<RegisterCustomerResponse>
  login: (data: SigninPayload) => Promise<SigninResponse>
  logout: () => Promise<void>
  isLoggedIn: boolean
  user: DecodedToken | null
  clearAuthState: () => void
}

interface LoginProviderProps {
  children: ReactNode
}

export const AuthContext = createContext<LoginContextProps | undefined>(undefined)

const AuthProvider: React.FC<LoginProviderProps> = ({ children }) => {
  const [user, setUser] = useState<DecodedToken | null>(() => getStoredUser())
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => hasValidAccessToken())

  const clearAuthState = (): void => {
    clearAuthSession()
    setUser(null)
    setIsLoggedIn(false)
    resetRedirectFlag()
  }

  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null)
      setIsLoggedIn(false)
      resetRedirectFlag()
    }

    window.addEventListener('auth:logout', handleForcedLogout)

    return () => {
      window.removeEventListener('auth:logout', handleForcedLogout)
    }
  }, [])

  const login = async (data: SigninPayload): Promise<SigninResponse> => {
    const response = await signin(data)
    const accessToken = response.accessToken

    const decodedUser = setAuthSession(accessToken)

    setUser(decodedUser)
    setIsLoggedIn(true)
    resetRedirectFlag()

    return response
  }

  const register = async (data: RegisterCustomerPayload): Promise<RegisterCustomerResponse> => {
    const response = await registerCustomer(data)
    return response
  }

  const logout = async (): Promise<void> => {
    try {
      await logoutService()
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      clearAuthState()
    }
  }

  return (
    <AuthContext.Provider value={{ register, login, isLoggedIn, logout, user, clearAuthState }}>
      <Fragment>{children}</Fragment>
    </AuthContext.Provider>
  )
}

export const useLogin = (): LoginContextProps => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useLogin must be used within a LoginProvider')
  }
  return context
}

export default AuthProvider
