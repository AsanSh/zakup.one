/**
 * Общие типы для всего приложения
 */

// Пользователь
export interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  company: string
  is_verified: boolean
  is_admin: boolean
  is_active?: boolean
  created_at?: string
}

// Товар
export interface Product {
  id: number
  name: string
  article?: string
  unit?: string
  purchase_price?: number  // Закупочная цена из прайс-листа
  markup?: number  // Надбавка в сомах
  price: number  // Продажная цена (purchase_price + markup)
  category?: string
  country?: string
  is_active?: boolean
  supplier_id?: number
  supplier_name?: string
}

// Поставщик
export interface Supplier {
  id: number
  name: string
  contact_email?: string
  contact_phone?: string
  is_active: boolean
  created_at?: string
  default_header_row?: number  // Строка заголовка по умолчанию
  default_start_row?: number  // Строка начала данных по умолчанию
}

// Статусы заявки
export enum OrderStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  COLLECTED = 'collected',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// Статусы доставки
export enum DeliveryStatus {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Заявка
export interface Order {
  id: number
  user_id: number
  status: OrderStatus | string
  delivery_address: string
  delivery_comment?: string
  delivery_date?: string
  estimated_delivery_date?: string
  tracking_number?: string
  contact_person?: string
  contact_phone?: string
  created_at: string
  updated_at?: string
  items_count?: number
  user_email?: string
  user_name?: string
}

// Позиция в заявке
export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  product?: Product
}

// Отслеживание доставки
export interface DeliveryTracking {
  order_id: number
  status: DeliveryStatus | string
  tracking_number?: string
  carrier?: string
  current_location?: string
  destination?: string
  estimated_delivery_date?: string
  shipped_at?: string
  delivered_at?: string
  events: DeliveryEvent[]
}

// Событие доставки
export interface DeliveryEvent {
  id: number
  status: DeliveryStatus | string
  location?: string
  description?: string
  occurred_at: string
}

// Элемент корзины
export interface CartItem {
  product_id: number
  name: string
  unit: string
  price: number
  quantity: number  // Обязательное поле, всегда >= 1
}

// API Response типы
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

// Форма создания заявки
export interface OrderCreateData {
  items: Array<{ product_id: number; quantity: number }>
  delivery_address: string
  delivery_comment?: string
  delivery_date?: string
  contact_person?: string
  contact_phone?: string
}

// Обновление товара
export interface ProductUpdateData {
  price?: number
  markup?: number  // Надбавка в сомах
  is_active?: boolean
  category?: string
  country?: string
}

// Массовое обновление цен
export interface BulkPriceUpdateData {
  type: 'percent' | 'fixed'
  value: number
  category?: string
  supplier_id?: number
}

// Создание поставщика
export interface SupplierCreateData {
  name: string
  contact_email?: string
  contact_phone?: string
}

// Обновление статуса заявки
export interface OrderStatusUpdateData {
  status: OrderStatus | string
  tracking_number?: string
  estimated_delivery_date?: string
}

