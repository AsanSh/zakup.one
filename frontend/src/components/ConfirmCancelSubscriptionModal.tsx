import React from 'react'

interface ConfirmCancelSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onSwitchToPlan?: (planId: number) => void
  currentPlanType?: 'BASIC' | 'STANDARD' | 'VIP'
  availablePlans?: Array<{
    id: number
    plan_type: 'BASIC' | 'STANDARD' | 'VIP'
    name: string
    price: string
  }>
}

export default function ConfirmCancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  onSwitchToPlan,
  currentPlanType,
  availablePlans = []
}: ConfirmCancelSubscriptionModalProps) {
  if (!isOpen) return null

  // Фильтруем доступные планы (исключаем текущий)
  const alternativePlans = availablePlans.filter(
    plan => plan.plan_type !== currentPlanType
  )

  // Предлагаем VIP или Basic (приоритет VIP, если есть)
  const suggestedPlan = alternativePlans.find(p => p.plan_type === 'VIP') || 
                         alternativePlans.find(p => p.plan_type === 'BASIC') ||
                         alternativePlans[0]

  const getPlanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'BASIC': 'Базовый',
      'STANDARD': 'Стандарт',
      'VIP': 'VIP'
    }
    return labels[type] || type
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="rounded-full p-3 bg-orange-100 text-orange-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
          Отменить подписку?
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 text-center mb-6">
          Вы уверены, что хотите отменить подписку? После отмены вы потеряете доступ к функциям вашего тарифа.
        </p>

        {/* Alternative Plan Suggestion */}
        {suggestedPlan && onSwitchToPlan && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-gray-900 mb-2">
              Вместо отмены, вы можете перейти на тариф "{getPlanTypeLabel(suggestedPlan.plan_type)}"
            </p>
            <p className="text-xs text-gray-600 mb-3">
              Стоимость: {parseFloat(suggestedPlan.price).toLocaleString('ru-RU')} сом/месяц
            </p>
            <button
              onClick={() => {
                onSwitchToPlan(suggestedPlan.id)
                onClose()
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Перейти на {getPlanTypeLabel(suggestedPlan.plan_type)}
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Да, отменить
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

