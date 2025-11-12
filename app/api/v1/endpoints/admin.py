"""
API эндпоинты для админ-панели
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.product import Product, Supplier
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.models.delivery import DeliveryTracking, DeliveryEvent, DeliveryStatus
from app.models.price_list_update import PriceListUpdate, UpdateFrequency
from app.services.price_import import PriceImportService
from app.services.price_list_downloader import PriceListDownloader
from app.api.v1.endpoints.auth import get_current_admin_user
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import func, and_
import os
import shutil
from pathlib import Path

router = APIRouter()


class SupplierCreate(BaseModel):
    name: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class SupplierResponse(BaseModel):
    id: int
    name: str
    contact_email: Optional[str]
    contact_phone: Optional[str]
    is_active: bool
    
    class Config:
        from_attributes = True


class DownloadPriceListRequest(BaseModel):
    supplier_id: int
    download_url: str
    frequency: str = "manual"
    header_row: int = 7
    start_row: int = 8


@router.get("/suppliers", response_model=List[SupplierResponse])
async def get_suppliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Получить список поставщиков"""
    suppliers = db.query(Supplier).all()
    return suppliers


@router.post("/suppliers", response_model=SupplierResponse)
async def create_supplier(
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Создать нового поставщика"""
    new_supplier = Supplier(
        name=supplier_data.name,
        contact_email=supplier_data.contact_email,
        contact_phone=supplier_data.contact_phone
    )
    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier


@router.post("/import-price-list")
async def import_price_list(
    file: UploadFile = File(...),
    supplier_id: int = Form(...),
    header_row: int = Form(7),
    start_row: int = Form(8),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Загрузка и импорт прайс-листа
    """
    
    # Создаем директорию для загрузок
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Сохраняем файл
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Проверяем поставщика для определения парсера
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Поставщик не найден")
        
        # Используем специальный парсер для Стройдвор
        if 'stroydvor' in supplier.name.lower():
            try:
                from app.services.stroydvor_parser import StroydvorParser
                from app.services.price_list_downloader import PriceListDownloader
                
                parser = StroydvorParser(str(file_path))
                products_data = parser.parse()
                
                if not products_data:
                    raise HTTPException(
                        status_code=500, 
                        detail="Парсер не нашел товары в файле. Проверьте формат файла."
                    )
                
                # Импортируем через метод downloader
                downloader = PriceListDownloader(db)
                result = downloader._import_products_from_data(
                    products_data,
                    supplier_id,
                    header_row,
                    start_row
                )
                
                if not result.get('success', True):
                    raise HTTPException(
                        status_code=500,
                        detail=result.get('error', 'Ошибка импорта товаров')
                    )
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Ошибка парсинга файла Стройдвор: {str(e)}"
                )
        else:
            # Используем стандартный импорт
            import_service = PriceImportService(db)
            result = import_service.import_from_file(
                str(file_path),
                supplier_id=supplier_id,
                header_row=header_row,
                start_row=start_row
            )
            
            if not result.get('success', True):
                raise HTTPException(
                    status_code=500,
                    detail=result.get('error', 'Ошибка импорта товаров')
                )
        
        # Удаляем временный файл
        os.remove(file_path)
        
        return result
        
    except Exception as e:
        # Удаляем временный файл в случае ошибки
        if file_path.exists():
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users", response_model=List[dict])
async def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Получить список пользователей"""
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "company": user.company,
            "is_verified": user.is_verified,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
        for user in users
    ]


@router.post("/users/{user_id}/verify")
async def verify_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Верифицировать пользователя"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    user.is_verified = True
    db.commit()
    
    # Отправляем email-уведомление об одобрении
    try:
        from app.services.email_service import send_verification_approved_notification
        await send_verification_approved_notification(
            email=user.email,
            full_name=user.full_name
        )
    except Exception as e:
        # Логируем ошибку, но не прерываем верификацию
        print(f"⚠️  Ошибка отправки email при верификации: {e}")
    
    return {"success": True, "message": "Пользователь верифицирован"}


@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Деактивировать пользователя"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    user.is_active = False
    db.commit()
    
    return {"success": True, "message": "Пользователь деактивирован"}


@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Активировать пользователя"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    user.is_active = True
    db.commit()
    
    return {"success": True, "message": "Пользователь активирован"}


@router.get("/orders", response_model=List[dict])
async def get_all_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Получить все заявки"""
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return [
        {
            "id": order.id,
            "user_id": order.user_id,
            "user_email": order.user.email if order.user else None,
            "user_name": order.user.full_name if order.user else None,
            "status": order.status.value,
            "delivery_address": order.delivery_address,
            "tracking_number": order.tracking_number,
            "estimated_delivery_date": order.estimated_delivery_date.isoformat() if order.estimated_delivery_date else None,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items_count": len(order.items) if order.items else 0
        }
        for order in orders
    ]


