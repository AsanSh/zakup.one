import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'
import ModernModal from '../components/ModernModal'
import { useUserStore } from '../store/userStore'

interface ChatMessage {
  id: number
  sender: number
  sender_name: string
  sender_role: string
  message: string
  created_at: string
  is_read: boolean
}

interface ChatThread {
  id: number
  user: number
  admin: number | null
  admin_name: string | null
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  created_at: string
}

export default function ChatPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [thread, setThread] = useState<ChatThread | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  useEffect(() => {
    loadThread()
  }, [])

  useEffect(() => {
    if (thread) {
      loadMessages()
      // Polling для новых сообщений каждые 3 секунды
      const interval = setInterval(() => {
        loadMessages()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [thread])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadThread = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/auth/chat/thread/')
      const threadData = response.data.results?.[0] || response.data
      if (threadData) {
        setThread(threadData)
      } else {
        // Создаем новый тред, если его нет
        const createResponse = await apiClient.post('/api/auth/chat/thread/', {})
        setThread(createResponse.data)
      }
    } catch (error: any) {
      console.error('Ошибка загрузки треда:', error)
      // Если тред не найден, создаем новый
      try {
        const createResponse = await apiClient.post('/api/auth/chat/thread/', {})
        setThread(createResponse.data)
      } catch (createError: any) {
        let errorMessage = 'Не удалось загрузить чат'
        if (createError.response?.data?.detail) {
          errorMessage = createError.response.data.detail
        }
        setModal({
          isOpen: true,
          title: 'Ошибка',
          message: errorMessage,
          type: 'error'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!thread) return
    
    try {
      const response = await apiClient.get(`/api/auth/chat/thread/${thread.id}/messages/`)
      const messagesData = response.data.results || response.data || []
      setMessages(Array.isArray(messagesData) ? messagesData : [])
    } catch (error: any) {
      console.error('Ошибка загрузки сообщений:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !thread || sending) return

    try {
      setSending(true)
      const response = await apiClient.post(`/api/auth/chat/thread/${thread.id}/messages/`, {
        message: newMessage.trim()
      })
      
      setMessages(prev => [...prev, response.data])
      setNewMessage('')
      
      // Обновляем тред
      await loadThread()
    } catch (error: any) {
      console.error('Ошибка отправки сообщения:', error)
      let errorMessage = 'Не удалось отправить сообщение'
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      }
      setModal({
        isOpen: true,
        title: 'Ошибка',
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'только что'
    if (minutes < 60) return `${minutes} мин назад`
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ч назад`
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <div className="text-gray-500">Загрузка чата...</div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/customer')}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Назад</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Чат с сотрудником</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              {thread?.admin_name ? `Чат с ${thread.admin_name}` : 'Ожидание ответа администратора'}
            </p>
          </div>

          {/* Chat Messages */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4" style={{ height: '500px' }}>
            <div className="h-full flex flex-col">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>Начните общение, отправив первое сообщение</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender === user?.id
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          <div className={`rounded-lg px-4 py-2 ${
                            isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            <p className={`text-xs mt-1 ${
                              isOwn ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                          {!isOwn && (
                            <p className="text-xs text-gray-500 mt-1 ml-1">
                              {msg.sender_name}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Отправка...' : 'Отправить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ModernModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </>
  )
}

