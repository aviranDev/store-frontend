import { jwtDecode } from 'jwt-decode'
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../utils/localStorage'

export interface DecodedToken {
  exp: number
  data: object
  role?: string
  username?: string
}

let isRedirecting = false

export const getAccessToken = (): string | null => {
  return getLocalStorage<string | null>('accessToken', null)
}

export const getStoredUser = (): DecodedToken | null => {
  return getLocalStorage<DecodedToken | null>('user', null)
}

export const setAuthSession = (accessToken: string): DecodedToken => {
  const decodedUser = jwtDecode<DecodedToken>(accessToken)

  setLocalStorage('accessToken', accessToken)
  setLocalStorage('user', decodedUser)

  return decodedUser
}

export const clearAuthSession = (): void => {
  removeLocalStorage('accessToken')
  removeLocalStorage('user')
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    return decoded.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export const hasValidAccessToken = (): boolean => {
  const token = getAccessToken()
  return !!token && !isTokenExpired(token)
}

export const forceLogout = (): void => {
  clearAuthSession()

  if (!isRedirecting) {
    console.log('test')

    isRedirecting = true
    window.location.href = '/login'
  }
}

export const resetRedirectFlag = (): void => {
  isRedirecting = false
}
