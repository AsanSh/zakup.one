"""
Модели для работы с водителями
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Driver(Base):
    """Модель водителя"""
    __tablename__ = "drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Основная информация
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=False, unique=True, index=True)
    telegram_id = Column(String, unique=True, index=True)  # ID в Telegram для бота
    
    # Геолокация
    current_latitude = Column(Float)  # Текущая широта
    current_longitude = Column(Float)  # Текущая долгота
    location_updated_at = Column(DateTime(timezone=True))  # Время последнего обновления геолокации
    
    # Статус
    is_active = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)  # Доступен для новых заказов
    
    # Метаданные
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    deliveries = relationship("DeliveryTracking", back_populates="driver", lazy="dynamic")

