"""
Сервис для импорта прайс-листов
Интегрирует существующий парсер в систему
"""
from typing import List, Dict, Optional
import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.product import Product, Supplier
from app.services.stroydvor_parser import StroydvorParser


class PriceImportService:
    """Сервис для импорта прайс-листов"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def import_from_file(
        self,
        file_path: str,
        supplier_id: int,
        column_mapping: Optional[Dict[str, str]] = None,
        header_row: int = 7,
        start_row: int = 8
    ) -> Dict:
        """
        Импортирует товары из Excel файла
        
        Args:
            file_path: путь к файлу
            supplier_id: ID поставщика
            column_mapping: сопоставление колонок (если нужно)
            header_row: номер строки с заголовками
            start_row: номер строки с данными
        
        Returns:
            Словарь с результатами импорта
        """
        try:
            # Проверяем существование поставщика
            supplier = self.db.query(Supplier).filter(Supplier.id == supplier_id).first()
            if not supplier:
                return {
                    "success": False,
                    "error": f"Поставщик с ID {supplier_id} не найден"
                }
            
            # Определяем, какой парсер использовать
            # Если поставщик - Стройдвор, используем специальный парсер
            if 'стройдвор' in supplier.name.lower():
                parser = StroydvorParser(file_path)
                products_data = parser.parse()
            else:
                # Для других поставщиков используем базовый парсер (если будет создан)
                # Пока используем StroydvorParser как универсальный
                parser = StroydvorParser(file_path)
                products_data = parser.parse()
            
            # Импортируем товары
            imported_count = 0
            updated_count = 0
            errors = []
            
            for product_data in products_data:
                try:
                    name = product_data.get('name', '').strip()
                    if not name:
                        continue
                    
                    # Проверяем, существует ли товар с таким названием у этого поставщика
                    existing_product = self.db.query(Product).filter(
                        Product.name == name,
                        Product.supplier_id == supplier_id
                    ).first()
                    
                    purchase_price = float(product_data.get('price', 0.0) or 0.0)
                    unit = product_data.get('unit', 'шт')
                    category = product_data.get('category', 'Разное')
                    
                    if existing_product:
                        # Обновляем существующий товар
                        # Сохраняем надбавку, если она была установлена
                        markup = existing_product.markup or 0.0
                        existing_product.purchase_price = purchase_price
                        existing_product.markup = markup
                        existing_product.price = purchase_price + markup  # Продажная цена
                        existing_product.unit = unit
                        existing_product.category = category
                        existing_product.updated_at = datetime.utcnow()
                        updated_count += 1
                    else:
                        # Создаем новый товар
                        new_product = Product(
                            name=name,
                            unit=unit,
                            purchase_price=purchase_price,  # Закупочная цена из прайс-листа
                            markup=0.0,  # Надбавка по умолчанию 0
                            price=purchase_price,  # Продажная цена = закупочная (без надбавки)
                            category=category,
                            supplier_id=supplier_id,
                            is_active=True
                        )
                        self.db.add(new_product)
                        imported_count += 1
                    
                except Exception as e:
                    errors.append({
                        "product": product_data.get('name', 'Unknown'),
                        "error": str(e)
                    })
            
            self.db.commit()
            
            return {
                "success": True,
                "imported": imported_count,
                "updated": updated_count,
                "total_processed": len(products_data),
                "errors": errors
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": str(e)
            }
    
    def bulk_update_prices(
        self,
        product_ids: List[int],
        price_change_type: str,  # "percentage" или "fixed"
        value: float
    ) -> Dict:
        """
        Массовое обновление цен
        
        Args:
            product_ids: список ID товаров
            price_change_type: тип изменения ("percentage" или "fixed")
            value: значение изменения (процент или фиксированная сумма)
        """
        try:
            products = self.db.query(Product).filter(Product.id.in_(product_ids)).all()
            updated_count = 0
            
            for product in products:
                if price_change_type == "percentage":
                    product.price = product.price * (1 + value / 100)
                elif price_change_type == "fixed":
                    product.price = product.price + value
                else:
                    return {"success": False, "error": "Неверный тип изменения цены"}
                updated_count += 1
            
            self.db.commit()
            
            return {
                "success": True,
                "updated": updated_count
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": str(e)
            }

