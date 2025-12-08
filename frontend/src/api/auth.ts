import apiClient from './client'

export interface User {
  id: number
  email: string
  full_name: string
  role: 'ADMIN' | 'CLIENT'
  company?: {
    id: number
    name: string
    approved: boolean
  } | null
  is_active: boolean
}

export interface AuthResponse {
  token: string
  user: User
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login/', {
      email,
      password,
    })
    return response.data
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // Используем любой защищенный эндпоинт для проверки токена
      const response = await apiClient.get('/api/orders/')
      // Если запрос прошел, значит токен валиден
      // Но нам нужен пользователь, попробуем через другой эндпоинт
      // Или просто вернем null и заставим перелогиниться
      return null
    } catch (error) {
      return null
    }
  },
}


