import { create } from 'zustand'
import axios from 'axios'

const API_URL = '/api/v1'

interface User {
  id: number
  email: string
  full_name: string
  company: string
  is_verified: boolean
  is_admin?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  init: () => void
}

interface RegisterData {
  email: string
  full_name: string
  phone: string
  company: string
  password: string
}

export const useAuthStore = create<AuthState>()((set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const formData = new URLSearchParams()
        formData.append('username', email)
        formData.append('password', password)

        const response = await axios.post(`${API_URL}/auth/login`, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })

        const { access_token, user } = response.data
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

        // Сохраняем в localStorage
        const authData = {
          token: access_token,
          isAuthenticated: true,
          user: user || {
            id: 0,
            email,
            full_name: '',
            company: '',
            is_verified: true,
            is_admin: false,
          },
        }
        localStorage.setItem('auth-storage', JSON.stringify({ state: authData }))

        set(authData)
      },

      register: async (data: RegisterData) => {
        const response = await axios.post(`${API_URL}/auth/register`, data)
        // После регистрации НЕ входим автоматически - пользователь должен быть верифицирован
        return response.data
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization']
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        localStorage.removeItem('auth-storage')
      },
      init: () => {
        const stored = localStorage.getItem('auth-storage')
        if (stored) {
          try {
            const data = JSON.parse(stored)
            const token = data.state?.token
            if (token) {
              // Устанавливаем токен в axios
              axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
              console.log('Токен восстановлен из localStorage')
              set({
                token: token,
                user: data.state.user || null,
                isAuthenticated: data.state.isAuthenticated || false,
              })
            } else {
              console.warn('Токен не найден в localStorage')
            }
          } catch (e) {
            console.error('Error loading auth state:', e)
            // Очищаем поврежденные данные
            localStorage.removeItem('auth-storage')
          }
        } else {
          console.log('Нет сохраненных данных аутентификации')
        }
      },
    })
)

