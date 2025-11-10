"""
Сервис для автоматического скачивания и обновления прайс-листов
"""
import requests
from pathlib import Path
from typing import Optional, Dict
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session

from app.models.product import Supplier
from app.models.price_list_update import PriceListUpdate, UpdateFrequency
from app.services.price_import import PriceImportService
from app.services.stroydvor_parser import StroydvorParser

logger = logging.getLogger(__name__)


class PriceListDownloader:
    """Сервис для скачивания и обновления прайс-листов"""
    
    def __init__(self, db: Session):
        self.db = db
        self.download_dir = Path("downloads")
        self.download_dir.mkdir(exist_ok=True)
    
    def download_price_list(self, url: str, supplier_name: str) -> Optional[str]:
        """
        Скачивает прайс-лист по URL
        
        Args:
            url: URL для скачивания
            supplier_name: название поставщика (для имени файла)
        
        Returns:
            Путь к скачанному файлу или None при ошибке
        """
        try:
            logger.info(f"Скачивание прайс-листа: {url}")
            
            response = requests.get(url, timeout=30, allow_redirects=True)
            response.raise_for_status()
            
            # Определяем расширение файла
            content_type = response.headers.get('content-type', '')
            if 'excel' in content_type or 'spreadsheet' in content_type:
                ext = '.xlsx'
            elif url.endswith('.xlsx'):
                ext = '.xlsx'
            elif url.endswith('.xls'):
                ext = '.xls'
            else:
                ext = '.xlsx'  # По умолчанию
            
            # Создаем имя файла
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{supplier_name}_{timestamp}{ext}"
            file_path = self.download_dir / filename
            
            # Сохраняем файл
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            logger.info(f"Файл скачан: {file_path}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Ошибка скачивания прайс-листа: {e}")
            return None
    
    def update_price_list(self, update_id: int) -> Dict:
        """
        Обновляет прайс-лист по расписанию
        
        Args:
            update_id: ID записи PriceListUpdate
        
        Returns:
            Результат обновления
        """
        try:
            price_update = self.db.query(PriceListUpdate).filter(
                PriceListUpdate.id == update_id
            ).first()
            
            if not price_update:
                return {"success": False, "error": "Запись обновления не найдена"}
            
            if not price_update.is_active:
                return {"success": False, "error": "Обновление неактивно"}
            
            supplier = price_update.supplier
            if not supplier:
                return {"success": False, "error": "Поставщик не найден"}
            
            # Скачиваем файл
            file_path = self.download_price_list(
                price_update.download_url,
                supplier.name
            )
            
            if not file_path:
                error_msg = "Не удалось скачать файл"
                price_update.last_error = error_msg
                price_update.last_update = datetime.utcnow()
                self.db.commit()
                return {"success": False, "error": error_msg}
            
            # Парсим и импортируем
            try:
                # Используем специальный парсер для Стройдвор
                if 'stroydvor' in price_update.download_url.lower():
                    parser = StroydvorParser(file_path)
                    products_data = parser.parse()
                    
                    # Импортируем через PriceImportService
                    import_service = PriceImportService(self.db)
                    
                    # Создаем временный файл в формате, который понимает PriceImportService
                    # Или модифицируем импорт для работы с данными напрямую
                    result = self._import_products_from_data(
                        products_data,
                        price_update.supplier_id,
                        price_update.header_row,
                        price_update.start_row
                    )
                else:
                    # Используем стандартный импорт
                    import_service = PriceImportService(self.db)
                    result = import_service.import_from_file(
                        file_path,
                        supplier_id=price_update.supplier_id,
                        header_row=price_update.header_row,
                        start_row=price_update.start_row
                    )
                
                # Обновляем запись
                price_update.last_update = datetime.utcnow()
                price_update.last_imported_count = result.get('imported', 0)
                price_update.last_updated_count = result.get('updated', 0)
                price_update.last_error = None
                
                # Вычисляем следующее обновление
                price_update.next_update = self._calculate_next_update(
                    price_update.frequency
                )
                
                self.db.commit()
                
                return {
                    "success": True,
                    "imported": result.get('imported', 0),
                    "updated": result.get('updated', 0),
                    "total": result.get('total_processed', 0)
                }
                
            except Exception as e:
                error_msg = str(e)
                price_update.last_error = error_msg
                price_update.last_update = datetime.utcnow()
                self.db.commit()
                logger.error(f"Ошибка импорта: {e}")
                return {"success": False, "error": error_msg}
            
        except Exception as e:
            logger.error(f"Ошибка обновления прайс-листа: {e}")
            return {"success": False, "error": str(e)}
    
    def _import_products_from_data(
        self,
        products_data: List[Dict],
        supplier_id: int,
        header_row: int,
        start_row: int
    ) -> Dict:
        """Импортирует товары из данных парсера"""
        from app.models.product import Product
        
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
                existing_product = self.db.query(Product).filter(
                    Product.name == name,
                    Product.supplier_id == supplier_id
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
    
    def _calculate_next_update(self, frequency: UpdateFrequency) -> Optional[datetime]:
        """Вычисляет дату следующего обновления"""
        now = datetime.utcnow()
        
        if frequency == UpdateFrequency.DAILY:
            return now + timedelta(days=1)
        elif frequency == UpdateFrequency.WEEKLY:
            return now + timedelta(weeks=1)
        elif frequency == UpdateFrequency.MONTHLY:
            return now + timedelta(days=30)
        else:
            return None  # MANUAL - без автоматического обновления
    
    def process_scheduled_updates(self) -> Dict:
        """
        Обрабатывает все запланированные обновления
        
        Returns:
            Результат обработки
        """
        try:
            now = datetime.utcnow()
            
            # Находим все обновления, которые нужно выполнить
            updates = self.db.query(PriceListUpdate).filter(
                PriceListUpdate.is_active == True,
                PriceListUpdate.frequency != UpdateFrequency.MANUAL,
                PriceListUpdate.next_update <= now
            ).all()
            
            results = []
            for update in updates:
                result = self.update_price_list(update.id)
                results.append({
                    "update_id": update.id,
                    "supplier": update.supplier.name if update.supplier else None,
                    "result": result
                })
            
            return {
                "success": True,
                "processed": len(results),
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Ошибка обработки запланированных обновлений: {e}")
            return {"success": False, "error": str(e)}

