#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для заполнения базы данных демо данными
"""
import sys
from pathlib import Path
import random

sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import SessionLocal, Base, engine
from app.models.product import Product, Supplier
from app.models.user import User

# Демо данные
DEMO_SUPPLIERS = [
    {"name": "СтройМатериалы КГ", "contact_email": "info@stroymat.kg", "contact_phone": "+996555111111"},
    {"name": "СтройДвор", "contact_email": "sales@stroydvor.kg", "contact_phone": "+996555222222"},
    {"name": "СтройТорг", "contact_email": "contact@stroytorg.kg", "contact_phone": "+996555333333"},
]

# Страны производства для товаров
COUNTRIES = ["КР", "РК", "РФ", "Китай"]

DEMO_PRODUCTS = [
    # Строительные материалы
    {"name": "ДСМ", "unit": "м³", "price": 1805.0, "category": "Строительные материалы", "country": "КР"},
    {"name": "ДВП", "unit": "шт", "price": 390.0, "category": "Строительные материалы"},
    {"name": "ДВП 2,5х1700х2745 тверд. марка Т гр Б", "unit": "шт", "price": 360.0, "category": "Строительные материалы"},
    {"name": "ДВП 3,2х1700х2745 тверд. марка Т гр Б", "unit": "шт", "price": 380.0, "category": "Строительные материалы"},
    {"name": "ДВП 3,4х1700х2745 тверд. марка Т гр Б", "unit": "шт", "price": 390.0, "category": "Строительные материалы"},
    {"name": "ДСП", "unit": "м²", "price": 1950.0, "category": "Строительные материалы"},
    {"name": "ДСП упаковка", "unit": "шт", "price": 1395.0, "category": "Строительные материалы"},
    {"name": "МДФ", "unit": "м²", "price": 1805.0, "category": "Строительные материалы"},
    {"name": "МДФ 06х2070х2800", "unit": "шт", "price": 1132.0, "category": "Строительные материалы"},
    
    # Цемент и бетон
    {"name": "Цемент М400", "unit": "мешок 50кг", "price": 450.0, "category": "Цемент и бетон"},
    {"name": "Цемент М500", "unit": "мешок 50кг", "price": 520.0, "category": "Цемент и бетон"},
    {"name": "Песок речной", "unit": "м³", "price": 800.0, "category": "Цемент и бетон"},
    {"name": "Щебень фракция 20-40", "unit": "м³", "price": 1200.0, "category": "Цемент и бетон"},
    {"name": "Бетон М200", "unit": "м³", "price": 3500.0, "category": "Цемент и бетон"},
    {"name": "Бетон М300", "unit": "м³", "price": 4200.0, "category": "Цемент и бетон"},
    
    # Арматура
    {"name": "Арматура А12", "unit": "м", "price": 85.0, "category": "Арматура"},
    {"name": "Арматура А14", "unit": "м", "price": 120.0, "category": "Арматура"},
    {"name": "Арматура А16", "unit": "м", "price": 150.0, "category": "Арматура"},
    {"name": "Арматура А18", "unit": "м", "price": 190.0, "category": "Арматура"},
    {"name": "Проволока вязальная", "unit": "кг", "price": 180.0, "category": "Арматура"},
    
    # Кирпич и блоки
    {"name": "Кирпич красный полнотелый", "unit": "шт", "price": 12.0, "category": "Кирпич и блоки"},
    {"name": "Кирпич красный пустотелый", "unit": "шт", "price": 10.0, "category": "Кирпич и блоки"},
    {"name": "Блок керамзитовый", "unit": "шт", "price": 45.0, "category": "Кирпич и блоки"},
    {"name": "Блок газобетонный 600x300x200", "unit": "шт", "price": 180.0, "category": "Кирпич и блоки"},
    
    # Кровля
    {"name": "Профнастил С8", "unit": "м²", "price": 450.0, "category": "Кровля"},
    {"name": "Профнастил С20", "unit": "м²", "price": 520.0, "category": "Кровля"},
    {"name": "Металлочерепица", "unit": "м²", "price": 680.0, "category": "Кровля"},
    {"name": "Ондулин", "unit": "лист", "price": 850.0, "category": "Кровля"},
    
    # Окна и двери
    {"name": "Окно ПВХ 1500x1500", "unit": "шт", "price": 15000.0, "category": "Окна и двери"},
    {"name": "Дверь входная металлическая", "unit": "шт", "price": 25000.0, "category": "Окна и двери"},
    {"name": "Дверь межкомнатная", "unit": "шт", "price": 4500.0, "category": "Окна и двери"},
    
    # Сантехника
    {"name": "Труба ПВХ 50мм", "unit": "м", "price": 120.0, "category": "Сантехника"},
    {"name": "Труба ПВХ 110мм", "unit": "м", "price": 280.0, "category": "Сантехника"},
    {"name": "Унитаз", "unit": "шт", "price": 3500.0, "category": "Сантехника"},
    {"name": "Раковина", "unit": "шт", "price": 2500.0, "category": "Сантехника"},
    
    # Электрика
    {"name": "Кабель ВВГ 3x2.5", "unit": "м", "price": 85.0, "category": "Электрика"},
    {"name": "Кабель ВВГ 3x4", "unit": "м", "price": 140.0, "category": "Электрика"},
    {"name": "Розетка", "unit": "шт", "price": 250.0, "category": "Электрика"},
    {"name": "Выключатель", "unit": "шт", "price": 180.0, "category": "Электрика"},
    
    # Инструменты
    {"name": "Перфоратор", "unit": "шт", "price": 8500.0, "category": "Инструменты"},
    {"name": "Дрель", "unit": "шт", "price": 3500.0, "category": "Инструменты"},
    {"name": "Болгарка", "unit": "шт", "price": 4500.0, "category": "Инструменты"},
]


def fill_demo_data():
    """Заполняет базу данных демо данными"""
    db = SessionLocal()
    try:
        print("=" * 60)
        print("ЗАПОЛНЕНИЕ БАЗЫ ДАННЫХ ДЕМО ДАННЫМИ")
        print("=" * 60)
        print()
        
        # Создаем поставщиков
        print("📦 Создание поставщиков...")
        suppliers = []
        for supplier_data in DEMO_SUPPLIERS:
            existing = db.query(Supplier).filter(Supplier.name == supplier_data["name"]).first()
            if existing:
                suppliers.append(existing)
                print(f"  ℹ️  Поставщик '{supplier_data['name']}' уже существует")
            else:
                supplier = Supplier(**supplier_data)
                db.add(supplier)
                suppliers.append(supplier)
                print(f"  ✅ Создан поставщик: {supplier_data['name']}")
        
        db.commit()
        print(f"✅ Создано поставщиков: {len(suppliers)}\n")
        
        # Создаем товары
        print("📦 Создание товаров...")
        products_count = 0
        for product_data in DEMO_PRODUCTS:
            # Случайно выбираем поставщика
            supplier = random.choice(suppliers)
            
            # Проверяем, существует ли товар
            existing = db.query(Product).filter(
                Product.name == product_data["name"],
                Product.supplier_id == supplier.id
            ).first()
            
            if existing:
                print(f"  ℹ️  Товар '{product_data['name']}' уже существует")
            else:
                # Выбираем страну производства (циклически)
                country = product_data.get("country") or COUNTRIES[products_count % len(COUNTRIES)]
                product = Product(
                    name=product_data["name"],
                    unit=product_data.get("unit", "шт"),
                    price=product_data["price"],
                    category=product_data.get("category", "Разное"),
                    country=country,
                    supplier_id=supplier.id,
                    is_active=True
                )
                db.add(product)
                products_count += 1
        
        db.commit()
        print(f"✅ Создано товаров: {products_count}\n")
        
        # Статистика
        total_products = db.query(Product).count()
        total_suppliers = db.query(Supplier).count()
        
        print("=" * 60)
        print("✅ ДЕМО ДАННЫЕ УСПЕШНО СОЗДАНЫ!")
        print("=" * 60)
        print(f"Поставщиков: {total_suppliers}")
        print(f"Товаров: {total_products}")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка при заполнении данных: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    fill_demo_data()

