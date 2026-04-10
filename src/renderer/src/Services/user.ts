import httpService from './http'
import { AxiosResponse } from 'axios' // Import AxiosResponse if you're using axios
import {
  RegisterCustomerPayload,
  RegisterCustomerResponse,
  UserProfileInterface
} from '../types/user.type'

type UpdatePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export const userProfile = async (): Promise<AxiosResponse<UserProfileInterface>> => {
  try {
    return await httpService.get<UserProfileInterface>(`users/user-profile`)
  } catch (error) {
    throw error
  }
}

export const updatePasswordService = async (payload: UpdatePasswordPayload) => {
  return httpService.post('/auth/update-password', payload)
}

export const registerCustomer = async (
  credentials: RegisterCustomerPayload
): Promise<RegisterCustomerResponse> => {
  const response = await httpService.post<RegisterCustomerResponse>('/users/customers', credentials)

  return response.data
}
