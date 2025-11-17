/**
 * API клиент для аутентификации
 */
import axios from 'axios'
import type { User } from '../types'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

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
    try {
      console.log('Sending login request to:', `${API_URL}/auth/login`)
      
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true, // Для поддержки cookies если нужно
      })
      
      console.log('Login response:', { 
        status: response.status,
        hasToken: !!response.data?.access_token,
        hasUser: !!response.data?.user,
        data: response.data
      })
      
      // Проверяем что ответ правильный
      if (!response.data) {
        throw new Error('Пустой ответ от сервера')
      }
      
      if (!response.data.access_token) {
        console.error('Response data:', response.data)
        throw new Error('Токен не получен от сервера. Ответ: ' + JSON.stringify(response.data))
      }
      
      if (!response.data.user) {
        console.error('Response data:', response.data)
        throw new Error('Данные пользователя не получены от сервера. Ответ: ' + JSON.stringify(response.data))
      }
      
      return response.data
    } catch (error: any) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      })
      
      // Улучшенная обработка ошибок
      if (error.response) {
        // Сервер вернул ответ с ошибкой
        const errorDetail = error.response.data?.detail || error.response.data?.message || 'Ошибка сервера'
        const errorMessage = typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail)
        throw new Error(errorMessage)
      } else if (error.request) {
        // Запрос отправлен, но ответа нет
        throw new Error('Сервер не отвечает. Проверьте подключение к интернету.')
      } else {
        // Ошибка при настройке запроса
        throw new Error(error.message || 'Ошибка при отправке запроса')
      }
    }
  },

  register: async (data: RegisterData): Promise<User> => {
    try {
      console.log('Sending register request to:', `${API_URL}/auth/register`)
      
      const response = await axios.post<User>(`${API_URL}/auth/register`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Register response:', { status: response.status, user: response.data })
      
      return response.data
    } catch (error: any) {
      console.error('Register error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      throw error
    }
  },

  getMe: async (): Promise<User> => {
    // Для getMe используем apiClient, так как нужен токен
    const apiClient = (await import('./axiosConfig')).default
    const response = await apiClient.get<User>(`/auth/me`)
    return response.data
  },
}

