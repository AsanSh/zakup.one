import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

interface Order {
  id: number
  order_number: string
  client: { email: string; full_name: string }
  status: string
  total_amount: number
  created_at: string
  items: Array<{ product: { name: string }; quantity: number; price: number }>
}

const STATUS_GROUPS = {
  NEW: { label: 'Новые заявки', statuses: ['NEW'], color: 'blue' },
  IN_PROGRESS: { label: 'В процессе', statuses: ['IN_PROGRESS', 'COLLECTED'], color: 'yellow' },
  IN_DELIVERY: { label: 'В доставке', statuses: ['IN_DELIVERY'], color: 'purple' },
  DELIVERED: { label: 'Доставленные', statuses: ['DELIVERED'], color: 'green' },
  PROBLEMATIC: { label: 'Проблемные', statuses: ['PROBLEMATIC'], color: 'red' },
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [selectedStatus])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const url = selectedStatus 
        ? `/orders/orders-admin/?status=${selectedStatus}`
        : '/orders/orders-admin/'
      const res = await apiClient.get(url)
      setOrders(res.data.results || res.data || [])
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await apiClient.patch(`/orders/orders-admin/${orderId}/change_status/`, { status: newStatus })
      loadOrders()
    } catch (error: any) {
      // Если endpoint не работает, попробуем обновить через обычный PATCH
      try {
        await apiClient.patch(`/orders/orders-admin/${orderId}/`, { status: newStatus })
        loadOrders()
      } catch (e: any) {
        alert(e?.response?.data?.error || 'Ошибка при изменении статуса')
      }
    }
  }

  const getOrdersByGroup = (groupKey: keyof typeof STATUS_GROUPS) => {
    return orders.filter(order => STATUS_GROUPS[groupKey].statuses.includes(order.status))
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Заявки</h3>
        <select
          value={selectedStatus || ''}
          onChange={(e) => setSelectedStatus(e.target.value || null)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Все заявки</option>
          <option value="NEW">Новые</option>
          <option value="IN_PROGRESS">В обработке</option>
          <option value="COLLECTED">Собраны</option>
          <option value="IN_DELIVERY">В доставке</option>
          <option value="DELIVERED">Доставлены</option>
          <option value="PROBLEMATIC">Проблемные</option>
        </select>
      </div>

      {/* Блоки по статусам */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {(Object.keys(STATUS_GROUPS) as Array<keyof typeof STATUS_GROUPS>).map((groupKey) => {
          const group = STATUS_GROUPS[groupKey]
          const groupOrders = getOrdersByGroup(groupKey)
          return (
            <div key={groupKey} className="bg-white rounded-lg shadow-sm p-4">
              <h4 className={`text-lg font-semibold mb-3 text-${group.color}-600`}>
                {group.label} ({groupOrders.length})
              </h4>
              {groupOrders.length === 0 ? (
                <p className="text-sm text-gray-500">Нет заявок</p>
              ) : (
                <div className="space-y-2">
                  {groupOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border rounded p-2 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{order.order_number || `#${order.id}`}</div>
                          <div className="text-xs text-gray-500">{order.client.email}</div>
                          <div className="text-xs font-semibold mt-1">
                            {Number(order.total_amount).toLocaleString('ru-RU')} сом
                          </div>
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="NEW">Новая</option>
                          <option value="IN_PROGRESS">В обработке</option>
                          <option value="COLLECTED">Собрана</option>
                          <option value="IN_DELIVERY">В доставке</option>
                          <option value="DELIVERED">Доставлена</option>
                          <option value="PROBLEMATIC">Проблемная</option>
                          <option value="CANCELLED">Отменена</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Полная таблица */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Заявки не найдены</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '33%' }} />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Номер</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 truncate">
                    {order.order_number || `#${order.id}`}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-600 truncate" title={order.client.email}>{order.client.email}</td>
                  <td className="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">
                    {Number(order.total_amount).toLocaleString('ru-RU')} сом
                  </td>
                  <td className="px-2 py-2 text-xs">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs border rounded px-1.5 py-0.5 w-full"
                    >
                      <option value="NEW">Новая</option>
                      <option value="IN_PROGRESS">В обработке</option>
                      <option value="COLLECTED">Собрана</option>
                      <option value="IN_DELIVERY">В доставке</option>
                      <option value="DELIVERED">Доставлена</option>
                      <option value="PROBLEMATIC">Проблемная</option>
                      <option value="CANCELLED">Отменена</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

