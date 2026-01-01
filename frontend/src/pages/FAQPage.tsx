import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

interface FAQItem {
  question: string
  answer: string
}

export default function FAQPage() {
  const navigate = useNavigate()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: 'Как оплатить заявку?',
      answer: 'После создания заявки вы получите счет на оплату. Оплата производится банковским переводом по реквизитам, указанным в счете.'
    },
    {
      question: 'Сколько времени занимает доставка?',
      answer: 'Срок доставки зависит от наличия товаров на складе и вашего местоположения. Обычно доставка занимает от 1 до 5 рабочих дней.'
    },
    {
      question: 'Можно ли отменить заявку?',
      answer: 'Заявку можно отменить до момента оплаты. После оплаты отмена возможна только через обращение в поддержку.'
    },
    {
      question: 'Как работает трекинг доставки?',
      answer: 'Трекинг доставки доступен для тарифов Стандарт и VIP после оплаты заявки. Вы сможете отслеживать статус доставки в реальном времени.'
    },
    {
      question: 'Как изменить тариф подписки?',
      answer: 'Вы можете изменить тариф в любое время в разделе "Подписка". При переходе на более высокий тариф разница доплачивается, при переходе на более низкий - остаток не возвращается.'
    },
    {
      question: 'Что делать, если товар не соответствует описанию?',
      answer: 'Свяжитесь с нами через чат с сотрудником или напишите на email поддержки. Мы рассмотрим вашу претензию в течение 24 часов.'
    }
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/profile')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Назад к профилю</span>
          </button>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Часто задаваемые вопросы</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Ответы на популярные вопросы о работе платформы
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-lg"
                >
                  <span className="text-base font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}


