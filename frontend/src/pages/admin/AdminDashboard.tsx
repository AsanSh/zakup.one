import { Link } from 'react-router-dom'
import { Users, Package, ShoppingBag, Upload, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Админ-панель</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Пользователи</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">-</p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Заявки</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">-</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-primary-600" />
          </div>
        </Link>

        <Link
          to="/admin/products"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Товары</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">-</p>
            </div>
            <Package className="h-8 w-8 text-primary-600" />
          </div>
        </Link>

        <Link
          to="/admin/price-lists"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Прайс-листы</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">-</p>
            </div>
            <Upload className="h-8 w-8 text-primary-600" />
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">Управление пользователями</span>
          </Link>
          <Link
            to="/admin/price-lists"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900">Загрузить прайс-лист</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

