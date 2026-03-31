import { useState, useEffect, createContext, Fragment, ReactNode, useContext } from 'react'
import { jwtDecode } from 'jwt-decode'
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../utils/localStorage'
import {
  signin,
  Auth,
  SigninResponse,
  DecodedToken,
  profile,
  logoutService
} from '../Services/user'

export interface LoginContextProps {
  login: (data: Auth) => Promise<SigninResponse>
  logout: () => Promise<void>
  isLoggedIn: boolean
  user: DecodedToken | null
  getProfile: () => Promise<any>
  clearAuthState: () => void
}

interface LoginProviderProps {
  children: ReactNode
}

export const AuthContext = createContext<LoginContextProps | undefined>(undefined)

const AuthProvider: React.FC<LoginProviderProps> = ({ children }) => {
  const [user, setUser] = useState<DecodedToken | null>(() => getLocalStorage('user', null))
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const token = getLocalStorage<string | null>('accessToken', null)
    return !!token
  })

  const clearAuthState = (): void => {
    removeLocalStorage('accessToken')
    removeLocalStorage('user')
    setUser(null)
    setIsLoggedIn(false)
  }

  const login = async (data: Auth): Promise<SigninResponse> => {
    const response = await signin(data)
    const accessToken = response.data.accessToken

    setLocalStorage('accessToken', accessToken)

    const decodedUser = jwtDecode<DecodedToken>(accessToken)
    setLocalStorage('user', decodedUser)

    setUser(decodedUser)
    setIsLoggedIn(true)

    return response
  }

  const getProfile = async (): Promise<any> => {
    const response = await profile()
    return response.data
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

  useEffect(() => {
    if (!isLoggedIn) return

    const interval = setInterval(async () => {
      try {
        await profile()
      } catch (error) {
        clearAuthState()
        window.location.href = '/login'
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isLoggedIn])

  return (
    <AuthContext.Provider value={{ login, isLoggedIn, logout, user, getProfile, clearAuthState }}>
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
