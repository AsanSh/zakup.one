"""
Парсер прайс-листа Стройдвор
Специальный парсер для формата Excel от stroydvor.kg

Структура файла:
- Строка 8: Заголовки ['Товар', nan, 'Ед.изм', 'Цена']
- Колонка 0: Название товара или категория
- Колонка 1: пустая
- Колонка 2: Единица измерения (шт, кг и т.д.) ИЛИ цена (если это категория)
- Колонка 3: Цена (если есть единица измерения в колонке 2)

Категории: в колонке 0 название, в колонке 2 число (цена), в колонке 3 пусто
Товары: в колонке 0 название, в колонке 2 единица измерения, в колонке 3 цена
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
            Список словарей с товарами в формате:
            {
                'name': str,
                'price': float,
                'unit': str,
                'category': str
            }
        """
        try:
            # Читаем Excel файл
            df = pd.read_excel(self.file_path, sheet_name=0, header=None)
            
            products = []
            current_category = None
            header_row = None
            
            # Ищем строку с заголовками (обычно строка 8, индекс 8)
            for idx in range(min(15, len(df))):
                row_text = ' '.join([
                    str(val).lower() if pd.notna(val) else '' 
                    for val in df.iloc[idx].values
                ])
                if 'товар' in row_text and ('ед' in row_text or 'изм' in row_text) and 'цена' in row_text:
                    header_row = idx
                    break
            
            if header_row is None:
                header_row = 8  # По умолчанию
            
            # Проходим по всем строкам начиная с заголовков
            for idx in range(header_row + 1, len(df)):
                row = df.iloc[idx]
                
                # Получаем значения колонок
                col0 = str(row.iloc[0]).strip() if pd.notna(row.iloc[0]) and len(row) > 0 else ''
                col2 = str(row.iloc[2]).strip() if len(row) > 2 and pd.notna(row.iloc[2]) else ''
                col3 = str(row.iloc[3]).strip() if len(row) > 3 and pd.notna(row.iloc[3]) else ''
                
                # Пропускаем пустые строки
                if not col0:
                    continue
                
                # Проверяем, является ли строка категорией
                # Категория: в колонке 0 название, в колонке 2 число (цена), в колонке 3 пусто
                if self._is_category_row(col0, col2, col3):
                    current_category = col0
                    continue
                
                # Парсим товар
                product = self._parse_product_row(col0, col2, col3, current_category)
                if product:
                    products.append(product)
            
            return products
            
        except Exception as e:
            print(f"Ошибка парсинга: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def _is_category_row(self, col0: str, col2: str, col3: str) -> bool:
        """
        Проверяет, является ли строка категорией
        
        Категория определяется так:
        - В колонке 0 есть название (ДВП, ДСП, ОСП и т.д.)
        - В колонке 2 число (цена категории), а в колонке 3 пусто
        - Название короткое (обычно 2-10 символов) и не содержит размеры/характеристики
        """
        if not col0 or len(col0) < 2:
            return False
        
        # Если колонка 3 не пустая, это не категория
        if col3 and col3.strip():
            return False
        
        # Проверяем, является ли col2 числом (цена категории)
        # Категория имеет цену в колонке 2, но не единицу измерения
        if col2 and col2.strip():
            # Проверяем, является ли это числом (может быть с пробелами)
            col2_clean = col2.replace(' ', '').replace(',', '.')
            try:
                float(col2_clean)
                # Если это число, проверяем что это не единица измерения
                units = ['шт', 'кг', 'м', 'м²', 'м³', 'л', 'т', 'упак', 'мешок', 'рулон', 'м2', 'м3']
                col2_lower = col2.lower()
                if any(unit in col2_lower for unit in units):
                    return False  # Это единица измерения, не категория
                # Это число и не единица измерения - вероятно категория
                # Но нужно проверить, что название не слишком длинное (категории обычно короткие)
                if len(col0) <= 20 and not re.search(r'\d+[хx]\d+', col0.lower()):
                    # Название короткое и не содержит размеры (например, "2,5х1700")
                    return True
            except ValueError:
                pass
        
        return False
    
    def _parse_product_row(self, col0: str, col2: str, col3: str, category: Optional[str] = None) -> Optional[Dict]:
        """
        Парсит строку с товаром
        
        Args:
            col0: Название товара
            col2: Единица измерения или пусто
            col3: Цена или пусто
            category: Текущая категория
        
        Returns:
            Словарь с данными товара или None
        """
        if not col0 or len(col0) < 2:
            return None
        
        # Единицы измерения
        units = ['шт', 'кг', 'м', 'м²', 'м³', 'л', 'т', 'упак', 'мешок', 'рулон', 'м2', 'м3']
        
        # Определяем единицу измерения и цену
        unit = None
        price = None
        
        # Проверяем колонку 2 - может быть единица измерения
        if col2 and col2.strip():
            col2_lower = col2.lower()
            # Проверяем, является ли это единицей измерения
            for u in units:
                if u in col2_lower:
                    unit = u
                    break
            
            # Если не единица измерения, возможно это цена (для старых форматов)
            if not unit:
                try:
                    col2_clean = col2.replace(' ', '').replace(',', '.')
                    price = float(col2_clean)
                except ValueError:
                    pass
        
        # Проверяем колонку 3 - должна быть цена, если есть единица измерения
        if col3 and col3.strip():
            try:
                col3_clean = col3.replace(' ', '').replace(',', '.')
                price = float(col3_clean)
            except ValueError:
                pass
        
        # Если цена не найдена, пропускаем товар
        if price is None:
            return None
        
        # Если единица не найдена, используем по умолчанию
        if not unit:
            unit = 'шт'
        
        return {
            'name': col0,
            'price': price,
            'unit': unit,
            'category': category or 'Разное'
        }

