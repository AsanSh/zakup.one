"""
Парсер прайс-листа Стройдвор
Специальный парсер для формата Excel от stroydvor.kg
"""
import pandas as pd
from pathlib import Path
from typing import List, Dict, Optional
import re


class StroydvorParser:
    """Парсер прайс-листа Стройдвор"""
    
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.products = []
        self.categories = []
    
    def parse(self) -> List[Dict]:
        """
        Парсит Excel файл и возвращает список товаров с категориями
        
        Returns:
            Список словарей с товарами
        """
        try:
            # Читаем Excel файл
            df = pd.read_excel(self.file_path, sheet_name=0, header=None)
            
            products = []
            current_category = None
            
            # Проходим по всем строкам
            for idx, row in df.iterrows():
                row_values = [str(val).strip() if pd.notna(val) else '' for val in row.values]
                
                # Ищем категорию (обычно в первой колонке, жирный текст или заголовок)
                # Категория обычно содержит только текст без цифр в начале
                first_col = row_values[0] if len(row_values) > 0 else ''
                
                # Проверяем, является ли строка категорией
                if self._is_category_row(row_values):
                    current_category = first_col
                    continue
                
                # Пропускаем пустые строки
                if not any(row_values):
                    continue
                
                # Пропускаем строки заголовков
                if self._is_header_row(row_values):
                    continue
                
                # Парсим товар
                product = self._parse_product_row(row_values, current_category)
                if product:
                    products.append(product)
            
            return products
            
        except Exception as e:
            print(f"Ошибка парсинга: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def _is_category_row(self, row_values: List[str]) -> bool:
        """Проверяет, является ли строка категорией"""
        if not row_values or not row_values[0]:
            return False
        
        first_col = row_values[0]
        
        # Категория обычно:
        # - Не содержит цену (нет чисел с запятой/точкой в конце)
        # - Не содержит единицы измерения (шт, кг, м и т.д.)
        # - Может быть в верхнем регистре или с заглавными буквами
        
        # Проверяем наличие цены (число с запятой или точкой)
        has_price = False
        for val in row_values[1:]:
            if val and re.search(r'\d+[.,]\d+', str(val)):
                has_price = True
                break
        
        # Если есть цена, это не категория
        if has_price:
            return False
        
        # Проверяем единицы измерения
        units = ['шт', 'кг', 'м', 'м²', 'м³', 'л', 'т', 'упак', 'мешок', 'рулон']
        has_unit = any(unit in str(val).lower() for val in row_values for unit in units)
        
        if has_unit:
            return False
        
        # Если первая колонка не пустая и нет цены/единиц, возможно это категория
        # Но нужно проверить, что это не просто название товара
        if len(first_col) > 3 and not re.search(r'\d', first_col):
            # Проверяем, что в строке нет других значимых данных
            non_empty = [v for v in row_values[1:] if v and len(str(v)) > 2]
            if len(non_empty) == 0:
                return True
        
        return False
    
    def _is_header_row(self, row_values: List[str]) -> bool:
        """Проверяет, является ли строка заголовком"""
        if not row_values:
            return False
        
        # Заголовки обычно содержат слова: название, цена, единица и т.д.
        header_keywords = ['наименование', 'название', 'товар', 'цена', 'единица', 
                          'ед.изм', 'количество', 'артикул', 'категория']
        
        row_text = ' '.join([str(v).lower() for v in row_values])
        return any(keyword in row_text for keyword in header_keywords)
    
    def _parse_product_row(self, row_values: List[str], category: Optional[str] = None) -> Optional[Dict]:
        """Парсит строку с товаром"""
        if not row_values or not row_values[0]:
            return None
        
        # Название товара обычно в первой колонке
        name = row_values[0].strip()
        if not name or len(name) < 2:
            return None
        
        # Ищем цену (обычно число с запятой или точкой)
        price = None
        unit = None
        
        for val in row_values[1:]:
            if not val:
                continue
            
            val_str = str(val).strip()
            
            # Пытаемся найти цену (число с запятой/точкой)
            price_match = re.search(r'(\d+[.,]\d+|\d+)', val_str.replace(' ', ''))
            if price_match:
                try:
                    price_str = price_match.group(1).replace(',', '.')
                    price = float(price_str)
                    # Если цена найдена, следующее значение может быть единицей
                    continue
                except:
                    pass
            
            # Ищем единицу измерения
            units = ['шт', 'кг', 'м', 'м²', 'м³', 'л', 'т', 'упак', 'мешок', 'рулон', 'м2', 'м3']
            val_lower = val_str.lower()
            for u in units:
                if u in val_lower:
                    unit = u
                    break
            
            if unit:
                break
        
        # Если цена не найдена, пропускаем товар
        if price is None:
            return None
        
        # Если единица не найдена, используем по умолчанию
        if not unit:
            unit = 'шт'
        
        return {
            'name': name,
            'price': price,
            'unit': unit,
            'category': category or 'Разное'
        }

