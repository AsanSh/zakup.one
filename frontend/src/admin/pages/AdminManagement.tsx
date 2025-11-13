import { Link } from 'react-router-dom'
import { Calendar, DollarSign, Tag } from 'lucide-react'

export default function AdminManagement() {
  const sections = [
    {
      title: 'Обновление прайс-листов',
      description: 'Загрузка и обновление прайс-листов поставщиков',
      href: '/admin/management/price-lists',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Управление ценами',
      description: 'Массовое изменение цен на товары',
      href: '/admin/management/prices',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Управление товарами',
      description: 'Акции, скидки и промо-акции для товаров',
      href: '/admin/management/products',
      icon: Tag,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Управление</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              to={section.href}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className={`${section.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-gray-600">{section.description}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

