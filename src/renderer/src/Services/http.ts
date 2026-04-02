import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { refreshtoken } from './user'
import { getAccessToken, isTokenExpired, setAuthSession, forceLogout } from './auth'

axios.defaults.withCredentials = true

const instance = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

let refreshPromise: Promise<string> | null = null

const refreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const newToken = await refreshtoken()
      setAuthSession(newToken)
      return newToken
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()

    if (!token) {
      return config
    }

    if (isTokenExpired(token)) {
      try {
        const newToken = await refreshAccessToken()

        if (config.headers) {
          config.headers.Authorization = `Bearer ${newToken}`
        }

        return config
      } catch (error) {
        forceLogout()
        return Promise.reject(error)
      }
    }

    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const requestUrl = originalRequest.url ?? ''
    const isRefreshRequest = requestUrl.includes('/auth/refresh-token')

    if (isRefreshRequest) {
      forceLogout()
      return Promise.reject(error)
    }

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const newToken = await refreshAccessToken()

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        return instance(originalRequest)
      } catch (refreshError) {
        forceLogout()
        return Promise.reject(refreshError)
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
