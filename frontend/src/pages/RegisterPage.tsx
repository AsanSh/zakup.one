import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import apiClient from '../api/client'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    full_name: '',
    company_name: '',
    company_phone: '',
    company_inn: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setToken } = useUserStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Валидация паролей
    if (formData.password !== formData.password_confirm) {
      setError('Пароли не совпадают')
      return
    }

    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов')
      return
    }

    setLoading(true)

    try {
      const response = await apiClient.post('/api/auth/register/', {
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        full_name: formData.full_name,
        company_name: formData.company_name || undefined,
        company_phone: formData.company_phone || undefined,
        company_inn: formData.company_inn || undefined,
      })

      // После регистрации НЕ логиним пользователя, а показываем сообщение
      if (response.data.message) {
        setError('') // Очищаем ошибки
        setRegisteredEmail(formData.email) // Сохраняем email для отображения
        setSuccess(true)
        // Не перенаправляем сразу, показываем сообщение на странице
      }
    } catch (err: any) {
      // Маппинг английских названий полей на русские
      const fieldNames: Record<string, string> = {
        'phone': 'Телефон',
        'address': 'Адрес',
        'name': 'Название',
        'email': 'Email',
        'inn': 'ИНН',
        'contact_person': 'Контактное лицо',
        'full_name': 'Полное имя',
        'company_name': 'Название компании',
        'company_phone': 'Телефон',
        'company_inn': 'ИНН',
        'password': 'Пароль',
        'password_confirm': 'Подтверждение пароля',
      }
      
      let errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail ||
                          'Ошибка регистрации. Попробуйте еще раз.'
      
      // Обрабатываем ошибки валидации по полям
      if (err.response?.data && typeof err.response.data === 'object') {
        const fieldErrors: string[] = []
        Object.keys(err.response.data).forEach((key) => {
          if (key !== 'error' && key !== 'detail') {
            const fieldError = err.response.data[key]
            const fieldName = fieldNames[key] || key
            if (Array.isArray(fieldError)) {
              fieldErrors.push(`${fieldName}: ${fieldError.join(', ')}`)
            } else if (typeof fieldError === 'string') {
              fieldErrors.push(`${fieldName}: ${fieldError}`)
            }
          }
        })
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('\n')
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 py-8">
        <div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            ZAKUP.ONE
          </h2>
          <p className="mt-2 text-center text-sm sm:text-base text-gray-600">
            Регистрация
          </p>
        </div>
        {success ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Регистрация успешна!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ваша заявка на регистрацию отправлена администратору для рассмотрения.
              </p>
              <p className="text-sm text-gray-600 mb-2">
                После одобрения вашей заявки вы получите уведомление и сможете войти в систему.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                По всем вопросам обращайтесь по телефону: <span className="font-semibold">0555555555</span>
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Перейти к входу
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}
          
          <div className="space-y-4">
            {/* Личные данные */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Личные данные</h3>
              <div>
                <label htmlFor="full_name" className="sr-only">
                  Полное имя
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-base"
                  placeholder="Полное имя"
                  disabled={loading}
                />
              </div>
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
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-base"
                  placeholder="Email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Пароль */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Пароль</h3>
              <div>
                <label htmlFor="password" className="sr-only">
                  Пароль
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-base"
                  placeholder="Пароль (минимум 8 символов)"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="password_confirm" className="sr-only">
                  Подтверждение пароля
                </label>
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-base"
                  placeholder="Подтвердите пароль"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Данные компании (необязательно) */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">
                Данные компании <span className="text-gray-400 font-normal">(необязательно)</span>
              </h3>
              <div>
                <label htmlFor="company_name" className="sr-only">
                  Название компании
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-base"
                  placeholder="Название компании"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="company_inn" className="sr-only">
                  ИНН
                </label>
                <input
                  id="company_inn"
                  name="company_inn"
                  type="text"
                  value={formData.company_inn}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-base"
                  placeholder="ИНН"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="company_phone" className="sr-only">
                  Телефон компании
                </label>
                <input
                  id="company_phone"
                  name="company_phone"
                  type="tel"
                  value={formData.company_phone}
                  onChange={handleChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-base"
                  placeholder="Телефон компании"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Войти
              </Link>
            </p>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}

