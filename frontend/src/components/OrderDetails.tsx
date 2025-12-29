import { Order } from '../store/ordersStore'

interface OrderDetailsProps {
  order: Order
  onClose: () => void
}

const statusLabels: Record<string, string> = {
  NEW: 'Новая',
  PAID: 'Оплачена',
  IN_PROGRESS: 'В обработке',
  COLLECTED: 'Собрана',
  IN_DELIVERY: 'В доставке',
  DELIVERED: 'Доставлена',
  PROBLEMATIC: 'Проблемная',
  CANCELLED: 'Отменена',
  DEBT: 'Долг',
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COLLECTED: 'bg-purple-100 text-purple-800',
  IN_DELIVERY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
  PROBLEMATIC: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-red-100 text-red-800',
  DEBT: 'bg-red-100 text-red-800',
}

export default function OrderDetails({ order, onClose }: OrderDetailsProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Заявка {order.order_number}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                  {statusLabels[order.status] || order.status}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleString('ru-RU')}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Информация о получателе */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Информация о получателе</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Имя:</span>
                  <span className="ml-2 font-medium text-gray-900">{order.recipient_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Телефон:</span>
                  <span className="ml-2 font-medium text-gray-900">{order.recipient_phone}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-600">Адрес доставки:</span>
                  <span className="ml-2 font-medium text-gray-900">{order.delivery_address}</span>
                </div>
              </div>
            </div>

            {/* Реквизиты компании (если есть) */}
            {order.payment_type === 'with_invoice' && order.company_name && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Реквизиты компании</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Название:</span>
                    <span className="ml-2 font-medium text-gray-900">{order.company_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">БИН/ИНН:</span>
                    <span className="ml-2 font-medium text-gray-900">{order.company_inn}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Банк:</span>
                    <span className="ml-2 font-medium text-gray-900">{order.company_bank}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Расчетный счет:</span>
                    <span className="ml-2 font-medium text-gray-900">{order.company_account}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Юридический адрес:</span>
                    <span className="ml-2 font-medium text-gray-900">{order.company_legal_address}</span>
                  </div>
                  {order.invoice_number && (
                    <div>
                      <span className="text-gray-600">Номер счета:</span>
                      <span className="ml-2 font-medium text-gray-900">{order.invoice_number}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Товары */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Товары</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Количество</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Цена</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{item.product.name}</div>
                            <div className="text-sm text-gray-500">Арт: {item.product.article}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {item.quantity} {item.product.unit}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {Number(item.price).toLocaleString('ru-RU')} сом
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          {Number(item.total_price).toLocaleString('ru-RU')} сом
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">
                        Итого:
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-lg text-gray-900">
                        {order.total_amount.toLocaleString('ru-RU')} сом
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Комментарий (если есть) */}
            {order.comment && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Комментарий</h3>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{order.comment}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
