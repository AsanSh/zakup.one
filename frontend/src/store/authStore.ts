import { create } from 'zustand'
import axios from 'axios'
import { authApi, type RegisterData, type LoginResponse } from '../shared/api'
import type { User } from '../shared/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  init: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response: LoginResponse = await authApi.login(email, password)
        const { access_token, user } = response
        
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
        await authApi.register(data)
        // После регистрации НЕ входим автоматически - пользователь должен быть верифицирован
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

