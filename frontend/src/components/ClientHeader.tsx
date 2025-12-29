import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import CreateOrderModal from './CreateOrderModal'

interface ClientHeaderProps {
  activeTab?: 'home' | 'products' | 'cart' | 'orders'
}

export default function ClientHeader({ activeTab = 'home' }: ClientHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useUserStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [orderModalOpen, setOrderModalOpen] = useState(false)

  // Определяем мобильное устройство
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

  const handleLogout = () => {
    logout()
    navigate('/login')
    setProfileModalOpen(false)
  }


  return (
    <>
      {/* Верхняя полоса с контактами */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 text-white text-xs py-2 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@zakup.one</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+996 (XXX) XXX-XXX</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span>Подписывайтесь:</span>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-.896 3.305-2.185 4.343-1.289 1.037-2.988 1.56-5.096 1.56-.373 0-.763-.023-1.17-.068-.407-.045-.78-.112-1.12-.2-.34-.09-.627-.19-.86-.3-.234-.112-.39-.22-.468-.326-.078-.105-.117-.22-.117-.344 0-.166.062-.345.186-.537.124-.192.3-.39.528-.593.228-.203.49-.4.786-.59.296-.19.61-.365.942-.525.332-.16.67-.3 1.014-.42.344-.12.68-.22 1.008-.3.328-.08.63-.14.906-.18.276-.04.51-.06.702-.06.373 0 .72.04 1.04.12.32.08.61.2.87.36.26.16.48.35.66.57.18.22.32.47.42.75.1.28.15.58.15.9 0 .45-.08.88-.24 1.29-.16.41-.4.78-.72 1.11-.32.33-.72.6-1.2.81-.48.21-1.04.32-1.68.32-.48 0-.94-.06-1.38-.18-.44-.12-.84-.3-1.2-.54-.36-.24-.66-.54-.9-.9-.24-.36-.42-.78-.54-1.26-.12-.48-.18-1-.18-1.56 0-1.12.24-2.1.72-2.94.48-.84 1.14-1.5 1.98-1.98.84-.48 1.82-.72 2.94-.72.48 0 .94.06 1.38.18.44.12.84.3 1.2.54.36.24.66.54.9.9.24.36.42.78.54 1.26.12.48.18 1 .18 1.56z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Основная навигация */}
      <header className="bg-white border-b border-gray-200 fixed top-8 left-0 right-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Логотип */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-indigo-600">ZAKUP.ONE</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Закупки • Поставщики • Заявки</p>
              </div>
            </div>

            {/* Навигация */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => navigate('/customer')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  currentActiveTab === 'home'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Главная
              </button>
              <button
                onClick={() => navigate('/customer/products')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  currentActiveTab === 'products'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Товары
              </button>
              <button
                onClick={() => navigate('/cart')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  currentActiveTab === 'cart'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Корзина
              </button>
              <button
                onClick={() => navigate('/orders')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  currentActiveTab === 'orders'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Мои заявки
              </button>
            </nav>

            {/* Правая часть: профиль, кнопка */}
            <div className="flex items-center gap-3">
              {/* Профиль */}
              <button
                onClick={() => setProfileModalOpen(true)}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Кнопка "Собрать заказ" */}
              <button
                onClick={() => setOrderModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 font-medium text-sm transition-all shadow-sm"
              >
                Собрать заказ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Модальное окно профиля */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setProfileModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {user ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Профиль</h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Имя</p>
                    <p className="text-lg font-medium text-gray-900">{user.full_name || 'Не указано'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Вход в систему</h3>
                <p className="text-gray-600 mb-6">Войдите в систему или зарегистрируйтесь для доступа к полному функционалу.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setProfileModalOpen(false)
                      navigate('/login')
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Войти
                  </button>
                  <button
                    onClick={() => {
                      setProfileModalOpen(false)
                      navigate('/register')
                    }}
                    className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    Регистрация
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно "Собрать заказ" */}
      <CreateOrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onFileUpload={(file) => {
          console.log('File selected:', file)
          // Здесь будет обработка файла
        }}
        onTextInput={() => {
          // Обработка текста будет в компоненте
        }}
        onPhotoCapture={(file) => {
          console.log('Image selected:', file)
          // Здесь будет обработка изображения
        }}
      />

      {/* Нижнее меню для мобильных устройств */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white z-50 shadow-lg lg:hidden safe-area-inset-bottom">
          <div className="flex items-center justify-around h-16 px-2">
            <button
              onClick={() => navigate('/customer')}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 ${
                currentActiveTab === 'home'
                  ? 'bg-white/20'
                  : ''
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Главная</span>
            </button>
            
            <button
              onClick={() => navigate('/customer/products')}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 ${
                currentActiveTab === 'products'
                  ? 'bg-white/20'
                  : ''
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-xs font-medium">Товары</span>
            </button>
            
            <button
              onClick={() => navigate('/cart')}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 ${
                currentActiveTab === 'cart'
                  ? 'bg-white/20'
                  : ''
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs font-medium">Корзина</span>
            </button>
            
            <button
              onClick={() => navigate('/orders')}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 ${
                currentActiveTab === 'orders'
                  ? 'bg-white/20'
                  : ''
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-medium">Заявки</span>
            </button>
            
            <button
              onClick={() => setProfileModalOpen(true)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 ${
                profileModalOpen
                  ? 'bg-white/20'
                  : ''
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Профиль</span>
            </button>
          </div>
        </nav>
      )}
    </>
  )
}
