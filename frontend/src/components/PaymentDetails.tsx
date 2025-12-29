import { CheckoutFormData } from './CheckoutForm'

interface PaymentDetailsProps {
  formData: CheckoutFormData
  setFormData: (data: CheckoutFormData) => void
  errors: Record<string, string>
}

export default function PaymentDetails({ formData, setFormData, errors }: PaymentDetailsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Реквизиты компании
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название юр.лица *
          </label>
          <input
            type="text"
            value={formData.company_name || ''}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6CF7] ${
              errors.company_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="ООО Компания"
          />
          {errors.company_name && (
            <p className="mt-1 text-sm text-red-500">{errors.company_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            БИН/ИНН *
          </label>
          <input
            type="text"
            value={formData.company_inn || ''}
            onChange={(e) => setFormData({ ...formData, company_inn: e.target.value })}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6CF7] ${
              errors.company_inn ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="12345678901234"
          />
          {errors.company_inn && (
            <p className="mt-1 text-sm text-red-500">{errors.company_inn}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Банк *
          </label>
          <input
            type="text"
            value={formData.company_bank || ''}
            onChange={(e) => setFormData({ ...formData, company_bank: e.target.value })}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6CF7] ${
              errors.company_bank ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="АО Банк"
          />
          {errors.company_bank && (
            <p className="mt-1 text-sm text-red-500">{errors.company_bank}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Номер расчётного счёта *
          </label>
          <input
            type="text"
            value={formData.company_account || ''}
            onChange={(e) => setFormData({ ...formData, company_account: e.target.value })}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6CF7] ${
              errors.company_account ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="12345678901234567890"
          />
          {errors.company_account && (
            <p className="mt-1 text-sm text-red-500">{errors.company_account}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Юридический адрес *
          </label>
          <textarea
            value={formData.company_legal_address || ''}
            onChange={(e) => setFormData({ ...formData, company_legal_address: e.target.value })}
            rows={2}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6CF7] resize-none ${
              errors.company_legal_address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Город, улица, дом"
          />
          {errors.company_legal_address && (
            <p className="mt-1 text-sm text-red-500">{errors.company_legal_address}</p>
          )}
        </div>
      </div>
    </div>
  )
}
