import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { ShoppingCart, Search, FileText, LogOut, Settings } from 'lucide-react'

export default function Layout() {
  const location = useLocation()
  const { logout, user } = useAuthStore()
  const { getItemCount } = useCartStore()
  const cartItemCount = getItemCount()

  const navigation = [
    { name: 'Товары', href: '/search', icon: Search },
    { name: 'Сборка заявки', href: '/cart', icon: ShoppingCart, badge: cartItemCount },
    { name: 'Мои заявки', href: '/orders', icon: FileText },
    ...(user?.is_admin ? [{ name: 'Админ-панель', href: '/admin', icon: Settings }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                ZAKUP.ONE
              </Link>
            </div>

            <nav className="flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                // Для админ-панели проверяем, начинается ли путь с /admin
                const isActive = item.href === '/admin' 
                  ? location.pathname === item.href || location.pathname.startsWith('/admin')
                  : location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/profile'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{user?.full_name || user?.email}</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Выход</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

