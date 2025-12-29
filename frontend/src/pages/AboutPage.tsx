import Navbar from '../components/Navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8 pt-20">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Заголовок */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              О компании Zakup.one
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              Zakup.one — это цифровая платформа для оптовых и розничных закупок строительных материалов, 
              сантехники, инженерных систем, инструментов и товаров для строительства. Мы объединяем 
              поставщиков, строительные компании, магазины и частных клиентов в единую экосистему для 
              быстрых, прозрачных и выгодных закупок. На нашей платформе вы легко найдете нужные товары, 
              сравните цены, оформите заказ и получите доставку по всему Кыргызстану.
            </p>
          </div>

          {/* Что делает Zakup.one */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Что делает Zakup.one
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Единая база строительных материалов
                  </h3>
                  <p className="text-gray-700">
                    Актуальные товары, характеристики, наличие и цены от проверенных поставщиков.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Удобная система заказов
                  </h3>
                  <p className="text-gray-700">
                    Заказ в один клик, история заказов, быстрое повторение заказа, корзина покупок.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Оптовые и розничные цены
                  </h3>
                  <p className="text-gray-700">
                    Выгодные предложения для строительных организаций, розничных точек и частных покупателей.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Логистика и доставка
                  </h3>
                  <p className="text-gray-700">
                    Партнерские службы доставки обеспечивают быстрое и своевременное получение товаров.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Поддержка пользователей
                  </h3>
                  <p className="text-gray-700">
                    Консультанты помогают с подбором материалов, расчетами и оформлением заказа.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Основные категории товаров */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Основные категории товаров
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">•</span>
                <span>Строительные материалы (цемент, штукатурка, смеси, кирпич, блоки)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">•</span>
                <span>Сантехника (трубы, фитинги, смесители, комплектующие)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">•</span>
                <span>Отопление и вентиляция (котлы, радиаторы, элементы монтажа)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">•</span>
                <span>Инженерные системы и комплектующие</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">•</span>
                <span>Инструменты и расходные материалы</span>
              </li>
            </ul>
          </div>

          {/* Преимущества */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Преимущества Zakup.one
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Прозрачные цены
                  </h3>
                  <p className="text-gray-700">
                    Платформа показывает реальную стоимость товаров без скрытых условий.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Широкий ассортимент
                  </h3>
                  <p className="text-gray-700">
                    Каталог наполнен сертифицированными товарами от надежных поставщиков.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Быстрая доставка по всем регионам
                  </h3>
                  <p className="text-gray-700">
                    Система позволяет отслеживать статус заказа и получать товары вовремя.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Цифровые инструменты
                  </h3>
                  <p className="text-gray-700">
                    Мобильное приложение, онлайн-оплата, уведомления, история покупок.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Поддержка оптовиков и строителей
                  </h3>
                  <p className="text-gray-700">
                    Персональные менеджеры, специальные цены, работа с большими объемами.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Миссия */}
          <div className="bg-indigo-50 rounded-lg p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Миссия Zakup.one
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Сделать рынок строительных материалов в Кыргызстане современным, цифровым и удобным. 
              Мы помогаем строить быстрее, заказывать проще и экономить время и бюджет.
            </p>
          </div>

          {/* Контакты */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Контакты
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@zakup.one" className="text-lg text-indigo-600 hover:text-indigo-800">
                  support@zakup.one
                </a>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+996999569669" className="text-lg text-indigo-600 hover:text-indigo-800">
                  0999 569 669
                </a>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <a href="https://www.zakup.one" target="_blank" rel="noopener noreferrer" className="text-lg text-indigo-600 hover:text-indigo-800">
                  www.zakup.one
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

