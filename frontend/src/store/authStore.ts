import { create } from 'zustand'
import apiClient from '../shared/api/axiosConfig'
import { authApi, type RegisterData, type LoginResponse } from '../shared/api'
import type { User } from '../shared/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  init: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,

      login: async (email: string, password: string) => {
        try {
          console.log('🔍 authStore.login: Starting login for', email)
          
          const response: LoginResponse = await authApi.login(email, password)
          const { access_token, user } = response
          
          if (!access_token) {
            throw new Error('Токен не получен от сервера')
          }
          
          if (!user) {
            throw new Error('Данные пользователя не получены от сервера')
          }
          
          console.log('✅ authStore.login: Login successful', { 
            hasToken: !!access_token, 
            user: { id: user.id, email: user.email, is_admin: user.is_admin } 
          })
          
          // Устанавливаем токен в axios
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

          // Сохраняем в localStorage
          const authData = {
            token: access_token,
            isAuthenticated: true,
            user: user,
          }
          
          localStorage.setItem('auth-storage', JSON.stringify({ state: authData }))
          console.log('💾 authStore.login: Auth data saved to localStorage')

          // Обновляем состояние
          set(authData)
          console.log('✅ authStore.login: State updated')
        } catch (error: any) {
          console.error('❌ authStore.login: Error occurred', error)
          // Пробрасываем ошибку дальше, чтобы Login.tsx мог её обработать
          throw error
        }
      },

      register: async (data: RegisterData) => {
        await authApi.register(data)
        // После регистрации НЕ входим автоматически - пользователь должен быть верифицирован
      },

      logout: () => {
        delete apiClient.defaults.headers.common['Authorization']
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        localStorage.removeItem('auth-storage')
      },
      init: () => {
        // Предотвращаем повторную инициализацию
        const state = useAuthStore.getState()
        if (state.isInitialized) {
          return
        }

        const stored = localStorage.getItem('auth-storage')
        if (stored) {
          try {
            const data = JSON.parse(stored)
            const token = data.state?.token
            if (token) {
              // Устанавливаем токен в apiClient
              apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
              console.log('Токен восстановлен из localStorage')
              set({
                token: token,
                user: data.state.user || null,
                isAuthenticated: data.state.isAuthenticated || false,
                isInitialized: true,
              })
            } else {
              console.warn('Токен не найден в localStorage')
              set({ isInitialized: true })
            }
          } catch (e) {
            console.error('Error loading auth state:', e)
            // Очищаем поврежденные данные
            localStorage.removeItem('auth-storage')
            set({ isInitialized: true })
          }
        } else {
          // Нет сохраненных данных - это нормально для первого входа
          set({ isInitialized: true })
        }
      },
    })
)

