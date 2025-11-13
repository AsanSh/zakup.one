"""
Модели для автоматического обновления прайс-листов
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class UpdateFrequency(str, enum.Enum):
    """Частота обновления прайс-листа"""
    DAILY = "daily"  # Ежедневно
    WEEKLY = "weekly"  # Еженедельно
    MONTHLY = "monthly"  # Ежемесячно
    MANUAL = "manual"  # Вручную


class PriceListUpdate(Base):
    """Модель для автоматического обновления прайс-листов"""
    __tablename__ = "price_list_updates"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    
    # URL для скачивания прайс-листа
    download_url = Column(String, nullable=False)
    
    # Путь к сохраненному файлу прайс-листа
    file_path = Column(String, nullable=True)  # Путь к сохраненному файлу
    
    # Частота обновления
    # Используем native_enum=False для PostgreSQL, чтобы избежать проблем с регистром
    frequency = Column(SQLEnum(UpdateFrequency, native_enum=False, length=20), default=UpdateFrequency.MANUAL, nullable=False)
    
    # Параметры парсинга
    header_row = Column(Integer, default=7)
    start_row = Column(Integer, default=8)
    
    # Статус
    is_active = Column(Boolean, default=True)
    last_update = Column(DateTime(timezone=True))
    next_update = Column(DateTime(timezone=True))
    
    # Результаты последнего обновления
    last_imported_count = Column(Integer, default=0)
    last_updated_count = Column(Integer, default=0)
    last_error = Column(Text)
    
    # Метаданные
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    supplier = relationship("Supplier", back_populates="price_list_updates")


# Связь с Supplier уже добавлена в app/models/product.py

