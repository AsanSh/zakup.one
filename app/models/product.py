"""
Модели товаров и поставщиков
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Supplier(Base):
    """Модель поставщика"""
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    contact_email = Column(String)
    contact_phone = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    products = relationship("Product", back_populates="supplier")
    price_list_updates = relationship("PriceListUpdate", back_populates="supplier")


class Product(Base):
    """Модель товара"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    article = Column(String, index=True)  # Артикул
    unit = Column(String)  # Единица измерения (шт, м, кг, м³ и т.д.)
    purchase_price = Column(Float, nullable=False)  # Закупочная цена из прайс-листа
    markup = Column(Float, default=0.0)  # Надбавка в сомах
    price = Column(Float, nullable=False)  # Продажная цена (purchase_price + markup)
    category = Column(String, index=True)
    description = Column(Text)
    country = Column(String)  # Страна производства (КР, РК, РФ, Китай и т.д.)
    
    # Связь с поставщиком (скрыта от клиентов)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    
    # Метаданные
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Связи
    supplier = relationship("Supplier", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")

