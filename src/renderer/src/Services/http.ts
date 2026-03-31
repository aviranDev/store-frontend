import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../utils/localStorage'
import { jwtDecode } from 'jwt-decode'
import { refreshtoken } from './user'

axios.defaults.withCredentials = true

export interface DecodedToken {
  exp: number
  data: object
}

const instance = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor to add auth token
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getLocalStorage<string | null>('accessToken', null)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error)
  }
)

const refreshAccessToken = async (): Promise<string> => {
  try {
    // Make a request to the refresh token endpoint
    const response = await refreshtoken()
    const decodedUser = jwtDecode<DecodedToken>(response)

    setLocalStorage('user', decodedUser)
    setLocalStorage('accessToken', response)

    return response
  } catch (error) {
    removeLocalStorage('accessToken')
    removeLocalStorage('user')
    window.location.href = '/login'
    throw error
  }
}

let isRedirecting = false

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    const requestUrl = originalRequest?.url ?? ''

    const isRefreshRequest = requestUrl.includes('/auth/refresh-token')

    if (isRefreshRequest) {
      removeLocalStorage('accessToken')
      removeLocalStorage('user')

      if (!isRedirecting) {
        isRedirecting = true
        window.location.href = '/login'
      }

      return Promise.reject(error)
    }

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      console.log('Cookie is located')
      try {
        const newToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        console.log('re-login')
        console.log('Cookie is located')
        return axios(originalRequest)
      } catch (err) {
        console.log('Cookie is located')
        removeLocalStorage('accessToken')
        removeLocalStorage('user')
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

// Export the HTTP methods
const httpService = {
  get: instance.get,
  post: instance.post,
  patch: instance.patch,
  put: instance.put,
  delete: instance.delete
}

export default httpService
