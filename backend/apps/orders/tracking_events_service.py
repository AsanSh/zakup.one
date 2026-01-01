"""
Сервис для обработки событий трекинга доставки из Telegram-бота
"""
from django.utils import timezone
from apps.orders.models import DeliveryTracking, Order
from apps.users.models import User


class TrackingEventsService:
    """Сервис для обработки событий трекинга"""
    
    @staticmethod
    def handle_driver_assigned(order_id: int, driver_name: str, driver_phone: str = None, vehicle_number: str = None):
        """
        Обработка события: водитель назначен на заказ
        """
        try:
            order = Order.objects.get(id=order_id)
            tracking, created = DeliveryTracking.objects.get_or_create(
                order=order,
                defaults={
                    'status': 'DRIVER_ASSIGNED',
                    'items_count': order.items.count()
                }
            )
            
            tracking.status = 'DRIVER_ASSIGNED'
            tracking.driver_name = driver_name
            if driver_phone:
                tracking.driver_phone = driver_phone
            if vehicle_number:
                tracking.vehicle_number = vehicle_number
            
            tracking.update_status(
                'DRIVER_ASSIGNED',
                driver_name=driver_name
            )
            
            return tracking
        except Order.DoesNotExist:
            raise ValueError(f"Заказ {order_id} не найден")
    
    @staticmethod
    def handle_location_update(order_id: int, lat: float, lng: float, eta_minutes: int = None):
        """
        Обработка события: водитель отправил геолокацию
        """
        try:
            order = Order.objects.get(id=order_id)
            tracking = DeliveryTracking.objects.get(order=order)
            
            tracking.current_lat = lat
            tracking.current_lng = lng
            if eta_minutes is not None:
                tracking.eta_minutes = eta_minutes
            
            # Обновляем историю с геолокацией
            tracking.status_history.append({
                'status': tracking.status,
                'old_status': tracking.status,
                'timestamp': timezone.now().isoformat(),
                'lat': lat,
                'lng': lng,
                'eta_minutes': eta_minutes
            })
            
            tracking.save()
            return tracking
        except Order.DoesNotExist:
            raise ValueError(f"Заказ {order_id} не найден")
        except DeliveryTracking.DoesNotExist:
            raise ValueError(f"Трекинг для заказа {order_id} не найден")
    
    @staticmethod
    def handle_loaded(order_id: int, photo_url: str = None):
        """
        Обработка события: груз загружен
        """
        try:
            order = Order.objects.get(id=order_id)
            tracking = DeliveryTracking.objects.get(order=order)
            
            tracking.status = 'LOADED'
            if photo_url:
                # Сохраняем URL фото (в реальности нужно загрузить файл)
                tracking.loading_photo = photo_url
            
            tracking.update_status('LOADED')
            return tracking
        except Order.DoesNotExist:
            raise ValueError(f"Заказ {order_id} не найден")
        except DeliveryTracking.DoesNotExist:
            raise ValueError(f"Трекинг для заказа {order_id} не найден")
    
    @staticmethod
    def handle_delivered(order_id: int, photo_url: str = None):
        """
        Обработка события: груз доставлен (ожидает подтверждения)
        """
        try:
            order = Order.objects.get(id=order_id)
            tracking = DeliveryTracking.objects.get(order=order)
            
            tracking.status = 'DELIVERED_PENDING_CONFIRM'
            if photo_url:
                tracking.unloading_photo = photo_url
            
            tracking.update_status('DELIVERED_PENDING_CONFIRM')
            return tracking
        except Order.DoesNotExist:
            raise ValueError(f"Заказ {order_id} не найден")
        except DeliveryTracking.DoesNotExist:
            raise ValueError(f"Трекинг для заказа {order_id} не найден")
    
    @staticmethod
    def handle_completed(order_id: int, photo_url: str = None):
        """
        Обработка события: доставка подтверждена клиентом
        """
        try:
            order = Order.objects.get(id=order_id)
            tracking = DeliveryTracking.objects.get(order=order)
            
            tracking.status = 'COMPLETED'
            if photo_url:
                tracking.confirmation_photo = photo_url
            
            tracking.update_status('COMPLETED')
            
            # Обновляем статус заказа
            order.status = 'DELIVERED'
            order.save()
            
            return tracking
        except Order.DoesNotExist:
            raise ValueError(f"Заказ {order_id} не найден")
        except DeliveryTracking.DoesNotExist:
            raise ValueError(f"Трекинг для заказа {order_id} не найден")
    
    @staticmethod
    def handle_status_update(order_id: int, new_status: str, lat: float = None, lng: float = None, eta_minutes: int = None):
        """
        Универсальный метод для обновления статуса
        """
        try:
            order = Order.objects.get(id=order_id)
            tracking = DeliveryTracking.objects.get(order=order)
            
            tracking.update_status(
                new_status,
                lat=lat,
                lng=lng,
                eta_minutes=eta_minutes
            )
            
            return tracking
        except Order.DoesNotExist:
            raise ValueError(f"Заказ {order_id} не найден")
        except DeliveryTracking.DoesNotExist:
            raise ValueError(f"Трекинг для заказа {order_id} не найден")


