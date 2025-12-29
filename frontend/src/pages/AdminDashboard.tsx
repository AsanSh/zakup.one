import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import apiClient from '../api/client'
import SuppliersManager from '../components/admin/SuppliersManager'
import ProductsManager from '../components/admin/ProductsManager'
import OrdersManager from '../components/admin/OrdersManager'
import ClientsManager from '../components/admin/ClientsManager'

type MenuItemType = 'suppliers' | 'products' | 'orders' | 'clients' | null

interface Supplier {
  id: number
  name: string
  internal_code: string
  is_active: boolean
}

interface Product {
  id: number
  name: string
  article: string
  unit: string
  final_price: number
  is_active: boolean
}

interface Order {
  id: number
  order_number?: string
  status: string
  total_amount: number
  created_at: string
  client: {
    email: string
  }
}

interface Client {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
}

interface AdminStats {
  suppliers: {
    total: number
    active: number
  }
  products: {
    total: number
    active: number
  }
  categories: {
    total: number
  }
  orders: {
    total: number
    pending: number
    processing: number
    completed: number
    cancelled: number
  }
  clients: {
    total: number
    active: number
  }
  price_lists: {
    total: number
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useUserStore()
  const [activeMenu, setActiveMenu] = useState<MenuItemType>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // При загрузке компонента и при обновлении страницы возвращаемся на главную
  useEffect(() => {
    setActiveMenu(null)
    loadStats()
  }, [])

  // Загрузка статистики
  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const response = await apiClient.get('/api/admin/stats/')
      setStats(response.data)
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleMenuClick = async (menuType: MenuItemType) => {
    // Если кликаем на уже активное меню, возвращаемся на главную
    if (activeMenu === menuType) {
      setActiveMenu(null)
      loadStats()
      return
    }
    
    setActiveMenu(menuType)
    setLoading(true)

    try {
      switch (menuType) {
        case 'suppliers':
          // Данные загружаются в компоненте SuppliersManager
          break
        case 'products':
          const productsRes = await apiClient.get('/api/catalog/products-admin/')
          setProducts(productsRes.data.results || productsRes.data || [])
          break
        case 'orders':
          const ordersRes = await apiClient.get('/api/orders/orders-admin/')
          setOrders(ordersRes.data.results || ordersRes.data || [])
          break
        case 'clients':
          const clientsRes = await apiClient.get('/api/auth/users/')
          setClients(clientsRes.data.results || clientsRes.data || [])
          break
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  // Обработчик клика на логотип - возврат на главную
  const handleLogoClick = () => {
    setActiveMenu(null)
    loadStats()
  }

  const menuItems = [
    {
      id: 'suppliers' as MenuItemType,
      title: 'Поставщики',
      description: 'Управление поставщиками и прайс-листами',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'products' as MenuItemType,
      title: 'Товары',
      description: 'Управление каталогом товаров',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'orders' as MenuItemType,
      title: 'Заявки',
      description: 'Просмотр и управление заявками',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'clients' as MenuItemType,
      title: 'Клиенты',
      description: 'Управление пользователями и компаниями',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ]

  const renderContent = () => {
    if (!activeMenu) {
      return (
        <div className="py-6">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Добро пожаловать в админ-панель</h3>
            <p className="text-gray-600">Общая статистика и показатели системы</p>
          </div>

          {statsLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Загрузка статистики...</div>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Поставщики */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Поставщики</h4>
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Всего:</span>
                    <span className="font-semibold text-gray-900">{stats.suppliers.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Активных:</span>
                    <span className="font-semibold text-green-600">{stats.suppliers.active}</span>
                  </div>
                </div>
              </div>

              {/* Товары */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Товары</h4>
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Всего:</span>
                    <span className="font-semibold text-gray-900">{stats.products.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Активных:</span>
                    <span className="font-semibold text-green-600">{stats.products.active}</span>
                  </div>
                </div>
              </div>

              {/* Категории */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Категории</h4>
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Всего:</span>
                    <span className="font-semibold text-gray-900">{stats.categories.total}</span>
                  </div>
                </div>
              </div>

              {/* Заявки */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Заявки</h4>
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Всего:</span>
                    <span className="font-semibold text-gray-900">{stats.orders.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ожидают:</span>
                    <span className="font-semibold text-yellow-600">{stats.orders.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">В обработке:</span>
                    <span className="font-semibold text-blue-600">{stats.orders.processing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Завершено:</span>
                    <span className="font-semibold text-green-600">{stats.orders.completed}</span>
                  </div>
                </div>
              </div>

              {/* Клиенты */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Клиенты</h4>
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Всего:</span>
                    <span className="font-semibold text-gray-900">{stats.clients.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Активных:</span>
                    <span className="font-semibold text-green-600">{stats.clients.active}</span>
                  </div>
                </div>
              </div>

              {/* Прайс-листы */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Прайс-листы</h4>
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Всего:</span>
                    <span className="font-semibold text-gray-900">{stats.price_lists.total}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">Не удалось загрузить статистику</div>
            </div>
          )}
        </div>
      )
    }

    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      )
    }

    switch (activeMenu) {
      case 'suppliers':
        return <SuppliersManager />

      case 'products':
        return <ProductsManager />

      case 'orders':
        return <OrdersManager />

      case 'clients':
        return <ClientsManager />

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      {/* Основной контент */}
      <div className={`flex-1 min-w-0 ${!isMobile ? 'pr-12 xl:pr-80' : ''} ${isMobile ? 'pb-16' : ''}`}>
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 
                  onClick={handleLogoClick}
                  className="text-xl sm:text-2xl font-bold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  ZAKUP.ONE
                </h1>
              </div>
              <nav className="flex items-center gap-2 sm:gap-4 text-sm">
                <span className="text-gray-600 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{user?.full_name || user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-xs sm:text-sm"
                >
                  Выйти
                </button>
              </nav>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {renderContent()}
        </main>
      </div>

      {/* Боковое правое меню - скрыто на мобильных, видимо на десктопе */}
      {!isMobile && (
      <aside className="w-12 xl:w-80 bg-white border-l border-gray-200 shadow-lg fixed right-0 top-0 bottom-0 overflow-y-auto z-30">
        <div className="p-2 xl:p-6">
          {/* Заголовок - только на xl+ экранах */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4 hidden xl:block">Меню</h3>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex flex-col xl:flex-row items-center xl:items-start gap-2 xl:gap-3 p-2 xl:p-4 rounded-lg transition-colors group border ${
                    isActive 
                      ? 'bg-indigo-50 border-indigo-200' 
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                  title={item.title} // Tooltip для иконок
                >
                  {/* Стрелка активности - только на xl+ экранах */}
                  {isActive && (
                    <div className="hidden xl:flex flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Иконка */}
                  <div className={`flex-shrink-0 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'
                  }`}>
                    {item.icon}
                  </div>
                  
                  {/* Текст - только на xl+ экранах */}
                  <div className="hidden xl:flex flex-1 min-w-0 text-left">
                    <div>
                      <h4 className={`text-sm sm:text-base font-semibold transition-colors ${
                        isActive ? 'text-indigo-600' : 'text-gray-900 group-hover:text-indigo-600'
                      }`}>
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>
      )}

      {/* Нижнее меню для мобильных устройств */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white z-50 shadow-lg lg:hidden safe-area-inset-bottom">
          <div className="flex items-center justify-around h-16 px-2">
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors flex-1 ${
                    isActive
                      ? 'bg-white/20'
                      : ''
                  }`}
                  title={item.title}
                >
                  <div className="w-5 h-5">
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium">{item.title}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
