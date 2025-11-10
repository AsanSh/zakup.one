"""
Сервис для импорта прайс-листов
Интегрирует существующий парсер в систему
"""
import sys
from pathlib import Path
from typing import List, Dict, Optional
import pandas as pd
from sqlalchemy.orm import Session

# Добавляем родительскую директорию в путь для импорта парсера
sys.path.append(str(Path(__file__).parent.parent.parent))
from price_list_parser import PriceListParser

from app.models.product import Product, Supplier
from app.core.database import SessionLocal


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
            # Используем существующий парсер
            parser = PriceListParser(
                file_path,
                header_row=header_row,
                start_row=start_row
            )
            products_data = parser.parse()
            
            # Проверяем существование поставщика
            supplier = self.db.query(Supplier).filter(Supplier.id == supplier_id).first()
            if not supplier:
                return {
                    "success": False,
                    "error": f"Поставщик с ID {supplier_id} не найден"
                }
            
            # Импортируем товары
            imported_count = 0
            updated_count = 0
            errors = []
            
            for product_data in products_data:
                try:
                    # Проверяем, существует ли товар с таким названием у этого поставщика
                    existing_product = self.db.query(Product).filter(
                        Product.name == product_data['название'],
                        Product.supplier_id == supplier_id
                    ).first()
                    
                    if existing_product:
                        # Обновляем существующий товар
                        existing_product.price = product_data.get('цена') or existing_product.price
                        existing_product.unit = product_data.get('единица_измерения') or existing_product.unit
                        existing_product.updated_at = pd.Timestamp.now()
                        updated_count += 1
                    else:
                        # Создаем новый товар
                        new_product = Product(
                            name=product_data['название'],
                            unit=product_data.get('единица_измерения', ''),
                            price=product_data.get('цена', 0.0) or 0.0,
                            supplier_id=supplier_id,
                            is_active=True
                        )
                        self.db.add(new_product)
                        imported_count += 1
                    
                except Exception as e:
                    errors.append({
                        "product": product_data.get('название', 'Unknown'),
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

