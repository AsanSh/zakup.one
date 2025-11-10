import { useEffect, useState } from 'react'
import { api } from '../../api/api'
import { Loader2, Package, Truck } from 'lucide-react'

interface Order {
  id: number
  user_id: number
  user_email: string
  user_name: string
  status: string
  delivery_address: string
  tracking_number?: string
  estimated_delivery_date?: string
  created_at: string
  items_count: number
}

const statusLabels: Record<string, string> = {
  new: 'Новая',
  in_progress: 'В обработке',
  collected: 'Собрана',
  shipped: 'Отправлена',
  in_transit: 'В пути',
  delivered: 'Доставлена',
  cancelled: 'Отменена',
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  collected: 'bg-green-100 text-green-800',
  shipped: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)
  const [statusForm, setStatusForm] = useState({
    status: '',
    tracking_number: '',
    estimated_delivery_date: '',
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await api.admin.getOrders()
      setOrders(data)
    } catch (err: any) {
      console.error('Ошибка загрузки заявок:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: number) => {
    try {
      await api.admin.updateOrderStatus(
        orderId,
        statusForm.status,
        statusForm.tracking_number || undefined,
        statusForm.estimated_delivery_date || undefined
      )
      setSelectedOrder(null)
      setStatusForm({ status: '', tracking_number: '', estimated_delivery_date: '' })
      fetchOrders()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка обновления статуса')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Заявки</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">№</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Адрес</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <>
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{order.user_name}</div>
                      <div className="text-xs text-gray-500">{order.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.delivery_address}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[order.status] || statusColors.new
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedOrder(order.id)
                        setStatusForm({
                          status: order.status,
                          tracking_number: order.tracking_number || '',
                          estimated_delivery_date: order.estimated_delivery_date
                            ? new Date(order.estimated_delivery_date).toISOString().split('T')[0]
                            : '',
                        })
                      }}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      Изменить статус
                    </button>
                  </td>
                </tr>
                {selectedOrder === order.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Изменение статуса заказа #{order.id}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Статус
                            </label>
                            <select
                              value={statusForm.status}
                              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                              <option value="new">Новая</option>
                              <option value="in_progress">В обработке</option>
                              <option value="collected">Собрана</option>
                              <option value="shipped">Отправлена</option>
                              <option value="in_transit">В пути</option>
                              <option value="delivered">Доставлена</option>
                              <option value="cancelled">Отменена</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Номер отслеживания
                            </label>
                            <input
                              type="text"
                              value={statusForm.tracking_number}
                              onChange={(e) => setStatusForm({ ...statusForm, tracking_number: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              placeholder="TRACK123456"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ожидаемая дата доставки
                            </label>
                            <input
                              type="date"
                              value={statusForm.estimated_delivery_date}
                              onChange={(e) => setStatusForm({ ...statusForm, estimated_delivery_date: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(order.id)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(null)
                              setStatusForm({ status: '', tracking_number: '', estimated_delivery_date: '' })
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

