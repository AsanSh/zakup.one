"""
API эндпоинты для работы с товарами
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.product import Product
from pydantic import BaseModel

router = APIRouter()


class ProductResponse(BaseModel):
    id: int
    name: str
    article: Optional[str]
    unit: Optional[str]
    price: float
    category: Optional[str]
    country: Optional[str] = None  # Страна производства
    
    class Config:
        from_attributes = True


@router.get("/search", response_model=List[ProductResponse])
async def search_products(
    q: str = Query("", description="Поисковый запрос"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Поиск товаров (пока простой поиск, позже будет с автодополнением)
    Если запрос пустой, возвращает все товары
    """
    from sqlalchemy import func
    from app.core.config import settings
    
    # Если запрос пустой, возвращаем все товары
    if not q or q.strip() == "":
        products = db.query(Product).filter(
            Product.is_active == True
        ).limit(limit).all()
        # Возвращаем товары с country
        result = []
        for p in products:
            product_dict = {
                "id": p.id,
                "name": p.name,
                "article": p.article,
                "unit": p.unit,
                "price": p.price,
                "category": p.category,
                "country": p.country
            }
            result.append(product_dict)
        return result
    
    # Для SQLite используем другой подход, для PostgreSQL ilike
    if settings.DATABASE_URL.startswith("sqlite"):
        # SQLite: используем простой like (регистронезависимый поиск через Python)
        # Получаем все товары и фильтруем в Python (для небольшой БД это нормально)
        all_products = db.query(Product).filter(
            Product.is_active == True
        ).all()
        # Фильтруем по подстроке (регистронезависимо)
        q_lower = q.lower()
        products = [p for p in all_products if q_lower in p.name.lower()][:limit]
    else:
        products = db.query(Product).filter(
            Product.is_active == True,
            Product.name.ilike(f"%{q}%")
        ).limit(limit).all()
    
    # Возвращаем товары с country (supplier_name скрыт от клиентов)
    result = []
    for p in products:
        product_dict = {
            "id": p.id,
            "name": p.name,
            "article": p.article,
            "unit": p.unit,
            "price": p.price,
            "category": p.category,
            "country": p.country  # Страна производства (видна клиентам)
            # supplier_name НЕ возвращаем - это скрытая информация
        }
        result.append(product_dict)
    return result


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Получить товар по ID"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()
    
    if not product:
        return {"error": "Товар не найден"}
    
    return product

