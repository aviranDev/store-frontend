export interface User {
  _id: string
  username: string
  resetPassword: string
  role: string
}

export interface UserProfile {
  id: string
  username: string
}

export interface RegisterCustomerPayload {
  username: string
  email: string
  password: string
  customerNumber: string
}

export interface RegisterCustomerResponse {
  message: string
}
