/**
 * Константы приложения
 */
export const ORDER_STATUS_LABELS = {
    new: 'Новая',
    in_progress: 'В обработке',
    collected: 'Собрана',
    shipped: 'Отправлена',
    in_transit: 'В пути',
    delivered: 'Доставлена',
    cancelled: 'Отменена',
};
export const ORDER_STATUS_COLORS = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    collected: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};
export const DELIVERY_STATUS_LABELS = {
    pending: 'Ожидает',
    shipped: 'Отправлено',
    in_transit: 'В пути',
    out_for_delivery: 'Доставляется',
    delivered: 'Доставлено',
    failed: 'Не удалось',
    cancelled: 'Отменено',
};
export const PRICE_UPDATE_FREQUENCY_LABELS = {
    daily: 'Ежедневно',
    weekly: 'Еженедельно',
    monthly: 'Ежемесячно',
};
export const ACCESS_LEVEL_LABELS = {
    full: 'Полный доступ',
    limited: 'Ограниченный доступ',
    restricted: 'Ограничен',
};
export const ACCESS_LEVEL_COLORS = {
    full: 'bg-green-100 text-green-800',
    limited: 'bg-yellow-100 text-yellow-800',
    restricted: 'bg-red-100 text-red-800',
};
