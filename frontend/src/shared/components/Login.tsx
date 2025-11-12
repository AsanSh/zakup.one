/**
 * Компонент страницы логина
 * Исправлен: добавлена правильная обработка ошибок и редирект
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('🔍 Login attempt:', { email })
      
      // Вызываем login из store
      await login(email, password)
      
      // Получаем пользователя из store после успешного логина
      const { user } = useAuthStore.getState()
      console.log('✅ Login successful, user:', user)
      
      if (!user) {
        throw new Error('Пользователь не найден в ответе сервера')
      }
      
      // Редирект в зависимости от роли
      if (user.is_admin) {
        console.log('🔄 Redirecting to /admin')
        navigate('/admin', { replace: true })
      } else {
        console.log('🔄 Redirecting to /search')
        navigate('/search', { replace: true })
      }
    } catch (err: any) {
      console.error('❌ Login error:', err)
      
      // Извлекаем понятное сообщение об ошибке
      let errorMessage = 'Ошибка входа. Проверьте данные и попробуйте снова.'
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err.message) {
        errorMessage = err.message
      }
      
      // Показываем понятное сообщение об ошибке
      if (errorMessage.includes('не верифицирован') || errorMessage.includes('верифицирован')) {
        setError('Ваш аккаунт еще не верифицирован администратором. Пожалуйста, дождитесь подтверждения.')
      } else if (errorMessage.includes('деактивирован')) {
        setError('Ваш аккаунт деактивирован. Обратитесь к администратору.')
      } else if (errorMessage.includes('Неверный email') || errorMessage.includes('пароль')) {
        setError('Неверный email или пароль. Проверьте данные и попробуйте снова.')
      } else if (errorMessage.includes('Network') || errorMessage.includes('ECONNREFUSED')) {
        setError('Не удалось подключиться к серверу. Проверьте, что backend запущен на порту 8000.')
      } else {
        setError(errorMessage)
      }
    } finally {
      // ВСЕГДА снимаем loading, даже при ошибке
      setLoading(false)
      console.log('🔚 Login attempt finished, loading:', false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Вход в систему
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Или{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              зарегистрируйтесь
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
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
                disabled={loading}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={loading}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              className="group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
