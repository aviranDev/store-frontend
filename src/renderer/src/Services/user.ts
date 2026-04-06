import httpService from './http'
import { AxiosResponse } from 'axios' // Import AxiosResponse if you're using axios
import { RegisterCustomerPayload, RegisterCustomerResponse, UserProfile } from '../types/user.type'

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
  const response = await httpService.post<RegisterCustomerResponse>('/users/customers', credentials)

  return response.data
}
