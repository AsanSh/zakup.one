import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function InstructionsPage() {
  const navigate = useNavigate()

  const instructions = [
    {
      title: 'Как создать заявку',
      content: 'Вы можете создать заявку тремя способами: классический (выбор товаров из каталога), текстовый (описание товаров текстом) или загрузка файла/фото с товарами.'
    },
    {
      title: 'Как отследить заявку',
      content: 'Перейдите в раздел "Мои заявки" и нажмите на номер заявки. Для тарифов Стандарт и VIP доступен трекинг доставки после оплаты заявки.'
    },
    {
      title: 'Как оформить подписку',
      content: 'Перейдите в раздел "Подписка" и выберите подходящий тариф. После оплаты подписка активируется автоматически.'
    },
    {
      title: 'Как добавить компанию',
      content: 'В разделе "Профиль" нажмите "Добавить" в секции "Мои компании". Заполните реквизиты компании для автоматической генерации счетов.'
    },
    {
      title: 'Как пригласить сотрудника',
      content: 'В разделе "Профиль" выберите "Добавить пользователя" и введите email сотрудника. Он получит приглашение на указанный email.'
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Инструкции</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Руководство по использованию платформы ZAKUP.ONE
            </p>
          </div>

          <div className="space-y-4">
            {instructions.map((instruction, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{instruction.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{instruction.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}