class OrderStatusUpdate(BaseModel):
    status: str
    tracking_number: Optional[str] = None
    estimated_delivery_date: Optional[datetime] = None


@router.post("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Изменить статус заявки"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    try:
        order.status = OrderStatus(status_data.status)
        if status_data.tracking_number:
            order.tracking_number = status_data.tracking_number
        if status_data.estimated_delivery_date:
            order.estimated_delivery_date = status_data.estimated_delivery_date
        
        # Создаем или обновляем отслеживание доставки
        tracking = db.query(DeliveryTracking).filter(DeliveryTracking.order_id == order_id).first()
        if not tracking:
            tracking = DeliveryTracking(
                order_id=order_id,
                tracking_number=status_data.tracking_number,
                status=DeliveryStatus.PENDING
            )
            db.add(tracking)
        else:
            if status_data.tracking_number:
                tracking.tracking_number = status_data.tracking_number
        
        # Обновляем статус отслеживания в зависимости от статуса заказа
        if status_data.status == "shipped":
            tracking.status = DeliveryStatus.SHIPPED
            tracking.shipped_at = datetime.utcnow()
        elif status_data.status == "in_transit":
            tracking.status = DeliveryStatus.IN_TRANSIT
        elif status_data.status == "delivered":
            tracking.status = DeliveryStatus.DELIVERED
            tracking.delivered_at = datetime.utcnow()
        
        if status_data.estimated_delivery_date:
            tracking.estimated_delivery_date = status_data.estimated_delivery_date
        
        db.commit()
        return {"success": True, "status": status_data.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Неверный статус: {str(e)}")


@router.get("/products", response_model=List[dict])
async def get_all_products(
    skip: int = 0,
    limit: int = Query(10000, ge=1, le=50000),  # Увеличен лимит до 10000, максимум 50000
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Получить все товары"""
    products = db.query(Product).offset(skip).limit(limit).all()
    return [
        {
            "id": product.id,
            "name": product.name,
            "article": product.article,
            "unit": product.unit,
            "purchase_price": product.purchase_price,  # Закупочная цена
            "markup": product.markup or 0.0,  # Надбавка
            "price": product.price,  # Продажная цена
            "category": product.category,
            "country": product.country,
            "is_active": product.is_active,
            "supplier_id": product.supplier_id,
            "supplier_name": product.supplier.name if product.supplier else None
        }
        for product in products
    ]


class ProductUpdate(BaseModel):
    price: Optional[float] = None
    markup: Optional[float] = None  # Надбавка в сомах
    is_active: Optional[bool] = None
    category: Optional[str] = None
    country: Optional[str] = None


@router.put("/products/{product_id}")
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Обновить товар"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    
    # Обновляем надбавку
    if product_data.markup is not None:
        product.markup = product_data.markup
        # Пересчитываем продажную цену
        product.price = product.purchase_price + product.markup
    
    # Если напрямую обновляется цена, обновляем и надбавку
    if product_data.price is not None:
        product.price = product_data.price
        # Пересчитываем надбавку
        product.markup = product_data.price - product.purchase_price
    
    if product_data.is_active is not None:
        product.is_active = product_data.is_active
    if product_data.category is not None:
        product.category = product_data.category
    if product_data.country is not None:
        product.country = product_data.country
    
    db.commit()
    db.refresh(product)
    
    return {
        "id": product.id,
        "name": product.name,
        "purchase_price": product.purchase_price,
        "markup": product.markup or 0.0,
        "price": product.price,
        "is_active": product.is_active,
        "category": product.category,
        "country": product.country
    }


@router.post("/products/bulk-update-prices")
async def bulk_update_prices(
    price_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Массовое обновление цен товаров"""
    try:
        price_change_type = price_data.get("type")  # "percent" or "fixed"
        price_value = float(price_data.get("value", 0))
        category = price_data.get("category")  # Опционально
        supplier_id = price_data.get("supplier_id")  # Опционально
        
        # Получаем товары для обновления
        query = db.query(Product)
        if category:
            query = query.filter(Product.category == category)
        if supplier_id:
            query = query.filter(Product.supplier_id == supplier_id)
        
        products = query.all()
        updated_count = 0
        
        for product in products:
            if price_change_type == "percent":
                # Изменение на процент
                new_price = product.price * (1 + price_value / 100)
                # Пересчитываем надбавку как разницу между новой ценой и закупочной
                new_markup = new_price - product.purchase_price
            elif price_change_type == "fixed":
                # Изменение на фиксированную сумму
                new_price = product.price + price_value
                # Добавляем фиксированную сумму к надбавке
                new_markup = (product.markup or 0.0) + price_value
            else:
                continue
            
            if new_price < 0:
                new_price = 0
            if new_markup < 0:
                new_markup = 0
            
            product.price = new_price
            product.markup = new_markup
            updated_count += 1
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Обновлено цен: {updated_count}",
            "updated_count": updated_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка массового обновления цен: {str(e)}")


@router.put("/suppliers/{supplier_id}")
async def update_supplier(
    supplier_id: int,
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Обновить поставщика"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Поставщик не найден")
    
    supplier.name = supplier_data.name
    supplier.contact_email = supplier_data.contact_email
    supplier.contact_phone = supplier_data.contact_phone
    
    db.commit()
    db.refresh(supplier)
    
    return supplier


@router.post("/suppliers/{supplier_id}/toggle-active")
async def toggle_supplier_active(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Переключить статус активности поставщика"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Поставщик не найден")
    
    supplier.is_active = not supplier.is_active
    db.commit()
    
    return {"success": True, "is_active": supplier.is_active}


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Получить статистику для Dashboard"""
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    start_of_week = now - timedelta(days=now.weekday())
    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Статистика по заявкам по статусам
    orders_by_status = {}
    for status in OrderStatus:
        count = db.query(Order).filter(Order.status == status).count()
        orders_by_status[status.value] = count
    
    # Новые клиенты за текущий месяц
    new_users_this_month = db.query(User).filter(
        and_(
            User.created_at >= start_of_month,
            User.is_admin == False
        )
    ).count()
    
    # Общий оборот (сумма всех заявок)
    # TODO: Добавить поле total_amount в Order или считать из OrderItem
    total_turnover = 0  # Временное значение
    
    # Количество товаров в каталоге
    total_products = db.query(Product).filter(Product.is_active == True).count()
    
    # График заявок по дням (последние 7 дней)
    orders_by_day = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        count = db.query(Order).filter(
            and_(
                Order.created_at >= day_start,
                Order.created_at <= day_end
            )
        ).count()
        
        orders_by_day.append({
            "date": day_start.isoformat(),
            "count": count
        })
    
    # Последние заявки
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    recent_orders_data = [
        {
            "id": order.id,
            "user_name": order.user.full_name if order.user else None,
            "status": order.status.value,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items_count": len(order.items) if order.items else 0
        }
        for order in recent_orders
    ]
    
    return {
        "orders_by_status": orders_by_status,
        "new_users_this_month": new_users_this_month,
        "total_turnover": total_turnover,
        "total_products": total_products,
        "orders_by_day": orders_by_day,
        "recent_orders": recent_orders_data
    }


@router.get("/users/pending")
async def get_pending_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Получить список пользователей на модерации (не верифицированных)"""
    pending_users = db.query(User).filter(
        and_(
            User.is_verified == False,
            User.is_admin == False
        )
    ).order_by(User.created_at.desc()).all()
    
    return [
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "company": user.company,
            "is_verified": user.is_verified,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
        for user in pending_users
    ]


class RejectUserRequest(BaseModel):
    reason: Optional[str] = None


@router.post("/users/{user_id}/reject")
async def reject_user(
    user_id: int,
    reject_data: Optional[RejectUserRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Отклонить заявку на регистрацию (деактивировать пользователя)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    user.is_active = False
    db.commit()
    
    # Отправляем email-уведомление об отклонении
    reason = reject_data.reason if reject_data else None
    try:
        from app.services.email_service import send_verification_rejected_notification
        await send_verification_rejected_notification(
            email=user.email,
            full_name=user.full_name,
            reason=reason
        )
    except Exception as e:
        # Логируем ошибку, но не прерываем отклонение
        print(f"⚠️  Ошибка отправки email при отклонении: {e}")
    
    return {"success": True, "message": "Заявка отклонена"}


@router.get("/orders/stats")
async def get_orders_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Получить статистику по заявкам"""
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Заявки по статусам
    orders_by_status = {}
    for status in OrderStatus:
        count = db.query(Order).filter(Order.status == status).count()
        orders_by_status[status.value] = count
    
    # Заявки за текущий месяц
    orders_this_month = db.query(Order).filter(
        Order.created_at >= start_of_month
    ).count()
    
    return {
        "orders_by_status": orders_by_status,
        "orders_this_month": orders_this_month,
        "total_orders": db.query(Order).count()
    }


@router.post("/price-lists/download-and-import")
async def download_and_import_price_list(
    request: DownloadPriceListRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Скачать прайс-лист по URL и импортировать товары"""
    try:
        supplier = db.query(Supplier).filter(Supplier.id == request.supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Поставщик не найден")
        
        # Скачиваем файл
        downloader = PriceListDownloader(db)
        file_path = downloader.download_price_list(request.download_url, supplier.name)
        
        if not file_path:
            raise HTTPException(status_code=500, detail="Не удалось скачать файл")
        
        # Импортируем товары
        # Используем специальный парсер для Стройдвор
        if 'stroydvor' in request.download_url.lower():
            try:
                from app.services.stroydvor_parser import StroydvorParser
                parser = StroydvorParser(file_path)
                products_data = parser.parse()
                
                if not products_data:
                    raise HTTPException(
                        status_code=500, 
                        detail="Парсер не нашел товары в файле. Проверьте формат файла."
                    )
                
                # Импортируем через метод downloader
                result = downloader._import_products_from_data(
                    products_data,
                    request.supplier_id,
                    request.header_row,
                    request.start_row
                )
                
                if not result.get('success', True):
                    raise HTTPException(
                        status_code=500,
                        detail=result.get('error', 'Ошибка импорта товаров')
                    )
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Ошибка парсинга файла Стройдвор: {str(e)}"
                )
        else:
            # Используем стандартный импорт
            import_service = PriceImportService(db)
            result = import_service.import_from_file(
                file_path,
                supplier_id=request.supplier_id,
                header_row=request.header_row,
                start_row=request.start_row
            )
            
            if not result.get('success', True):
                raise HTTPException(
                    status_code=500,
                    detail=result.get('error', 'Ошибка импорта товаров')
                )
        
        # Создаем или обновляем запись автоматического обновления
        price_update = db.query(PriceListUpdate).filter(
            PriceListUpdate.supplier_id == request.supplier_id,
            PriceListUpdate.download_url == request.download_url
        ).first()
        
        if not price_update:
            price_update = PriceListUpdate(
                supplier_id=request.supplier_id,
                download_url=request.download_url,
                frequency=UpdateFrequency(request.frequency),
                header_row=request.header_row,
                start_row=request.start_row,
                is_active=True
            )
            db.add(price_update)
        else:
            price_update.frequency = UpdateFrequency(request.frequency)
            price_update.header_row = request.header_row
            price_update.start_row = request.start_row
        
        # Вычисляем следующее обновление
        if request.frequency != "manual":
            price_update.next_update = downloader._calculate_next_update(
                UpdateFrequency(request.frequency)
            )
        
        price_update.last_update = datetime.utcnow()
        price_update.last_imported_count = result.get('imported', 0)
        price_update.last_updated_count = result.get('updated', 0)
        price_update.last_error = None
        
        db.commit()
        
        return {
            "success": True,
            "imported": result.get('imported', 0),
            "updated": result.get('updated', 0),
            "total_processed": result.get('total_processed', 0),
            "update_id": price_update.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка импорта: {str(e)}")


@router.get("/price-lists/updates", response_model=List[dict])
async def get_price_list_updates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Получить список автоматических обновлений прайс-листов"""
    updates = db.query(PriceListUpdate).all()
    return [
        {
            "id": update.id,
            "supplier_id": update.supplier_id,
            "supplier_name": update.supplier.name if update.supplier else None,
            "download_url": update.download_url,
            "frequency": update.frequency.value,
            "is_active": update.is_active,
            "last_update": update.last_update.isoformat() if update.last_update else None,
            "next_update": update.next_update.isoformat() if update.next_update else None,
            "last_imported_count": update.last_imported_count,
            "last_updated_count": update.last_updated_count,
            "last_error": update.last_error
        }
        for update in updates
    ]


@router.put("/price-lists/updates/{update_id}")
async def update_price_list_update(
    update_id: int,
    update_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Обновить настройки автоматического обновления прайс-листа"""
    price_update = db.query(PriceListUpdate).filter(PriceListUpdate.id == update_id).first()
    if not price_update:
        raise HTTPException(status_code=404, detail="Запись обновления не найдена")
    
    if "frequency" in update_data:
        price_update.frequency = UpdateFrequency(update_data["frequency"])
    
    if "is_active" in update_data:
        price_update.is_active = update_data["is_active"]
    
    if "header_row" in update_data:
        price_update.header_row = update_data["header_row"]
    
    if "start_row" in update_data:
        price_update.start_row = update_data["start_row"]
    
    # Пересчитываем следующее обновление
    if price_update.frequency != UpdateFrequency.MANUAL and price_update.is_active:
        downloader = PriceListDownloader(db)
        price_update.next_update = downloader._calculate_next_update(price_update.frequency)
    
    db.commit()
    
    return {
        "success": True,
        "update": {
            "id": price_update.id,
            "frequency": price_update.frequency.value,
            "is_active": price_update.is_active,
            "next_update": price_update.next_update.isoformat() if price_update.next_update else None
        }
    }


@router.post("/price-lists/updates/{update_id}/run")
async def run_price_list_update(
    update_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Запустить обновление прайс-листа вручную"""
    downloader = PriceListDownloader(db)
    result = downloader.update_price_list(update_id)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Ошибка обновления"))
    
    return result

