import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import apiClient from '../api/client'

type FeatureCardProps = {
  title: string
  text: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, text }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-3 shadow-sm shadow-slate-100/50">
      <h3 className="text-xs font-semibold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-[11px] leading-snug text-slate-500">{text}</p>
    </div>
  )
}

const AuthLanding: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyInn, setCompanyInn] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setToken } = useUserStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.post('/api/auth/login/', {
        email,
        password,
      })

      if (response.data.token && response.data.user) {
        setToken(response.data.token)
        setUser(response.data.user)

        if (response.data.user.role === 'ADMIN') {
          navigate('/admin', { replace: true })
        } else {
          navigate('/customer', { replace: true })
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.detail || 
                      'Ошибка входа. Проверьте email и пароль.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('Пароли не совпадают')
      return
    }

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов')
      return
    }

    setLoading(true)

    try {
      // Формируем объект запроса, исключая пустые поля
      const requestData: any = {
        email,
        password,
        password_confirm: passwordConfirm,
        full_name: fullName || '',
      }
      
      // Добавляем поля компании только если они заполнены
      if (companyName && companyName.trim()) {
        requestData.company_name = companyName.trim()
      }
      if (companyPhone && companyPhone.trim()) {
        requestData.company_phone = companyPhone.trim()
      }
      if (companyInn && companyInn.trim()) {
        requestData.company_inn = companyInn.trim()
      }
      
      const response = await apiClient.post('/api/auth/register/', requestData)

      if (response.data.message) {
        setError('')
        setSuccess(true)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail ||
                          (err.response?.data?.email ? err.response.data.email[0] : null) ||
                          (err.response?.data?.password ? err.response.data.password[0] : null) ||
                          'Ошибка регистрации. Попробуйте еще раз.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* Logo + name */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              Z
            </div>
            <span className="font-semibold tracking-wide text-slate-900">
              ZAKUP.ONE
            </span>
          </div>

          {/* Simple nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <button className="hover:text-slate-900 transition-colors">
              О сервисе
            </button>
            <button className="hover:text-slate-900 transition-colors">
              Контакты
            </button>
            <button className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100">
              RU
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex">
        <div className="mx-auto max-w-6xl w-full px-4 py-8 md:py-12 flex flex-col md:flex-row items-center gap-10">
          {/* Left side (value prop) */}
          <section className="w-full md:w-7/12">
            <p className="text-xs font-semibold tracking-[0.25em] text-indigo-500 uppercase mb-3">
              Платформа для снабженцев
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
              Единый доступ к оптовым<br className="hidden sm:block" />
              строительным материалам.
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-xl mb-6">
              ZAKUP.ONE объединяет прайс-листы десятков поставщиков, помогает
              быстро находить нужные позиции и формировать консолидированные
              заявки с доставкой на объект.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <FeatureCard
                title="Каталог поставщиков"
                text="Доступ к оптовым ценам без прямого раскрытия контактных данных поставщиков."
              />
              <FeatureCard
                title="Умный поиск"
                text="Поиск по названию, артикулу и категориям с подсказками в реальном времени."
              />
              <FeatureCard
                title="Консолидированные заявки"
                text="Формирование одной заявки по товарам из разных прайсов с доставкой на объект."
              />
            </div>

            <p className="text-xs text-slate-500 max-w-md">
              Для работы на платформе необходима регистрация компании и
              подтверждение доступа администратором сервиса.
            </p>
          </section>

          {/* Right side (auth card) */}
          <section className="w-full md:w-5/12">
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 p-6 md:p-7 border border-slate-100">
              {success ? (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    Заявка отправлена
                  </h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Ваша заявка на регистрацию успешно отправлена администратору для рассмотрения.
                  </p>
                  <p className="text-xs text-slate-500">
                    После одобрения заявки вы получите уведомление и сможете войти в систему.
                  </p>
                  <button
                    onClick={() => {
                      setSuccess(false)
                      setIsLogin(true)
                      setEmail('')
                      setPassword('')
                      setPasswordConfirm('')
                      setFullName('')
                      setCompanyName('')
                      setCompanyPhone('')
                      setCompanyInn('')
                    }}
                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Вернуться к входу
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">
                    {isLogin ? 'Вход в систему' : 'Регистрация компании'}
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    {isLogin 
                      ? 'Введите email и пароль, выданные при подключении к платформе.'
                      : 'Заполните форму для регистрации вашей компании на платформе.'
                    }
                  </p>

                  {error && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                      <div className="text-sm text-red-800">{error}</div>
                    </div>
                  )}

                  {isLogin ? (
                    <form className="space-y-4" onSubmit={handleLogin}>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-xs font-medium text-slate-600 mb-1"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                          placeholder="you@company.com"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label
                            htmlFor="password"
                            className="block text-xs font-medium text-slate-600"
                          >
                            Пароль
                          </label>
                          <button
                            type="button"
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Забыли пароль?
                          </button>
                        </div>
                        <input
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                          placeholder="••••••••"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 mt-1 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Вход...' : 'Войти'}
                      </button>
                    </form>
                  ) : (
                    <form className="space-y-4" onSubmit={handleRegister}>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          ФИО
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={loading}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                          placeholder="Иванов Иван Иванович"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                          placeholder="you@company.com"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Пароль
                        </label>
                        <input
                          type="password"
                          autoComplete="new-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                          placeholder="Минимум 8 символов"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Подтверждение пароля
                        </label>
                        <input
                          type="password"
                          autoComplete="new-password"
                          required
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          disabled={loading}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                          placeholder="Повторите пароль"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Название компании
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          disabled={loading}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                          placeholder="ООО «Название компании»"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Телефон компании
                        </label>
                        <input
                          type="tel"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          disabled={loading}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                          placeholder="+7 (XXX) XXX-XX-XX"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          ИНН компании
                        </label>
                        <input
                          type="text"
                          value={companyInn}
                          onChange={(e) => setCompanyInn(e.target.value)}
                          disabled={loading}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                          placeholder="1234567890"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 mt-1 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Отправка...' : 'Зарегистрировать компанию'}
                      </button>
                    </form>
                  )}

                  {!success && (
                    <>
                      <div className="my-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          или
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin)
                          setError('')
                          setPassword('')
                          setPasswordConfirm('')
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-800 py-2.5 transition-colors"
                      >
                        {isLogin ? 'Зарегистрировать компанию' : 'Войти в систему'}
                      </button>

                      <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
                        {isLogin 
                          ? 'Регистрация предназначена для юридических лиц и отделов снабжения. После отправки заявки наш менеджер свяжется с вами и подтвердит подключение.'
                          : 'Уже есть аккаунт? Войдите в систему используя email и пароль.'
                        }
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} ZAKUP.ONE. Все права защищены.</span>
          <div className="flex items-center gap-4">
            <button className="hover:text-slate-700">
              Политика конфиденциальности
            </button>
            <button className="hover:text-slate-700">
              Пользовательское соглашение
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AuthLanding

