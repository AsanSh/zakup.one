"""
Модели заявок
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class OrderStatus(str, enum.Enum):
    """Статусы заявки"""
    NEW = "new"  # Новая
    IN_PROGRESS = "in_progress"  # В обработке
    COLLECTED = "collected"  # Собрана
    SHIPPED = "shipped"  # Отправлена
    IN_TRANSIT = "in_transit"  # В пути
    DELIVERED = "delivered"  # Доставлена
    CANCELLED = "cancelled"  # Отменена


class Order(Base):
    """Модель заявки"""
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Информация о доставке
    delivery_address = Column(String, nullable=False)
    delivery_comment = Column(Text)
    delivery_date = Column(DateTime(timezone=True))
    estimated_delivery_date = Column(DateTime(timezone=True))  # Ожидаемая дата доставки
    tracking_number = Column(String)  # Номер отслеживания
    contact_person = Column(String)
    contact_phone = Column(String)
    
    # Файлы (путь к файлу)
    attached_file = Column(String)
    
    # Статус
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.NEW, index=True)
    
    # Метаданные
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """Модель позиции в заявке"""
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)  # Цена на момент заказа
    
    # Связи
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

