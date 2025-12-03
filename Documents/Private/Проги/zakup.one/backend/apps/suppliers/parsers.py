import pandas as pd
import openpyxl
from typing import List, Dict, Optional
import logging
import re

logger = logging.getLogger(__name__)


class ExcelPriceListParser:
    """Парсер для Excel прайс-листов"""
    
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.products = []
        self.categories = []
        self.current_category = None
        
    def parse(self) -> Dict:
        """
        Парсит Excel файл и возвращает словарь с товарами и категориями
        
        Структура файла:
        - Строки 1-8: Заголовок с логотипом и контактами (пропускаем)
        - Строка 9: Заголовки таблицы (Товар, Ед.изм, Цена)
        - Строки 10+: Категории и товары
        """
        try:
            # Читаем Excel файл
            logger.info(f"Чтение файла: {self.file_path}")
            df = pd.read_excel(self.file_path, header=None, engine='openpyxl')
            logger.info(f"Файл прочитан. Строк: {len(df)}, Колонок: {len(df.columns) if len(df) > 0 else 0}")
            
            # Ищем строку с заголовками (обычно "Товар", "Ед.изм", "Цена")
            header_row = self._find_header_row(df)
            
            if header_row is None:
                # Если не нашли заголовки, пробуем начать с 9 строки (обычно там начинаются данные)
                logger.warning("Не найдена строка с заголовками. Пробуем начать с 9 строки.")
                header_row = 8  # Индекс 8 = строка 9 (0-based)
            
            logger.info(f"Найдена строка заголовков: {header_row + 1} (индекс {header_row})")
            
            # Парсим данные начиная со строки после заголовков
            self._parse_data(df, header_row + 1)
            
            logger.info(f"Парсинг завершен. Товаров: {len(self.products)}, категорий: {len(self.categories)}")
            
            return {
                'products': self.products,
                'categories': self.categories,
                'total_products': len(self.products)
            }
            
        except Exception as e:
            logger.error(f"Ошибка парсинга Excel файла: {str(e)}", exc_info=True)
            raise
    
    def _find_header_row(self, df: pd.DataFrame) -> Optional[int]:
        """Находит строку с заголовками таблицы"""
        header_keywords = ['товар', 'ед.изм', 'ед', 'цена', 'единица', 'измерения']
        
        for idx, row in df.iterrows():
            row_text = ' '.join([str(cell).lower() if pd.notna(cell) else '' for cell in row.values])
            
            # Проверяем, содержит ли строка ключевые слова заголовков
            if any(keyword in row_text for keyword in header_keywords):
                # Проверяем, что это действительно заголовки (не слишком много пустых ячеек)
                non_empty = sum(1 for cell in row.values if pd.notna(cell) and str(cell).strip())
                if non_empty >= 2:  # Минимум 2 колонки должны быть заполнены
                    return idx
        
        return None
    
    def _parse_data(self, df: pd.DataFrame, start_row: int):
        """Парсит данные товаров из DataFrame"""
        current_category = None
        
        for idx in range(start_row, len(df)):
            row = df.iloc[idx]
            
            # Пропускаем полностью пустые строки
            if row.isna().all():
                continue
            
            # Извлекаем значения ячеек
            values = [cell if pd.notna(cell) else '' for cell in row.values]
            values = [str(v).strip() if v else '' for v in values]
            
            # Фильтруем пустые значения
            values = [v for v in values if v]
            
            if not values:
                continue
            
            # Определяем тип строки
            row_type = self._classify_row(values)
            
            if row_type == 'category':
                # Это категория (например, "ДВП", "ДСП", "ОСП")
                current_category = values[0]
                if current_category not in self.categories:
                    self.categories.append(current_category)
                logger.debug(f"Найдена категория: {current_category}")
                
            elif row_type == 'product':
                # Это товар
                product = self._extract_product(row, current_category)
                if product:
                    self.products.append(product)
        
        logger.info(f"Распознано товаров: {len(self.products)}, категорий: {len(self.categories)}")
        if len(self.products) == 0:
            logger.warning("Не найдено ни одного товара! Проверьте структуру файла.")
    
    def _classify_row(self, values: List[str]) -> str:
        """
        Классифицирует строку: категория или товар
        
        Категория обычно:
        - Короткое название (1-5 слов)
        - Может быть в верхнем регистре
        - Не содержит цену в конце
        
        Товар обычно:
        - Длинное описание
        - Содержит цену (число) в конце
        """
        if not values:
            return 'empty'
        
        first_value = values[0].strip()
        
        # Если первое значение очень короткое (до 10 символов) и нет цен в строке
        # и это не похоже на товар с артикулом, то это категория
        has_price = False
        for val in values:
            # Проверяем, есть ли число, похожее на цену (больше 10)
            try:
                price = float(re.sub(r'[^\d.]', '', str(val)))
                if price > 10:  # Цена обычно больше 10
                    has_price = True
                    break
            except:
                pass
        
        # Если строка короткая и без цены - это категория
        if len(first_value) <= 15 and not has_price and len(values) <= 2:
            # Дополнительная проверка: не содержит ли это типичные слова товаров
            product_keywords = ['х', 'мм', 'м', 'кг', 'шт', 'упаковка', 'шлиф', 'тверд']
            if not any(keyword in first_value.lower() for keyword in product_keywords):
                return 'category'
        
        # Если есть цена - это товар
        if has_price:
            return 'product'
        
        # Если строка длинная - вероятно товар
        if len(first_value) > 15:
            return 'product'
        
        # По умолчанию считаем товаром
        return 'product'
    
    def _extract_product(self, row: pd.Series, category: Optional[str]) -> Optional[Dict]:
        """Извлекает данные товара из строки"""
        try:
            values = []
            for cell in row.values:
                if pd.notna(cell):
                    val = str(cell).strip()
                    if val:
                        values.append(val)
            
            if len(values) < 2:
                return None
            
            # Обычно структура: Название | Единица | Цена
            # Или: Название | Цена (единица может быть в названии)
            
            product_name = values[0]
            
            # Ищем цену (обычно последнее число)
            price = None
            unit = 'шт'  # По умолчанию
            price_index = -1
            
            # Ищем цену с конца
            for i in range(len(values) - 1, -1, -1):
                val = values[i]
                # Убираем пробелы и пробуем преобразовать в число
                clean_val = re.sub(r'[\s]', '', val)  # Убираем только пробелы
                # Пробуем извлечь число (может быть с разделителями тысяч)
                numbers = re.findall(r'\d+[.,]?\d*', clean_val)
                if numbers:
                    try:
                        # Берем последнее число (обычно это цена)
                        num_str = numbers[-1].replace(',', '.')
                        price = float(num_str)
                        if price > 0:
                            price_index = i
                            break
                    except:
                        pass
            
            if price is None or price <= 0:
                logger.debug(f"Не найдена цена в строке: {values}")
                return None
            
            # Единица измерения может быть во втором столбце или в названии
            if len(values) > 1 and price_index > 0:
                # Проверяем, является ли значение перед ценой единицей измерения
                unit_candidate = values[price_index - 1].strip().upper()
                if unit_candidate in ['ШТ', 'М', 'М2', 'М3', 'КГ', 'Т', 'Л', 'МЛ', 'М²', 'М³']:
                    unit = unit_candidate.lower()
                elif 'шт' in unit_candidate.lower() or unit_candidate == 'ШТ':
                    unit = 'шт'
                elif 'м' in unit_candidate.lower() and ('2' in unit_candidate or '²' in unit_candidate):
                    unit = 'м²'
                elif 'м' in unit_candidate.lower() and ('3' in unit_candidate or '³' in unit_candidate):
                    unit = 'м³'
                elif 'кг' in unit_candidate.lower() or unit_candidate == 'КГ':
                    unit = 'кг'
            
            # Генерируем артикул из названия (первые буквы + хеш)
            article = self._generate_article(product_name)
            
            product = {
                'name': product_name,
                'article': article,
                'unit': unit,
                'price': price,
                'category': category
            }
            
            logger.debug(f"Извлечен товар: {product_name}, цена: {price}, единица: {unit}")
            return product
            
        except Exception as e:
            logger.error(f"Ошибка извлечения товара из строки: {str(e)}, значения: {values if 'values' in locals() else 'N/A'}")
            return None
    
    def _generate_article(self, name: str) -> str:
        """Генерирует артикул из названия товара"""
        # Берем первые буквы слов и добавляем хеш
        words = name.split()
        if words:
            # Берем первые 3-4 буквы из первых слов
            article_parts = []
            for word in words[:3]:
                if word and word[0].isalnum():
                    article_parts.append(word[:3].upper())
            
            if article_parts:
                article = ''.join(article_parts)
                # Добавляем короткий хеш для уникальности
                import hashlib
                hash_part = hashlib.md5(name.encode()).hexdigest()[:4].upper()
                return f"{article}-{hash_part}"
        
        # Если не получилось, используем хеш
        import hashlib
        return hashlib.md5(name.encode()).hexdigest()[:8].upper()

