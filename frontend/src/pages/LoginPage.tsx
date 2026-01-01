import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import apiClient from '../api/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setToken } = useUserStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.post('/api/auth/login/', {
        email,
        password,
      })

      if (response.data.token && response.data.user) {
        // Сохраняем токен и пользователя через store (он сам сохранит в localStorage)
        setToken(response.data.token)
        setUser(response.data.user)

        // Перенаправляем в зависимости от роли
        if (response.data.user.role === 'ADMIN') {
          navigate('/kojoyun', { replace: true })
        } else {
          navigate('/customer', { replace: true })
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.detail || 
                      'Ошибка входа. Проверьте email и пароль.'
      setError(errorMsg)
      
      // Если ошибка связана с неподтвержденным email или неодобренной компанией, 
      // не показываем alert, так как сообщение уже в setError
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
        {/* Левая панель - Приветствие */}
        <div className="lg:w-2/5 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-700 relative overflow-hidden p-8 lg:p-12 flex flex-col justify-between">
          {/* Декоративные волны */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
              <path
                d="M0,300 Q200,150 400,300 T800,300 T1200,300 L1200,800 L0,800 Z"
                fill="#60A5FA"
                opacity="0.4"
              />
              <path
                d="M0,500 Q300,350 600,500 T1200,500 L1200,800 L0,800 Z"
                fill="#93C5FD"
                opacity="0.3"
              />
            </svg>
          </div>

          {/* Логотип */}
          <div className="relative z-10 flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full"></div>
            </div>
            <span className="text-white text-lg font-semibold">ZAKUP.ONE</span>
          </div>

          {/* Приветственное сообщение */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Привет, добро пожаловать!
            </h1>
            <p className="text-white/90 text-base lg:text-lg mb-8 leading-relaxed">
              ZAKUP.ONE — это современная платформа для управления закупками в строительных компаниях. 
              Упростите процесс заказа товаров и работы с поставщиками.
            </p>
            <button
              onClick={() => {
                window.location.href = '/about'
              }}
              className="self-start px-6 py-3 bg-blue-800/50 border border-blue-300/50 text-white rounded-lg hover:bg-blue-800/70 transition-all font-medium"
            >
              Подробнее
            </button>
          </div>
        </div>

        {/* Правая панель - Форма входа */}
        <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-r from-gray-50 via-white to-purple-50/30">
          <div className="max-w-md mx-auto w-full">
            {/* Форма входа */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              {/* Email поле */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес электронной почты
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="имя@почта.kg"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Пароль поле */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Запомнить меня и Забыли пароль */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Запомнить меня</span>
                </label>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Забыли пароль?
                </a>
              </div>

              {/* Кнопка входа */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-white border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>
            </form>

            {/* Регистрация */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Ещё не зарегистрированы?</p>
              <Link
                to="/register"
                className="block w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md text-center"
              >
                Зарегистрироваться
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


