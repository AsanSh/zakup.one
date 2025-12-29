import React, { useState, useEffect } from 'react'

interface CompanyFormData {
  name: string
  inn: string
  bank: string
  account: string
  legal_address: string
  is_default: boolean
}

interface CompanyFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CompanyFormData) => Promise<void>
  initialData?: CompanyFormData | null
  loading?: boolean
}

export default function CompanyFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false
}: CompanyFormModalProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    inn: '',
    bank: '',
    account: '',
    legal_address: '',
    is_default: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData)
      } else {
        setFormData({
          name: '',
          inn: '',
          bank: '',
          account: '',
          legal_address: '',
          is_default: false
        })
      }
      setErrors({})
    }
  }, [isOpen, initialData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Название компании обязательно'
    }
    if (!formData.inn.trim()) {
      newErrors.inn = 'ИНН обязателен'
    } else if (!/^\d+$/.test(formData.inn.trim())) {
      newErrors.inn = 'ИНН должен содержать только цифры'
    }
    if (!formData.bank.trim()) {
      newErrors.bank = 'Название банка обязательно'
    }
    if (!formData.account.trim()) {
      newErrors.account = 'Расчетный счет обязателен'
    } else if (!/^\d+$/.test(formData.account.trim())) {
      newErrors.account = 'Расчетный счет должен содержать только цифры'
    }
    if (!formData.legal_address.trim()) {
      newErrors.legal_address = 'Юридический адрес обязателен'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      await onSubmit(formData)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Редактировать компанию' : 'Добавить компанию'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Закрыть"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Название компании <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ООО Компания"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* INN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ИНН <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.inn}
                onChange={(e) => setFormData({ ...formData, inn: e.target.value.replace(/\D/g, '') })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.inn ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123456789012"
                maxLength={20}
              />
              {errors.inn && (
                <p className="mt-1 text-xs text-red-500">{errors.inn}</p>
              )}
            </div>

            {/* Bank */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Банк <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.bank ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Название банка"
              />
              {errors.bank && (
                <p className="mt-1 text-xs text-red-500">{errors.bank}</p>
              )}
            </div>

            {/* Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Расчетный счет <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value.replace(/\D/g, '') })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.account ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12345678901234567890"
                maxLength={30}
              />
              {errors.account && (
                <p className="mt-1 text-xs text-red-500">{errors.account}</p>
              )}
            </div>

            {/* Legal Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Юридический адрес <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.legal_address}
                onChange={(e) => setFormData({ ...formData, legal_address: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.legal_address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Город, улица, дом"
              />
              {errors.legal_address && (
                <p className="mt-1 text-xs text-red-500">{errors.legal_address}</p>
              )}
            </div>

            {/* Is Default */}
            <div>
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Использовать по умолчанию</div>
                  <div className="text-xs text-gray-500">Эта компания будет автоматически выбираться при оформлении заказов</div>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Сохранение...' : initialData ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

