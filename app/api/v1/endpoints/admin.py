"""
API эндпоинты для админ-панели
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.product import Product, Supplier
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.models.delivery import DeliveryTracking, DeliveryEvent, DeliveryStatus
from app.services.price_import import PriceImportService
from app.api.v1.endpoints.auth import get_current_admin_user
from pydantic import BaseModel
from datetime import datetime
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
    supplier_id: int = None,
    header_row: int = 7,
    start_row: int = 8,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Загрузка и импорт прайс-листа
    """
    if not supplier_id:
        raise HTTPException(status_code=400, detail="Не указан supplier_id")
    
    # Создаем директорию для загрузок
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Сохраняем файл
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Импортируем товары
        import_service = PriceImportService(db)
        result = import_service.import_from_file(
            str(file_path),
            supplier_id=supplier_id,
            header_row=header_row,
            start_row=start_row
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
    limit: int = 100,
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
            "price": product.price,
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
    
    if product_data.price is not None:
        product.price = product_data.price
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
            elif price_change_type == "fixed":
                # Изменение на фиксированную сумму
                new_price = product.price + price_value
            else:
                continue
            
            if new_price < 0:
                new_price = 0
            
            product.price = new_price
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

