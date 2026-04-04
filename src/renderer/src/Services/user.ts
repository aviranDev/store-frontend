import httpService from './http'
import { jwtDecode } from 'jwt-decode'
import { setLocalStorage, getLocalStorage } from '../utils/localStorage'
import axios, { AxiosResponse } from 'axios' // Import AxiosResponse if you're using axios
import { DecodedToken } from './auth' // Import DecodedToken from auth service
axios.defaults.withCredentials = true // Include credentials for all requests

export interface RegisterCustomerPayload {
  username: string
  email: string
  password: string
  customerNumber: string
}

export interface RegisterCustomerResponse {
  message: string
}

export interface Auth {
  email: string
  password: string
}

export interface SigninResponse {
  message: string
  accessToken: string
  user: {
    _id: string
    username: string
    resetPassword: string
    role: string
    // Add other properties you expect for the user object
  }
}

interface UserProfile {
  id: string
  username: string
}

export const profile = async (): Promise<AxiosResponse<UserProfile>> => {
  try {
    return await httpService.get<UserProfile>(`users/user-profile`)
  } catch (error) {
    throw error
  }
}

export const registerCustomer = async (
  credentials: RegisterCustomerPayload
): Promise<RegisterCustomerResponse> => {
  console.log(credentials)

  const response = await httpService.post<RegisterCustomerResponse>('/users/customers', credentials)

  return response.data
}

export const signin = async (credentails: Auth): Promise<SigninResponse> => {
  const response: AxiosResponse<SigninResponse> = await httpService.post('/auth/login', credentails)

  return response.data
}

export const refreshtoken = async (): Promise<string> => {
  const response = await axios.get<{ accessToken: string }>(
    'http://localhost:8080/api/auth/refresh-token',
    { withCredentials: true }
  )

  if (typeof response.data?.accessToken !== 'string') {
    throw new Error('Invalid access token format')
  }

  return response.data.accessToken
}

export const logoutService = async (): Promise<void> => {
  try {
    await httpService.delete(`/auth/logout`)
  } catch (error) {
    throw error
  }
}

export const getCurrentUser = (): DecodedToken | null => {
  try {
    const jwt = getLocalStorage('accessToken', null)
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
