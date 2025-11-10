/**
 * API клиент для аутентификации
 */
import axios from 'axios'
import type { User } from '../types'

const API_URL = '/api/v1'

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface RegisterData {
  email: string
  full_name: string
  phone: string
  company: string
  password: string
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await axios.post<User>(`${API_URL}/auth/register`, data)
    return response.data
  },

  getMe: async (): Promise<User> => {
    // Для getMe используем apiClient, так как нужен токен
    const apiClient = (await import('./axiosConfig')).default
    const response = await apiClient.get<User>(`/auth/me`)
    return response.data
  },
}

