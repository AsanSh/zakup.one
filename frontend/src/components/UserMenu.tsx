import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'

interface UserMenuProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement>
}

export default function UserMenu({ isOpen, onClose, triggerRef }: UserMenuProps) {
  const navigate = useNavigate()
  const { user, logout } = useUserStore()
  const menuRef = useRef<HTMLDivElement>(null)

  // Функция для расчета позиции меню
  const calculatePosition = useCallback(() => {
    if (!isOpen || !menuRef.current || !triggerRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const menuRect = menuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const isMobile = viewportWidth < 1024

    // Проверяем, виден ли триггер
    const isTriggerVisible = 
      triggerRect.top >= 0 &&
      triggerRect.left >= 0 &&
      triggerRect.bottom <= viewportHeight &&
      triggerRect.right <= viewportWidth

    // Если триггер не виден, закрываем меню
    if (!isTriggerVisible) {
      onClose()
      return
    }

    // Позиционируем относительно триггера
    let top = triggerRect.bottom + 8
    let right = viewportWidth - triggerRect.right

    // На мобильных устройствах центрируем меню
    if (isMobile) {
      // Центрируем по горизонтали
      const centerX = viewportWidth / 2
      right = centerX - menuRect.width / 2
      
      // Ограничиваем отступами от краев
      if (right < 16) right = 16
      if (right + menuRect.width > viewportWidth - 16) {
        right = viewportWidth - menuRect.width - 16
      }
    } else {
      // На десктопе позиционируем справа
      // Проверяем, не выходит ли меню за правый край
      if (right < menuRect.width) {
        right = 8 // Отступ от правого края
      }
    }

    // Проверяем, не выходит ли меню за нижний край
    if (top + menuRect.height > viewportHeight - 16) {
      top = triggerRect.top - menuRect.height - 8 // Показываем сверху
      // Если и сверху не влезает, показываем снизу с отступом
      if (top < 16) {
        top = viewportHeight - menuRect.height - 16
      }
    }

    // Убеждаемся, что меню не выходит за границы экрана
    if (top < 0) top = 8
    if (right < 0) right = 8
    if (top + menuRect.height > viewportHeight) {
      top = viewportHeight - menuRect.height - 8
    }
    if (right + menuRect.width > viewportWidth) {
      right = viewportWidth - menuRect.width - 8
    }

    menuRef.current.style.top = `${Math.max(0, top)}px`
    menuRef.current.style.right = `${Math.max(0, right)}px`
  }, [isOpen, triggerRef, onClose])

  // Закрытие при клике вне меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose, triggerRef])

  // Позиционирование меню относительно триггера
  useEffect(() => {
    if (isOpen) {
      // Небольшая задержка для правильного расчета размеров после рендера
      const timeoutId = setTimeout(() => {
        calculatePosition()
      }, 10)

      return () => clearTimeout(timeoutId)
    }
  }, [isOpen, calculatePosition])

  // Обработчик изменения размера окна
  useEffect(() => {
    if (!isOpen) return

    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      // Debounce для оптимизации
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        calculatePosition()
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
      clearTimeout(resizeTimeout)
    }
  }, [isOpen, calculatePosition])

  const handleLogout = () => {
    logout()
    navigate('/login')
    onClose()
  }

  const handleMenuItemClick = (path: string) => {
    navigate(path)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 lg:bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-100 min-w-[240px] max-w-[320px] w-[calc(100vw-32px)] lg:w-auto animate-menu-appear"
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        {user ? (
          <>
            {/* User Info Card */}
            <div 
              className="border-b border-gray-100 rounded-t-xl"
              style={{
                padding: '16px 20px',
              }}
            >
              <p className="text-sm font-semibold text-gray-900 break-words">
                {user.full_name || 'Пользователь'}
              </p>
              {user.role && (
                <p className="text-xs text-gray-500 mt-0.5 break-words">
                  {user.role === 'ADMIN' ? 'Администратор' : 'Клиент'}
                </p>
              )}
              <p className="text-xs mt-1 break-words" style={{ color: '#666' }}>
                {user.email}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {/* Профиль */}
              <button
                onClick={() => handleMenuItemClick('/profile')}
                className="w-full text-left text-sm text-gray-700 hover:bg-[#f7f7f7] transition-all duration-200 hover:scale-[1.02] flex items-center gap-3 group px-5 py-2.5"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Профиль</span>
              </button>

              {/* Уведомления */}
              <button
                onClick={() => handleMenuItemClick('/profile/notifications')}
                className="w-full text-left text-sm text-gray-700 hover:bg-[#f7f7f7] transition-all duration-200 hover:scale-[1.02] flex items-center gap-3 group px-5 py-2.5"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span>Уведомления</span>
              </button>

              {/* Подписка */}
              <button
                onClick={() => handleMenuItemClick('/subscription')}
                className="w-full text-left text-sm text-gray-700 hover:bg-[#f7f7f7] transition-all duration-200 hover:scale-[1.02] flex items-center gap-3 group px-5 py-2.5"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Подписка</span>
              </button>

              {/* Инструкции */}
              <button
                onClick={() => handleMenuItemClick('/profile/instructions')}
                className="w-full text-left text-sm text-gray-700 hover:bg-[#f7f7f7] transition-all duration-200 hover:scale-[1.02] flex items-center gap-3 group px-5 py-2.5"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Инструкции</span>
              </button>

              {/* FAQ */}
              <button
                onClick={() => handleMenuItemClick('/profile/faq')}
                className="w-full text-left text-sm text-gray-700 hover:bg-[#f7f7f7] transition-all duration-200 hover:scale-[1.02] flex items-center gap-3 group px-5 py-2.5"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>FAQ</span>
              </button>

              {/* Добавить пользователя */}
              <button
                onClick={() => {
                  onClose()
                  navigate('/profile')
                  // Откроем модалку приглашения через небольшую задержку
                  setTimeout(() => {
                    const event = new CustomEvent('openInviteModal')
                    window.dispatchEvent(event)
                  }, 100)
                }}
                className="w-full text-left text-sm text-gray-700 hover:bg-[#f7f7f7] transition-all duration-200 hover:scale-[1.02] flex items-center gap-3 group px-5 py-2.5"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span>Добавить пользователя</span>
              </button>

              {/* Разделитель */}
              <div className="border-t border-gray-100 my-1"></div>

              {/* Выход */}
              <button
                onClick={handleLogout}
                className="w-full text-left text-sm font-medium text-[#d32f2f] hover:bg-[#ffebee] transition-all duration-200 hover:scale-[1.02] flex items-center gap-3 group px-5 py-2.5 rounded-b-xl"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Выход</span>
              </button>
            </div>
          </>
        ) : (
          <div 
            style={{
              padding: '16px 20px',
            }}
          >
            <button
              onClick={() => {
                onClose()
                navigate('/login')
              }}
              className="w-full px-4 py-2.5 bg-[#5A46F6] text-white rounded-lg hover:bg-[#4A3CE6] transition-all duration-200 hover:scale-[1.02] text-sm font-medium mb-2"
            >
              Войти
            </button>
            <button
              onClick={() => {
                onClose()
                navigate('/register')
              }}
              className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-[#f7f7f7] transition-all duration-200 hover:scale-[1.02] text-sm font-medium"
            >
              Регистрация
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes menu-appear {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-menu-appear {
          animation: menu-appear 0.15s ease-out forwards;
        }
      `}</style>
    </>
  )
}
