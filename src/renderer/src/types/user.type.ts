export interface User {
  _id: string
  username: string
  resetPassword: string
  role: string
}

export interface UserProfileInterface {
  _id: string
  username: string
  email: string
  role: 'customer' | 'employee' | 'admin'
  customerNumber?: string | null
  companyName?: string | null
  isVerified: boolean
  verifiedAt: Date | null
  createdAt: Date
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
