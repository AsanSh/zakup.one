import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import CreateOrderModal from './CreateOrderModal'
import UserMenu from './UserMenu'

interface NavbarProps {
  activeTab?: 'home' | 'products' | 'cart' | 'orders'
}

export default function Navbar({ activeTab = 'home' }: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUserStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const mobileProfileButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/customer' || path === '/customer/') return 'home'
    if (path === '/customer/products') return 'products'
    if (path === '/cart') return 'cart'
    if (path === '/orders') return 'orders'
    return activeTab
  }

  const currentActiveTab = getActiveTab()

  const navItems = [
    { id: 'home', label: 'Главная', path: '/customer', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { id: 'products', label: 'Товары', path: '/customer/products', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )},
    { id: 'cart', label: 'Корзина', path: '/cart', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { id: 'orders', label: 'Мои заявки', path: '/orders', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#EAECF0] h-[72px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left: Logo & Brand */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-[#5A46F6] to-[#7F4CFA] rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-md"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight leading-tight">
                  ZAKUP.ONE
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-tight">
                  Закупки • Поставщики • Заявки
                </p>
              </div>
              {/* Mobile logo text */}
              <div className="sm:hidden">
                <h1 className="text-base font-semibold text-gray-900 tracking-tight">
                  ZAKUP.ONE
                </h1>
              </div>
            </div>

            {/* Center: Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center gap-7 xl:gap-10 flex-1 justify-center">
              {navItems.map((item) => {
                const isActive = currentActiveTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path)
                      setMobileMenuOpen(false)
                    }}
                    className={`relative px-4 py-2 text-base font-medium transition-all duration-200 hover:scale-[1.02] ${
                      isActive
                        ? 'text-[#5A46F6]'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={`relative z-10 ${isActive ? 'font-semibold' : ''}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="absolute inset-0 bg-[#EEF2FF] rounded-lg -z-0"></span>
                    )}
                    <span className="absolute inset-0 rounded-lg hover:bg-gray-50 -z-0 transition-colors duration-200 opacity-0 hover:opacity-100"></span>
                  </button>
                )
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              {/* Notifications Button */}
              <button
                onClick={() => {
                  // TODO: Открыть меню уведомлений
                  console.log('Notifications clicked')
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
                aria-label="Уведомления"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {/* Badge для непрочитанных уведомлений */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Profile Icon */}
              <button
                ref={profileButtonRef}
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
                aria-label="Профиль"
                aria-expanded={profileMenuOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* CTA Button */}
              <button
                onClick={() => setOrderModalOpen(true)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#5A46F6] to-[#7F4CFA] text-white text-sm sm:text-base font-medium rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap"
                style={{
                  background: 'linear-gradient(90deg, #5A46F6 0%, #7F4CFA 100%)',
                }}
              >
                Собрать заказ
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Меню"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isMobile && (
          <div className="lg:hidden border-t border-[#EAECF0] bg-white">
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = currentActiveTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#EEF2FF] text-[#5A46F6]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`${isActive ? 'text-[#5A46F6]' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </button>
                )
              })}
              <button
                onClick={() => {
                  setOrderModalOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-[#5A46F6] to-[#7F4CFA] text-white text-base font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                style={{
                  background: 'linear-gradient(90deg, #5A46F6 0%, #7F4CFA 100%)',
                }}
              >
                Собрать заказ
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Profile Dropdown */}
      <UserMenu
        isOpen={profileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
        triggerRef={
          isMobile && mobileProfileButtonRef.current
            ? mobileProfileButtonRef
            : profileButtonRef
        }
      />

      {/* Order Modal */}
      <CreateOrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onFileUpload={(file) => {
          console.log('File selected:', file)
        }}
        onTextInput={() => {}}
        onPhotoCapture={(file) => {
          console.log('Image selected:', file)
        }}
      />

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EAECF0] z-50 lg:hidden safe-area-inset-bottom">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const isActive = currentActiveTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 flex-1 ${
                    isActive
                      ? 'text-[#5A46F6]'
                      : 'text-gray-600'
                  }`}
                >
                  <div className={`${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
                    {item.icon}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {item.label.split(' ')[0]}
                  </span>
                </button>
              )
            })}
            <button
              ref={mobileProfileButtonRef}
              onClick={() => setProfileMenuOpen(true)}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 flex-1 ${
                profileMenuOpen ? 'text-[#5A46F6]' : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[10px] font-medium">Профиль</span>
            </button>
          </div>
        </nav>
      )}

    </>
  )
}
