import { jwtDecode } from 'jwt-decode'
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../utils/localStorage'
import { DecodedToken, SigninResponse, SigninPayload } from '../types/auth.type'
import httpService from './http'
import { AxiosResponse } from 'axios' // Import AxiosResponse if you're using axios

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
  console.log('test')

  if (!isRedirecting) {
    isRedirecting = true
    window.location.hash = '#/login'
  }
}

export const resetRedirectFlag = (): void => {
  isRedirecting = false
}

export const getCurrentUser = (): DecodedToken | null => {
  try {
    const jwt = getAccessToken()
    if (!jwt) {
      return null
    }

    const decodedToken: DecodedToken = jwtDecode<DecodedToken>(jwt) // Use jwtDecode with the correct typing
    setLocalStorage('user', decodedToken)
    return decodedToken
  } catch {
    return null
  }
}

export const logoutService = async (): Promise<void> => {
  try {
    await httpService.delete(`/auth/logout`)
  } catch (error) {
    throw error
  }
}

export const signin = async (credentails: SigninPayload): Promise<SigninResponse> => {
  const response: AxiosResponse<SigninResponse> = await httpService.post('/auth/login', credentails)

  return response.data
}

export const refreshtoken = async (): Promise<string> => {
  const response = await httpService.get<{ accessToken: string }>(
    'http://localhost:8080/api/auth/refresh-token',
    { withCredentials: true }
  )

  if (typeof response.data?.accessToken !== 'string') {
    throw new Error('Invalid access token format')
  }

  return response.data.accessToken
}
