import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { User, Settings as SettingsIcon, Save, Lock, Trash2, DollarSign, Info, HelpCircle, FileText, CreditCard, TrendingUp, Paperclip, X, Upload } from 'lucide-react'
import axios from 'axios'

const API_URL = '/api/v1'

export default function Profile() {
  const { user: authUser, logout } = useAuthStore()
  const [user, setUser] = useState(authUser)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    full_name: authUser?.full_name || '',
    email: authUser?.email || '',
    company: authUser?.company || '',
    phone: '',
  })

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  // Финансовые данные (в реальном приложении будут загружаться с сервера)
  const [financialData, setFinancialData] = useState({
    deposit_name: 'Недвижимость, г. Бишкек, ул. Чуй, д. 123', // Наименование залога
    deposit_valuation: 100000, // Оценочная стоимость залога (вводит админ)
    credit_limit: 50000, // Лимит на рассрочку (50% от оценочной стоимости)
    credit_term: 30, // Срок рассрочки в днях
    deposit_files: [] as Array<{ id: number; name: string; url: string; type: string }>, // Файлы залога
    total_products: 1250, // Количество товаров за все время
    total_cash: 150000, // Сумма за наличные
    total_credit: 75000, // Сумма в рассрочку
    credit_balance: 25000, // Остаток по рассрочке
    contract_amount: 200000, // Сумма контракта
    total_payments: 175000, // Сумма выплат
    last_transaction: {
      date: '10.03.2024',
      amount: 5000,
      type: 'Оплата рассрочки',
    },
    status: 'Активен',
    transactions: [
      { id: 1, date: '10.03.2024', amount: 5000, type: 'Оплата рассрочки', status: 'Завершено' },
      { id: 2, date: '05.03.2024', amount: 10000, type: 'Оплата рассрочки', status: 'Завершено' },
      { id: 3, date: '28.02.2024', amount: 15000, type: 'Покупка товаров', status: 'Завершено' },
      { id: 4, date: '20.02.2024', amount: 20000, type: 'Покупка товаров', status: 'Завершено' },
    ],
  })
  const [uploadingFiles, setUploadingFiles] = useState(false)

  useEffect(() => {
    // Загружаем данные пользователя
    const loadUserData = async () => {
      try {
        setLoading(true)
        // Здесь можно добавить API запрос для получения полных данных пользователя
        // const response = await axios.get(`${API_URL}/auth/me`)
        // setUser(response.data)
        // setFormData({ ...formData, ...response.data })
      } catch (err) {
        console.error('Ошибка загрузки данных пользователя:', err)
      } finally {
        setLoading(false)
      }
    }

    if (authUser) {
      loadUserData()
    }
  }, [authUser])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
    setSuccess('')
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      // Здесь можно добавить API запрос для обновления данных пользователя
      // await axios.put(`${API_URL}/auth/profile`, formData)
      setSuccess('Данные профиля успешно обновлены')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка обновления данных. Попробуйте снова.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Новый пароль и подтверждение не совпадают')
      return
    }

    if (passwordData.new_password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }

    setSaving(true)
    try {
      // Здесь можно добавить API запрос для изменения пароля
      // await axios.post(`${API_URL}/auth/change-password`, {
      //   old_password: passwordData.old_password,
      //   new_password: passwordData.new_password,
      // })
      setSuccess('Пароль успешно изменен')
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка изменения пароля. Проверьте старый пароль.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.')) {
      return
    }

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      // Здесь можно добавить API запрос для удаления аккаунта
      // await axios.delete(`${API_URL}/auth/profile`)
      setSuccess('Аккаунт успешно удален. Вы будете перенаправлены на страницу входа.')
      setTimeout(() => {
        logout()
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка удаления аккаунта. Попробуйте снова.')
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' сом'
  }

  // Обработка загрузки файлов залога
  const handleDepositFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadingFiles(true)
    try {
      // Здесь будет загрузка файлов через API
      // Пока просто добавляем в локальное состояние
      const newFiles = Array.from(files).map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      }))

      setFinancialData({
        ...financialData,
        deposit_files: [...financialData.deposit_files, ...newFiles],
      })

      alert(`Загружено файлов: ${files.length}`)
    } catch (error) {
      alert('Ошибка при загрузке файлов. Попробуйте снова.')
    } finally {
      setUploadingFiles(false)
    }
  }

  // Удаление файла залога
  const handleRemoveDepositFile = (fileId: number) => {
    setFinancialData({
      ...financialData,
      deposit_files: financialData.deposit_files.filter((f) => f.id !== fileId),
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Загрузка данных...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Заголовок */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 rounded-full p-2">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Профиль и настройки</h1>
              <p className="text-sm text-gray-500">Управление данными вашего профиля</p>
            </div>
          </div>
        </div>

        {/* Форма - все в одном блоке */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Сообщения об ошибках и успехе */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
              {success}
            </div>
          )}

          {/* Личная информация - компактная сетка */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="full_name" className="block text-xs font-medium text-gray-700 mb-1">
                ФИО
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+996 XXX XXX XXX"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-xs font-medium text-gray-700 mb-1">
                Компания
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2 w-full">
                <div
                  className={`h-2 w-2 rounded-full ${
                    authUser?.is_verified ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                ></div>
                <span className="text-xs text-gray-600">
                  {authUser?.is_verified ? 'Верифицирован' : 'Не верифицирован'}
                </span>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Изменение пароля - компактный блок */}
      <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-900 flex items-center">
            <Lock className="h-4 w-4 mr-2 text-gray-500" />
            Изменить пароль
          </h2>
        </div>
        <form onSubmit={handlePasswordSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="old_password" className="block text-xs font-medium text-gray-700 mb-1">
                Старый пароль
              </label>
              <input
                type="password"
                id="old_password"
                name="old_password"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="new_password" className="block text-xs font-medium text-gray-700 mb-1">
                Новый пароль
              </label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-xs font-medium text-gray-700 mb-1">
                Подтверждение
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="h-4 w-4 mr-2" />
                {saving ? 'Сохранение...' : 'Изменить'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Финансовый раздел */}
      <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Финансовая информация
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Залог клиента */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Залог клиента
            </h3>
            
            {/* Наименование залога */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Наименование залога
              </label>
              <input
                type="text"
                value={financialData.deposit_name}
                onChange={(e) =>
                  setFinancialData({ ...financialData, deposit_name: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Введите наименование залога"
              />
            </div>

            {/* Загрузка файлов залога */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Договоры и документы на залог
              </label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleDepositFileUpload(e.target.files)}
                    className="hidden"
                    disabled={uploadingFiles}
                  />
                  <div className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-primary-500 transition-colors">
                    <Upload className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {uploadingFiles ? 'Загрузка...' : 'Выбрать файлы'}
                    </span>
                  </div>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Можно загрузить несколько файлов (PDF, DOC, DOCX, JPG, PNG)
              </p>
            </div>

            {/* Список загруженных файлов */}
            {financialData.deposit_files.length > 0 && (
              <div className="mb-4">
                <div className="space-y-2">
                  {financialData.deposit_files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Paperclip className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-800 truncate"
                        >
                          {file.name}
                        </a>
                      </div>
                      <button
                        onClick={() => handleRemoveDepositFile(file.id)}
                        className="ml-2 p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Удалить файл"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Оценочная стоимость, лимит и срок рассрочки - компактно на одной линии */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-3 border border-green-200 h-16">
                <div className="flex flex-col">
                  <p className="text-xs text-gray-600">Оценочная стоимость</p>
                  <p className="text-xs text-gray-500">(вводит админ)</p>
                </div>
                <p className="text-xl font-bold text-green-700 whitespace-nowrap ml-4">{formatPrice(financialData.deposit_valuation)}</p>
              </div>
              <div className="flex items-center justify-between bg-primary-50 rounded-lg px-4 py-3 border border-primary-200 h-16">
                <div className="flex flex-col">
                  <p className="text-xs text-gray-600">Лимит на рассрочку</p>
                  <p className="text-xs text-gray-500">(50% от оценочной)</p>
                </div>
                <p className="text-xl font-bold text-primary-700 whitespace-nowrap ml-4">{formatPrice(financialData.credit_limit)}</p>
              </div>
              <div className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 border border-blue-200 h-16">
                <div className="flex flex-col">
                  <p className="text-xs text-gray-600">Срок рассрочки</p>
                </div>
                <p className="text-xl font-bold text-blue-700 whitespace-nowrap ml-4">{financialData.credit_term} дней</p>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Статистика</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Товаров приобретено (всего):</span>
                  <span className="text-sm font-medium text-gray-900">{financialData.total_products} шт</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Сумма за наличные:</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(financialData.total_cash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Сумма в рассрочку:</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(financialData.total_credit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Остаток по рассрочке:</span>
                  <span className="text-sm font-medium text-red-600">{formatPrice(financialData.credit_balance)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Сумма контракта:</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(financialData.contract_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Сумма выплат:</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(financialData.total_payments)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Последняя транзакция:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {financialData.last_transaction.date}, {formatPrice(financialData.last_transaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Статус:</span>
                  <span className="text-sm font-medium text-green-600">{financialData.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* История транзакций */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">История транзакций</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {financialData.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{transaction.type}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatPrice(transaction.amount)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Полезные ссылки */}
      <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-600" />
            Полезные ссылки
          </h2>
        </div>
        <div className="p-6 space-y-3">
          <a
            href="/privacy-policy"
            className="flex items-center text-primary-600 hover:text-primary-800 hover:underline transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            Политика конфиденциальности
          </a>
          <a
            href="/terms-of-use"
            className="flex items-center text-primary-600 hover:text-primary-800 hover:underline transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            Условия использования
          </a>
          <a
            href="/support"
            className="flex items-center text-primary-600 hover:text-primary-800 hover:underline transition-colors"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Поддержка
          </a>
        </div>
      </div>

      {/* Удаление аккаунта */}
      <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-red-700 flex items-center">
            <Trash2 className="h-5 w-5 mr-2 text-red-600" />
            Удаление аккаунта
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-700 mb-4">
            Удаление аккаунта является необратимым действием. Все ваши данные будут удалены без возможности восстановления.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {saving ? 'Удаление...' : 'Удалить аккаунт'}
          </button>
        </div>
      </div>
    </div>
  )
}

