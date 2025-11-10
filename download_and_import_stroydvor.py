"""
Скрипт для скачивания и импорта прайс-листа Стройдвор
"""
import sys
import os
from pathlib import Path

# Добавляем путь к проекту
sys.path.insert(0, str(Path(__file__).parent))

import requests
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.product import Supplier
from app.services.stroydvor_parser import StroydvorParser
from app.services.price_list_downloader import PriceListDownloader

def download_stroydvor_price_list():
    """Скачивает прайс-лист Стройдвор"""
    url = "https://stroydvor.kg/wp-content/uploads/прайс-лист-10.11.25-.xlsx"
    
    print("Скачивание прайс-листа Стройдвор...")
    try:
        response = requests.get(url, timeout=30, allow_redirects=True)
        response.raise_for_status()
        
        file_path = Path("stroydvor_price_list.xlsx")
        with open(file_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✓ Файл скачан: {file_path}")
        return str(file_path)
    except Exception as e:
        print(f"✗ Ошибка скачивания: {e}")
        return None

def import_stroydvor_products():
    """Импортирует товары из прайс-листа Стройдвор"""
    db = SessionLocal()
    
    try:
        # Создаем или получаем поставщика "Стройдвор"
        supplier = db.query(Supplier).filter(Supplier.name == "Стройдвор").first()
        if not supplier:
            supplier = Supplier(
                name="Стройдвор",
                contact_email="stroydvor312@mail.ru",
                contact_phone="+996 555 57 03 03",
                is_active=True
            )
            db.add(supplier)
            db.commit()
            db.refresh(supplier)
            print(f"✓ Создан поставщик: {supplier.name} (ID: {supplier.id})")
        else:
            print(f"✓ Найден поставщик: {supplier.name} (ID: {supplier.id})")
        
        # Скачиваем файл
        file_path = download_stroydvor_price_list()
        if not file_path:
            return
        
        # Парсим файл
        print("\nПарсинг Excel файла...")
        parser = StroydvorParser(file_path)
        products_data = parser.parse()
        
        print(f"✓ Найдено товаров: {len(products_data)}")
        
        if not products_data:
            print("⚠ Товары не найдены. Проверьте структуру файла.")
            return
        
        # Импортируем товары
        print("\nИмпорт товаров в базу данных...")
        from app.models.product import Product
        from datetime import datetime
        
        imported_count = 0
        updated_count = 0
        errors = []
        
        for product_data in products_data:
            try:
                name = product_data.get('name', '').strip()
                if not name:
                    continue
                
                price = float(product_data.get('price', 0))
                unit = product_data.get('unit', 'шт')
                category = product_data.get('category', 'Разное')
                
                # Проверяем существование товара
                existing_product = db.query(Product).filter(
                    Product.name == name,
                    Product.supplier_id == supplier.id
                ).first()
                
                if existing_product:
                    # Обновляем существующий товар
                    existing_product.price = price
                    existing_product.unit = unit
                    existing_product.category = category
                    existing_product.updated_at = datetime.utcnow()
                    updated_count += 1
                else:
                    # Создаем новый товар
                    new_product = Product(
                        name=name,
                        unit=unit,
                        price=price,
                        category=category,
                        supplier_id=supplier.id,
                        is_active=True
                    )
                    db.add(new_product)
                    imported_count += 1
                
            except Exception as e:
                errors.append({
                    "product": product_data.get('name', 'Unknown'),
                    "error": str(e)
                })
        
        db.commit()
        
        print(f"\n✓ Импорт завершен:")
        print(f"  - Добавлено новых товаров: {imported_count}")
        print(f"  - Обновлено существующих: {updated_count}")
        print(f"  - Ошибок: {len(errors)}")
        
        if errors:
            print("\nОшибки:")
            for error in errors[:10]:  # Показываем первые 10 ошибок
                print(f"  - {error['product']}: {error['error']}")
        
    except Exception as e:
        print(f"✗ Ошибка импорта: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 80)
    print("Импорт прайс-листа Стройдвор")
    print("=" * 80)
    import_stroydvor_products()

