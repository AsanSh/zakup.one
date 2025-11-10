"""
Модели для отслеживания доставки
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class DeliveryStatus(str, enum.Enum):
    """Статусы доставки"""
    PENDING = "pending"  # Ожидает отправки
    SHIPPED = "shipped"  # Отправлена
    IN_TRANSIT = "in_transit"  # В пути
    OUT_FOR_DELIVERY = "out_for_delivery"  # В доставке
    DELIVERED = "delivered"  # Доставлена
    FAILED = "failed"  # Не удалось доставить


class DeliveryTracking(Base):
    """Модель отслеживания доставки"""
    __tablename__ = "delivery_tracking"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    
    # Информация о доставке
    tracking_number = Column(String)  # Номер отслеживания
    carrier = Column(String)  # Перевозчик
    status = Column(SQLEnum(DeliveryStatus), default=DeliveryStatus.PENDING, index=True)
    
    # Даты
    shipped_at = Column(DateTime(timezone=True))  # Дата отправки
    estimated_delivery_date = Column(DateTime(timezone=True))  # Ожидаемая дата доставки
    delivered_at = Column(DateTime(timezone=True))  # Дата доставки
    
    # Локация
    current_location = Column(String)  # Текущее местоположение
    destination = Column(String)  # Пункт назначения
    
    # Комментарии
    notes = Column(Text)  # Примечания
    
    # Метаданные
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    order = relationship("Order", backref="delivery_tracking")
    events = relationship("DeliveryEvent", back_populates="tracking", cascade="all, delete-orphan")


class DeliveryEvent(Base):
    """События отслеживания доставки"""
    __tablename__ = "delivery_events"
    
    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(Integer, ForeignKey("delivery_tracking.id"), nullable=False)
    
    # Информация о событии
    status = Column(SQLEnum(DeliveryStatus), nullable=False)
    location = Column(String)  # Местоположение
    description = Column(Text)  # Описание события
    
    # Метаданные
    occurred_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Связи
    tracking = relationship("DeliveryTracking", back_populates="events")

