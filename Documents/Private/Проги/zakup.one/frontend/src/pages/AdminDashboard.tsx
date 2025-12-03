import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useUserStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">ZAKUP.ONE</h1>
            <nav className="flex items-center gap-2 sm:gap-4 text-sm">
              <a 
                href="http://localhost:8000/admin" 
                className="text-indigo-600 hover:text-indigo-800"
              >
                Django Admin
              </a>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{user?.full_name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Выйти
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Карточки разделов */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Поставщики</h3>
            <p className="text-sm text-gray-600 mb-4">Управление поставщиками и прайс-листами</p>
            <a 
              href="http://localhost:8000/admin/suppliers/supplier/" 
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Перейти →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Товары</h3>
            <p className="text-sm text-gray-600 mb-4">Управление каталогом товаров</p>
            <a 
              href="http://localhost:8000/admin/catalog/product/" 
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Перейти →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Заявки</h3>
            <p className="text-sm text-gray-600 mb-4">Просмотр и управление заявками</p>
            <a 
              href="http://localhost:8000/admin/orders/order/" 
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Перейти →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Клиенты</h3>
            <p className="text-sm text-gray-600 mb-4">Управление пользователями и компаниями</p>
            <a 
              href="http://localhost:8000/admin/users/user/" 
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Перейти →
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}


