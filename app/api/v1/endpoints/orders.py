"""
API эндпоинты для работы с заявками
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import User
from app.models.delivery import DeliveryTracking, DeliveryEvent
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    delivery_address: str
    delivery_comment: str = ""
    delivery_date: datetime = None
    contact_person: str = ""
    contact_phone: str = ""


class OrderResponse(BaseModel):
    id: int
    status: str
    delivery_address: str
    tracking_number: Optional[str] = None
    estimated_delivery_date: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить список заявок текущего пользователя"""
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders


@router.get("/{order_id}/tracking")
async def get_order_tracking(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить информацию об отслеживании доставки заказа"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return {"error": "Заказ не найден"}
    
    # Проверяем, что заказ принадлежит текущему пользователю
    if order.user_id != current_user.id and not current_user.is_admin:
        return {"error": "Доступ запрещен"}
    
    tracking = db.query(DeliveryTracking).filter(DeliveryTracking.order_id == order_id).first()
    if not tracking:
        return {
            "order_id": order_id,
            "status": "pending",
            "tracking_number": order.tracking_number,
            "estimated_delivery_date": order.estimated_delivery_date.isoformat() if order.estimated_delivery_date else None,
            "events": []
        }
    
    events = db.query(DeliveryEvent).filter(DeliveryEvent.tracking_id == tracking.id).order_by(DeliveryEvent.occurred_at.desc()).all()
    
    return {
        "order_id": order_id,
        "status": tracking.status.value,
        "tracking_number": tracking.tracking_number,
        "carrier": tracking.carrier,
        "current_location": tracking.current_location,
        "destination": tracking.destination,
        "estimated_delivery_date": tracking.estimated_delivery_date.isoformat() if tracking.estimated_delivery_date else None,
        "shipped_at": tracking.shipped_at.isoformat() if tracking.shipped_at else None,
        "delivered_at": tracking.delivered_at.isoformat() if tracking.delivered_at else None,
        "events": [
            {
                "id": event.id,
                "status": event.status.value,
                "location": event.location,
                "description": event.description,
                "occurred_at": event.occurred_at.isoformat() if event.occurred_at else None
            }
            for event in events
        ]
    }


@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создать новую заявку"""
    user_id = current_user.id
    
    new_order = Order(
        user_id=user_id,
        delivery_address=order_data.delivery_address,
        delivery_comment=order_data.delivery_comment,
        delivery_date=order_data.delivery_date,
        contact_person=order_data.contact_person,
        contact_phone=order_data.contact_phone,
        status=OrderStatus.NEW
    )
    
    db.add(new_order)
    db.flush()
    
    # Добавляем товары
    for item_data in order_data.items:
        # Получаем товар для получения цены
        from app.models.product import Product
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if product:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item_data.product_id,
                quantity=item_data.quantity,
                price=product.price
            )
            db.add(order_item)
    
    db.commit()
    db.refresh(new_order)
    
    return new_order

