/**
 * Компонент карточки статистики для Dashboard
 */
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary-600',
  trend,
  onClick,
}: StatsCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-1 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}% за период
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gray-100 ${iconColor}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}

