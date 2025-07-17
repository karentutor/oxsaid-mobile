// src/utils/auth.ts
import { axiosBase } from '@/services/BaseService'

type AuthResponse = {
  token: string
  user: any
  isSuccess: boolean
  msg?: string
}

async function authenticate(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await axiosBase.post<AuthResponse>('auth/login', {
    email,
    password,
  })
  return res.data
}

export async function login(email: string, password: string) {
  try {
    const { token, user, isSuccess, msg } = await authenticate(email, password)
    if (!isSuccess) {
      // backend responded 200 but isSuccess=false
      throw new Error(msg || 'Login failed.')
    }
    return { token, user }
  } catch (error: any) {
    // axios errors come with response.data
    const serverMsg =
      error.response?.data?.msg ||
      error.response?.data?.message ||
      error.message ||
      'Login failed.'
    throw new Error(serverMsg)
  }
 }


export async function forgotPasswordRequest(email: string) {
  const res = await axiosBase.post<{ isSuccess: boolean; msg?: string }>(
    'auth/request-password-reset',
    { email }
  )
  if (!res.data.isSuccess) throw new Error(res.data.msg)
  return true
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await axiosBase.post<{ isSuccess: boolean; msg?: string }>(
    'auth/reset-password',
    {
      token,
      newPassword,
    }
  )
  if (!res.data.isSuccess) throw new Error(res.data.msg)
  return true
}
