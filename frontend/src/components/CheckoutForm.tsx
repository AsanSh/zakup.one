import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import YandexAddressInput from './YandexAddressInput'

export interface CheckoutFormData {
  recipient_name: string
  recipient_phone: string
  delivery_address: string
  delivery_date?: string
  comment?: string
  payment_type: 'without_invoice' | 'with_invoice'
  user_company_id?: number
  company_name?: string
  company_inn?: string
  company_bank?: string
  company_account?: string
  company_legal_address?: string
  installment?: boolean
}

interface UserCompany {
  id: number
  name: string
  inn: string
  orders_count: number
  installment_available: boolean
}

interface SubscriptionInfo {
  plan_type: string
  delivery_tracking_available: boolean
  installment_available: boolean
}

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void
  loading?: boolean
  defaultValues?: Partial<CheckoutFormData>
}

export default function CheckoutForm({ onSubmit, loading = false, defaultValues }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    recipient_name: defaultValues?.recipient_name || '',
    recipient_phone: defaultValues?.recipient_phone || '',
    delivery_address: defaultValues?.delivery_address || '',
    delivery_date: defaultValues?.delivery_date || '',
    comment: defaultValues?.comment || '',
    payment_type: defaultValues?.payment_type || 'without_invoice',
    user_company_id: defaultValues?.user_company_id,
    company_name: defaultValues?.company_name || '',
    company_inn: defaultValues?.company_inn || '',
    company_bank: defaultValues?.company_bank || '',
    company_account: defaultValues?.company_account || '',
    company_legal_address: defaultValues?.company_legal_address || '',
    installment: defaultValues?.installment || false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([])
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  useEffect(() => {
    loadUserCompanies()
    loadSubscriptionInfo()
  }, [])

  const loadUserCompanies = async () => {
    try {
      setLoadingCompanies(true)
      const response = await apiClient.get('/api/auth/user-companies/')
      setUserCompanies(response.data.results || response.data || [])
    } catch (error) {
      console.error('Ошибка загрузки компаний:', error)
    } finally {
      setLoadingCompanies(false)
    }
  }

  const loadSubscriptionInfo = async () => {
    try {
      const response = await apiClient.get('/api/auth/subscriptions/')
      const subscriptions = response.data.results || response.data || []
      const active = subscriptions.find((s: any) => s.is_active)
      if (active && active.plan) {
        setSubscriptionInfo({
          plan_type: active.plan.plan_type,
          delivery_tracking_available: active.plan.delivery_tracking_available || false,
          installment_available: active.plan.installment_available || false,
        })
      }
    } catch (error) {
      console.error('Ошибка загрузки подписки:', error)
    }
  }

  const handleCompanySelect = async (companyId: number) => {
    const company = userCompanies.find(c => c.id === companyId)
    if (company) {
      // Загружаем полные данные компании
      try {
        const response = await apiClient.get(`/api/auth/user-companies/${companyId}/`)
        const fullCompany = response.data
        setFormData({
          ...formData,
          user_company_id: companyId,
          company_name: fullCompany.name,
          company_inn: fullCompany.inn,
          company_bank: fullCompany.bank || '',
          company_account: fullCompany.account || '',
          company_legal_address: fullCompany.legal_address || '',
        })
      } catch (error) {
        // Если не удалось загрузить, используем базовые данные
        setFormData({
          ...formData,
          user_company_id: companyId,
          company_name: company.name,
          company_inn: company.inn,
        })
      }
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.recipient_name.trim()) {
      newErrors.recipient_name = 'Имя получателя обязательно'
    }
    if (!formData.recipient_phone.trim()) {
      newErrors.recipient_phone = 'Телефон получателя обязателен'
    }
    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = 'Адрес доставки обязателен'
    }

    if (formData.payment_type === 'with_invoice') {
      if (!formData.company_name?.trim()) {
        newErrors.company_name = 'Название компании обязательно'
      }
      if (!formData.company_inn?.trim()) {
        newErrors.company_inn = 'ИНН обязателен'
      }
      if (!formData.company_bank?.trim()) {
        newErrors.company_bank = 'Банк обязателен'
      }
      if (!formData.company_account?.trim()) {
        newErrors.company_account = 'Расчетный счет обязателен'
      }
      if (!formData.company_legal_address?.trim()) {
        newErrors.company_legal_address = 'Юридический адрес обязателен'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {/* Recipient Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Данные получателя</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Имя получателя <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.recipient_name}
              onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                errors.recipient_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Введите имя получателя"
            />
            {errors.recipient_name && (
              <p className="mt-1 text-xs text-red-500">{errors.recipient_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Телефон получателя <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.recipient_phone}
              onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                errors.recipient_phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+996 (XXX) XXX-XXX"
            />
            {errors.recipient_phone && (
              <p className="mt-1 text-xs text-red-500">{errors.recipient_phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Адрес доставки <span className="text-red-500">*</span>
            </label>
            <YandexAddressInput
              value={formData.delivery_address}
              onChange={(address) => setFormData({ ...formData, delivery_address: address })}
              placeholder="Введите адрес доставки"
              error={errors.delivery_address}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Желаемая дата доставки
            </label>
            <input
              type="date"
              value={formData.delivery_date}
              onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Комментарий
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none"
              placeholder="Дополнительная информация к заказу"
            />
          </div>
        </div>
      </div>

      {/* Payment Type */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Способ оплаты</h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="payment_type"
              value="without_invoice"
              checked={formData.payment_type === 'without_invoice'}
              onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as 'without_invoice' })}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Без счета</div>
              <div className="text-sm text-gray-500">Оплата наличными или переводом</div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="payment_type"
              value="with_invoice"
              checked={formData.payment_type === 'with_invoice'}
              onChange={(e) => setFormData({ ...formData, payment_type: e.target.value as 'with_invoice' })}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Со счетом</div>
              <div className="text-sm text-gray-500">Требуется счет на оплату</div>
            </div>
          </label>
        </div>
      </div>

      {/* Company Details (if with invoice) */}
      {formData.payment_type === 'with_invoice' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Данные компании</h3>
          
          {/* Select Company */}
          {userCompanies.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Выберите компанию
              </label>
              <select
                value={formData.user_company_id || ''}
                onChange={(e) => {
                  const companyId = e.target.value ? parseInt(e.target.value) : undefined
                  if (companyId) {
                    handleCompanySelect(companyId)
                  } else {
                    setFormData({ ...formData, user_company_id: undefined })
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="">Выберите компанию или введите вручную</option>
                {userCompanies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name} (ИНН: {company.inn})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Название компании <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                  errors.company_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ООО Компания"
              />
              {errors.company_name && (
                <p className="mt-1 text-xs text-red-500">{errors.company_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ИНН <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.company_inn}
                onChange={(e) => setFormData({ ...formData, company_inn: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                  errors.company_inn ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123456789012"
              />
              {errors.company_inn && (
                <p className="mt-1 text-xs text-red-500">{errors.company_inn}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Банк <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.company_bank}
                onChange={(e) => setFormData({ ...formData, company_bank: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                  errors.company_bank ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Название банка"
              />
              {errors.company_bank && (
                <p className="mt-1 text-xs text-red-500">{errors.company_bank}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Расчетный счет <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.company_account}
                onChange={(e) => setFormData({ ...formData, company_account: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                  errors.company_account ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12345678901234567890"
              />
              {errors.company_account && (
                <p className="mt-1 text-xs text-red-500">{errors.company_account}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Юридический адрес <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.company_legal_address}
                onChange={(e) => setFormData({ ...formData, company_legal_address: e.target.value })}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none ${
                  errors.company_legal_address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Город, улица, дом"
              />
              {errors.company_legal_address && (
                <p className="mt-1 text-xs text-red-500">{errors.company_legal_address}</p>
              )}
            </div>
          </div>

          {/* Installment Checkbox (VIP only) */}
          {subscriptionInfo?.plan_type === 'VIP' && subscriptionInfo?.installment_available && formData.user_company_id && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              {(() => {
                const selectedCompany = userCompanies.find(c => c.id === formData.user_company_id)
                const canInstallment = selectedCompany?.installment_available || false
                
                return (
                  <>
                    {!canInstallment ? (
                      <div className="text-sm text-purple-800">
                        <p className="font-medium mb-1">Рассрочка недоступна</p>
                        <p className="text-purple-600">
                          Рассрочка станет доступна после 5 успешно завершённых заказов от этой компании.
                          Текущее количество заказов: {selectedCompany?.orders_count || 0}/5
                        </p>
                      </div>
                    ) : (
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.installment || false}
                          onChange={(e) => setFormData({ ...formData, installment: e.target.checked })}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-purple-900">Оформить в рассрочку</div>
                          <div className="text-sm text-purple-700 mt-1">
                            Условия рассрочки будут указаны отдельно
                          </div>
                        </div>
                      </label>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? 'Оформление...' : 'Оформить заявку'}
        </button>
      </div>
    </form>
  )
}

