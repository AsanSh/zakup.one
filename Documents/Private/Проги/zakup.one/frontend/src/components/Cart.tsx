export default function Cart() {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Корзина</h2>
      <div className="space-y-4">
        <p className="text-sm sm:text-base text-gray-500 text-center py-8">
          Корзина пуста
        </p>
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm sm:text-base font-medium text-gray-900">Итого:</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900">0 ₽</span>
          </div>
          <button
            disabled
            className="w-full py-2 sm:py-3 px-4 bg-gray-300 text-gray-500 rounded-md font-medium text-sm sm:text-base cursor-not-allowed"
          >
            Оформить заявку
          </button>
        </div>
      </div>
    </div>
  )
}


