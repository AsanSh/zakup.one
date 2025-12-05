import { create } from 'zustand'
import apiClient from '../api/client'

interface User {
  id: number
  email: string
  full_name: string
  role: 'ADMIN' | 'CLIENT'
  company?: {
    id: number
    name: string
    approved: boolean
  } | null
}

interface UserStore {
  user: User | null
  token: string | null
  initialized: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  initFromStorage: () => void
}

const STORAGE_KEY = 'zakup_user_data'

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  token: null,
  initialized: false,
  setUser: (user) => {
    set({ user })
    // Сохраняем в localStorage
    const token = get().token
    if (token && user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
    }
  },
  setToken: (token) => {
    set({ token })
    if (token) {
      localStorage.setItem('token', token)
      // Сохраняем полные данные если есть user
      const user = get().user
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
      }
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem(STORAGE_KEY)
    }
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null, token: null })
  },
  initFromStorage: () => {
    try {
      // Пытаемся восстановить полные данные
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const { user, token } = JSON.parse(stored)
        if (token && user) {
          set({ user, token, initialized: true })
          // Проверяем валидность токена асинхронно
          apiClient.get('/auth/me/')
            .then((response) => {
              if (response.data) {
                set({ user: response.data })
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: response.data, token }))
              }
            })
            .catch(() => {
              // Токен невалиден, очищаем
              localStorage.removeItem('token')
              localStorage.removeItem(STORAGE_KEY)
              set({ user: null, token: null })
            })
          return
        }
      }
      
      // Fallback: только токен - пытаемся получить пользователя
      const token = localStorage.getItem('token')
      if (token) {
        set({ token, initialized: true })
        apiClient.get('/api/auth/me/')
          .then((response) => {
            if (response.data) {
              set({ user: response.data })
              localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: response.data, token }))
            }
          })
          .catch(() => {
            // Токен невалиден
            localStorage.removeItem('token')
            set({ token: null })
          })
      } else {
        set({ initialized: true })
      }
    } catch (error) {
      console.error('Ошибка восстановления сессии:', error)
      set({ initialized: true })
    }
  },
}))

// Восстанавливаем данные при загрузке модуля
if (typeof window !== 'undefined') {
  useUserStore.getState().initFromStorage()
}


