import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import apiClient from '../api/client'
import SuppliersManager from '../components/admin/SuppliersManager'
import ProductsManager from '../components/admin/ProductsManager'
import OrdersManager from '../components/admin/OrdersManager'
import ClientsManager from '../components/admin/ClientsManager'

type TabType = 'products' | 'orders' | 'suppliers' | 'clients'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useUserStore()
  const [activeTab, setActiveTab] = useState<TabType>('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const tabs = [
    { id: 'products' as TabType, label: 'Товары' },
    { id: 'orders' as TabType, label: 'Заявки' },
    { id: 'suppliers' as TabType, label: 'Поставщики' },
    { id: 'clients' as TabType, label: 'Клиенты' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsManager />
      case 'orders':
        return <OrdersManager />
      case 'suppliers':
        return <SuppliersManager />
      case 'clients':
        return <ClientsManager />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and title */}
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">ZAKUP.ONE</h1>
            </div>

            {/* Right side - Search, Notifications, Profile */}
            <div className="flex items-center gap-4">
              {/* Search Icon */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Поиск"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Notifications Bell */}
              <button
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                title="Уведомления"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification badge */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user?.full_name || user?.email || 'Администратор'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 text-gray-600 hover:text-gray-900"
                  title="Выйти"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title and Subtitle */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Административная панель</h2>
          <p className="text-gray-600">Управление товарами, заявками, поставщиками и клиентами</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="inline-flex rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm font-semibold'
                      : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  } ${
                    index > 0 ? 'border-l border-gray-200' : ''
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Search Bar (if showSearch is true) */}
        {showSearch && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введите запрос для поиска..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => setShowSearch(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
