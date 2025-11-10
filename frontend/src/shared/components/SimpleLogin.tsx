/**
 * Упрощенная версия логина для тестирования
 * Временно использует localStorage напрямую
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const SimpleLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@zakup.one')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    console.log('🔍 Trying to login with:', { email, password })
    console.log('🔍 Current localStorage:', localStorage.getItem('auth-storage'))

    try {
      // Пробуем обычный логин через API
      await login(email, password)
      
      // Проверяем результат
      const { user } = useAuthStore.getState()
      console.log('✅ Login successful, user:', user)
      
      if (user?.is_admin) {
        console.log('🔄 Redirecting to /admin')
        navigate('/admin', { replace: true })
      } else {
        console.log('🔄 Redirecting to /search')
        navigate('/search', { replace: true })
      }
    } catch (err: any) {
      console.error('❌ Login error:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Ошибка входа'
      setError(errorMessage)
      
      // Если API не работает, пробуем временную заглушку
      if (errorMessage.includes('Network') || errorMessage.includes('ECONNREFUSED')) {
        console.warn('⚠️ API недоступен, используем временную заглушку')
        handleTestLogin()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = () => {
    console.log('🧪 Using test login (bypassing API)')
    
    // Временная заглушка - создаем тестового пользователя
    const testUser = {
      id: 1,
      email: email,
      full_name: 'Администратор',
      company: 'ZAKUP.ONE',
      is_verified: true,
      is_admin: email === 'admin@zakup.one',
    }
    
    const authData = {
      token: 'test-token-' + Date.now(),
      isAuthenticated: true,
      user: testUser,
    }
    
    // Сохраняем в localStorage в формате Zustand
    localStorage.setItem('auth-storage', JSON.stringify({ state: authData }))
    
    // Обновляем store
    useAuthStore.setState(authData)
    
    console.log('✅ Test login successful, redirecting...')
    
    if (testUser.is_admin) {
      navigate('/admin', { replace: true })
    } else {
      navigate('/search', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Вход в систему (Тестовая версия)
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Упрощенная версия для отладки
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              onClick={handleTestLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              🧪 Тест: Войти как админ (без API)
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                console.log('📋 LocalStorage:', localStorage)
                console.log('📋 Auth Store:', useAuthStore.getState())
                alert('Проверьте консоль браузера (F12)')
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              🔍 Проверить данные в консоли
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                localStorage.clear()
                useAuthStore.setState({
                  user: null,
                  token: null,
                  isAuthenticated: false,
                })
                alert('LocalStorage очищен! Перезагрузите страницу.')
                window.location.reload()
              }}
              className="text-sm text-red-600 hover:text-red-900"
            >
              🗑️ Очистить LocalStorage
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SimpleLogin

