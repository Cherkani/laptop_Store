export interface AuthUser {
  id: string
  email: string | undefined
  fullName: string | null
  avatarUrl: string | null
  isAdmin: boolean
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  fullName: string
}
