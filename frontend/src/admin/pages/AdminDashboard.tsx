/**
 * Dashboard админ-панели с реальной статистикой
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminApi } from '../../shared/api'
import { formatPrice } from '../../shared/utils/formatters'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../shared/utils/constants'
import StatsCard from '../components/StatsCard'
import { Users, Package, ShoppingBag, TrendingUp, Loader2, DollarSign, Building2, AlertCircle } from 'lucide-react'

interface DashboardStats {
  orders_by_status: Record<string, number>
  new_users_this_month: number
  total_turnover: number
  total_products: number
  total_suppliers?: number
  total_users?: number
  pending_orders?: number
  orders_by_day: Array<{ date: string; count: number }>
  recent_orders: Array<{
    id: number
    user_name: string | null
    status: string
    created_at: string | null
    items_count: number
  }>
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getStats()
      setStats(data)
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">Не удалось загрузить статистику</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  // Подсчет активных заявок (не доставленных и не отмененных)
  const activeOrders =
    (stats.orders_by_status.new || 0) +
    (stats.orders_by_status.in_progress || 0) +
    (stats.orders_by_status.collected || 0) +
    (stats.orders_by_status.shipped || 0) +
    (stats.orders_by_status.in_transit || 0)

  // Подсчет общей статистики
  const totalOrders = Object.values(stats.orders_by_status).reduce((sum, count) => sum + count, 0)
  const deliveredOrders = stats.orders_by_status.delivered || 0
  const cancelledOrders = stats.orders_by_status.cancelled || 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
        <p className="mt-2 text-sm text-gray-600">
          Обзор системы и ключевые показатели
        </p>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Активные заявки"
          value={activeOrders}
          icon={ShoppingBag}
          iconColor="text-blue-600"
          onClick={() => navigate('/admin/orders')}
        />
        <StatsCard
          title="Новые клиенты (месяц)"
          value={stats.new_users_this_month}
          icon={Users}
          iconColor="text-green-600"
          onClick={() => navigate('/admin/users')}
        />
        <StatsCard
          title="Товары в каталоге"
          value={stats.total_products}
          icon={Package}
          iconColor="text-purple-600"
          onClick={() => navigate('/admin/products')}
        />
        <StatsCard
          title="Оборот (доставлено)"
          value={formatPrice(stats.total_turnover)}
          icon={DollarSign}
          iconColor="text-yellow-600"
          trend={deliveredOrders > 0 ? { value: Math.round((deliveredOrders / totalOrders) * 100), isPositive: true } : undefined}
        />
      </div>

      {/* Дополнительная статистика */}
      {(stats.total_suppliers !== undefined || stats.total_users !== undefined || stats.pending_orders !== undefined) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.total_suppliers !== undefined && (
            <StatsCard
              title="Активные поставщики"
              value={stats.total_suppliers}
              icon={Building2}
              iconColor="text-indigo-600"
              onClick={() => navigate('/admin/counterparties/suppliers')}
            />
          )}
          {stats.total_users !== undefined && (
            <StatsCard
              title="Активные клиенты"
              value={stats.total_users}
              icon={Users}
              iconColor="text-green-600"
              onClick={() => navigate('/admin/users')}
            />
          )}
          {stats.pending_orders !== undefined && (
            <StatsCard
              title="Новые заявки"
              value={stats.pending_orders}
              icon={AlertCircle}
              iconColor="text-orange-600"
              onClick={() => navigate('/admin/orders?status=new')}
            />
          )}
        </div>
      )}

      {/* Заявки по статусам */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Заявки по статусам</h2>
          <span className="text-sm text-gray-500">Всего: {totalOrders}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(stats.orders_by_status).map(([status, count]) => (
            <div
              key={status}
              className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all cursor-pointer"
              onClick={() => navigate(`/admin/orders?status=${status}`)}
            >
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-600 mt-1">{ORDER_STATUS_LABELS[status] || status}</p>
              {totalOrders > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round((count / totalOrders) * 100)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* График заявок по дням */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Заявки за последние 7 дней</h2>
          <span className="text-sm text-gray-500">
            Всего: {stats.orders_by_day.reduce((sum, day) => sum + day.count, 0)}
          </span>
        </div>
        <div className="flex items-end justify-between h-48 space-x-2">
          {stats.orders_by_day.map((day, index) => {
            const maxCount = Math.max(...stats.orders_by_day.map(d => d.count), 1)
            const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
            const dayName = new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short' })

            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="w-full flex items-end justify-center mb-2" style={{ height: '160px' }}>
                  <div
                    className="w-full bg-gradient-to-t from-primary-600 to-primary-500 rounded-t hover:from-primary-700 hover:to-primary-600 transition-all cursor-pointer shadow-sm group-hover:shadow-md"
                    style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                    title={`${day.count} заявок - ${new Date(day.date).toLocaleDateString('ru-RU')}`}
                  />
                </div>
                <p className="text-xs text-gray-500 uppercase">{dayName}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(day.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{day.count}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Последние заявки */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Последние заявки</h2>
          <Link
            to="/admin/orders"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Все заявки →
          </Link>
        </div>
        {stats.recent_orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    №
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Товаров
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recent_orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/orders`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.new
                        }`}
                      >
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Нет заявок</p>
            <Link
              to="/admin/orders"
              className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700"
            >
              Перейти к заявкам →
            </Link>
          </div>
        )}
      </div>

      {/* Быстрые действия */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">Управление пользователями</span>
          </Link>
          <Link
            to="/admin/management/price-lists"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">Загрузить прайс-лист</span>
          </Link>
          <Link
            to="/admin/products"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">Управление товарами</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">Управление заявками</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
