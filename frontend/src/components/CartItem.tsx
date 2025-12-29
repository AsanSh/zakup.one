import { useCartStore, CartItem as CartItemType } from '../store/cartStore'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()
  const totalPrice = item.price * item.quantity

  return (
    <div className="flex items-start gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      {/* Фото товара */}
      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>

      {/* Информация о товаре */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
          {item.name}
        </h3>
        {item.article && (
          <p className="text-sm text-gray-500 mb-2">Артикул: {item.article}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            Цена за единицу: <span className="font-medium text-gray-900">
              {Number(item.price).toLocaleString('ru-RU')} сом
            </span>
          </span>
          {item.unit && (
            <span className="text-gray-500">/ {item.unit}</span>
          )}
        </div>
      </div>

      {/* Управление количеством */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {/* Кнопки +/- */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={item.quantity <= 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="w-12 text-center text-sm font-medium text-gray-900">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Итоговая сумма по позиции */}
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {totalPrice.toLocaleString('ru-RU')} сом
          </div>
          <div className="text-xs text-gray-500">
            {Number(item.price).toLocaleString('ru-RU')} × {item.quantity}
          </div>
        </div>

        {/* Кнопка удаления */}
        <button
          onClick={() => removeItem(item.product_id)}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          title="Удалить товар"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
