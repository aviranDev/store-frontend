import httpService from './http'
import { jwtDecode } from 'jwt-decode'
import { setLocalStorage, getLocalStorage } from '../utils/localStorage'
import axios, { AxiosResponse } from 'axios' // Import AxiosResponse if you're using axios

axios.defaults.withCredentials = true // Include credentials for all requests

export interface Auth {
  email: string
  password: string
}

export interface SigninResponse {
  data: {
    accessToken: string
    user: {
      _id: string
      username: string
      resetPassword: string
      role: string
      // Add other properties you expect for the user object
    }
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

export const signin = async (credentails: Auth): Promise<SigninResponse> => {
  try {
    const response = await httpService.post(`/auth/login`, credentails)
    console.log(response)
    return response
  } catch (error) {
    throw error
  }
}

export const refreshtoken = async (): Promise<string> => {
  try {
    const response = await httpService.get<{ accessToken: string }>(`/auth/refresh-token`)

    // Ensure the access token is a string before returning
    if (response.data && typeof response.data.accessToken === 'string') {
      return response.data.accessToken
    } else {
      throw new Error('Invalid access token format')
    }
  } catch (error) {
    throw error
  }
}

export const logoutService = async (): Promise<void> => {
  try {
    await httpService.delete(`/auth/logout`)
  } catch (error) {
    throw error
  }
}

export interface DecodedToken {
  role: string
  username: string
  exp: number
  data: object
  // Add any other properties your token might have
}

export const getCurrentUser = (): DecodedToken | null => {
  try {
    const jwt = getLocalStorage('token', null)
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
