/**
 * Layout для админ-панели с сайдбаром
 */
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  FileText,
  LogOut,
  Menu,
  X,
  Building2,
  Store,
  UsersRound,
  Truck,
  Settings,
  Tag,
  Calendar,
  DollarSign,
  Shield,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const adminNavigation = [
  { name: 'Панель управления', href: '/admin', icon: LayoutDashboard },
  { name: 'Пользователи', href: '/admin/users', icon: Users },
  { name: 'Заявки', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Товары', href: '/admin/products', icon: Package },
  { 
    name: 'Контрагенты', 
    href: '/admin/counterparties', 
    icon: UsersRound,
    submenu: [
      { name: 'Поставщики', href: '/admin/counterparties/suppliers', icon: Building2 },
      { name: 'Снабженцы', href: '/admin/counterparties/procurement', icon: Users },
      { name: 'Водители', href: '/admin/counterparties/drivers', icon: Truck },
      { name: 'Управление доступом', href: '/admin/counterparties/access', icon: Shield },
    ]
  },
  { 
    name: 'Управление', 
    href: '/admin/management', 
    icon: Settings,
    submenu: [
      { name: 'Обновление прайс-листов', href: '/admin/management/price-lists', icon: Calendar },
      { name: 'Управление ценами', href: '/admin/management/prices', icon: DollarSign },
      { name: 'Управление товарами', href: '/admin/management/products', icon: Tag },
    ]
  },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleSubmenu = (menuName: string) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuName)) {
      newExpanded.delete(menuName)
    } else {
      newExpanded.add(menuName)
    }
    setExpandedMenus(newExpanded)
  }

  const isSubmenuActive = (submenu: typeof adminNavigation[0]['submenu']) => {
    if (!submenu) return false
    return submenu.some(item => {
      if (location.pathname === item.href) return true
      if (location.pathname.startsWith(item.href + '/')) return true
      return false
    })
  }

  // Автоматически раскрываем подменю, если активен один из его пунктов
  useEffect(() => {
    const newExpanded = new Set<string>()
    adminNavigation.forEach(item => {
      if (item.submenu && isSubmenuActive(item.submenu)) {
        newExpanded.add(item.name)
      }
    })
    if (newExpanded.size > 0) {
      setExpandedMenus(prev => {
        const merged = new Set(prev)
        newExpanded.forEach(name => merged.add(name))
        return merged
      })
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - справа */}
      <aside
        className={`fixed inset-y-0 right-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Меню</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {adminNavigation.map((item) => {
              const Icon = item.icon
              const hasSubmenu = !!item.submenu
              const isSubmenuExpanded = expandedMenus.has(item.name)
              const isSubmenuItemActive = hasSubmenu && isSubmenuActive(item.submenu)
              
              // Определяем активный пункт меню: проверяем пути от самого длинного к самому короткому
              // Сортируем навигацию по длине пути (от длинного к короткому)
              const sortedNav = [...adminNavigation].sort((a, b) => b.href.length - a.href.length)
              
              // Находим первый подходящий путь (самый длинный, который подходит)
              const activeItem = sortedNav.find(nav => {
                // Точное совпадение
                if (location.pathname === nav.href) return true
                // Для /admin проверяем только точное совпадение или /admin/
                if (nav.href === '/admin') {
                  return location.pathname === '/admin' || location.pathname === '/admin/'
                }
                // Для остальных путей проверяем, начинается ли текущий путь с nav.href + '/'
                if (location.pathname.startsWith(nav.href + '/')) return true
                return false
              })
              
              const isActive = activeItem?.href === item.href || isSubmenuItemActive
              
              return (
                <div key={item.name}>
                  {hasSubmenu ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </div>
                        <span className={`transform transition-transform ${isSubmenuExpanded ? 'rotate-90' : ''}`}>
                          ›
                        </span>
                      </button>
                      {isSubmenuExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.submenu?.map((subItem) => {
                            const SubIcon = subItem.icon
                            const isSubActive = location.pathname === subItem.href || location.pathname.startsWith(subItem.href + '/')
                            return (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                                  isSubActive
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <SubIcon className="h-4 w-4" />
                                <span>{subItem.name}</span>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User info */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-2">
            <Link
              to="/search"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200"
            >
              <Store className="h-4 w-4" />
              <span>Клиентская часть</span>
            </Link>
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || 'Администратор'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Выход</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pr-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="text-xl font-bold text-primary-600">
                ZAKUP.ONE
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/search"
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Перейти в клиентскую часть"
              >
                <Store className="h-5 w-5" />
                <span className="hidden sm:inline">Клиентская часть</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

