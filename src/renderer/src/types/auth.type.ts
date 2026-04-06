export interface DecodedToken {
  exp: number
  data: {
    _id?: string
    username?: string
    role?: string
    resetPassword?: string
  }
  role?: string
  username?: string
}

export interface SigninPayload {
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
  }
}

export interface RefreshTokenResponse {
  accessToken: string
}
