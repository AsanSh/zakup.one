#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Модуль для парсинга прайс-листа из Excel файла
"""

import pandas as pd
from pathlib import Path
from typing import List, Dict, Optional


class PriceListParser:
    """Класс для парсинга прайс-листов из Excel файлов"""
    
    def __init__(self, file_path: str, sheet_name: Optional[str] = None, 
                 header_row: int = 7, start_row: int = 8):
        """
        Инициализация парсера
        
        Args:
            file_path: путь к файлу Excel
            sheet_name: название листа (None для первого листа)
            header_row: номер строки с заголовками (0-based индекс)
            start_row: номер строки, с которой начинаются данные (0-based индекс)
        """
        self.file_path = Path(file_path)
        self.sheet_name = sheet_name
        self.header_row = header_row
        self.start_row = start_row
        self.products = []
        self.headers = {}
        
        if not self.file_path.exists():
            raise FileNotFoundError(f"Файл не найден: {self.file_path}")
    
    def parse(self) -> List[Dict]:
        """
        Парсит товары из Excel файла
        
        Returns:
            Список словарей с товарами, каждый содержит:
            - название: str
            - единица_измерения: str
            - цена: float или None
        """
        try:
            # Читаем файл без заголовков, чтобы иметь полный контроль
            if self.sheet_name is None:
                df = pd.read_excel(self.file_path, sheet_name=0, header=None)
            else:
                df = pd.read_excel(self.file_path, sheet_name=self.sheet_name, header=None)
            
            # Получаем заголовки из указанной строки
            # В файле заголовки находятся в столбцах 0, 2, 3: "Товар", "Ед.изм", "Цена"
            if self.header_row < len(df):
                header_row_data = df.iloc[self.header_row]
                # Определяем названия столбцов
                col_name = header_row_data.iloc[0] if pd.notna(header_row_data.iloc[0]) else "Товар"
                col_unit = header_row_data.iloc[2] if pd.notna(header_row_data.iloc[2]) else "Ед.изм"
                col_price = header_row_data.iloc[3] if pd.notna(header_row_data.iloc[3]) else "Цена"
                
                self.headers = {
                    0: str(col_name).strip(),
                    2: str(col_unit).strip(),
                    3: str(col_price).strip()
                }
            else:
                self.headers = {0: "Товар", 2: "Ед.изм", 3: "Цена"}
            
            # Извлекаем данные начиная с указанной строки
            if self.start_row < len(df):
                data_df = df.iloc[self.start_row:].copy()
            else:
                data_df = pd.DataFrame()
            
            # Удаляем полностью пустые строки
            data_df = data_df.dropna(how='all')
            
            # Парсим товары
            self.products = []
            
            for index, row in data_df.iterrows():
                # Получаем данные из нужных столбцов (0, 2, 3)
                product_name = row.iloc[0] if len(row) > 0 else None
                unit = row.iloc[2] if len(row) > 2 else None
                price = row.iloc[3] if len(row) > 3 else None
                
                # Пропускаем строки, которые не содержат название товара
                if pd.isna(product_name) or str(product_name).strip() == '':
                    continue
                
                # Пропускаем служебные строки
                product_name_str = str(product_name).strip()
                if any(keyword in product_name_str.lower() for keyword in ['товар', 'сайт', 'прайс', 'скидк']):
                    continue
                
                # Определяем единицу измерения и цену
                # Иногда цена может быть в столбце единицы измерения
                unit_str = str(unit).strip() if pd.notna(unit) else ''
                price_value = price
                
                # Если в столбце единицы измерения число, а цена пустая, то это может быть цена
                if pd.isna(price_value) and unit_str and unit_str.isdigit():
                    # Проверяем, не является ли это ценой
                    try:
                        price_value = float(unit_str)
                        unit_str = ''  # Если это была цена, то единица измерения пустая
                    except ValueError:
                        pass
                
                # Преобразуем цену в число, если возможно
                try:
                    if pd.notna(price_value):
                        price_str = str(price_value).replace(',', '.').strip()
                        price_value = float(price_str) if price_str else None
                    else:
                        price_value = None
                except (ValueError, AttributeError):
                    price_value = None
                
                product = {
                    'название': product_name_str,
                    'единица_измерения': unit_str,
                    'цена': price_value
                }
                
                # Добавляем только товары с названием
                if product['название']:
                    self.products.append(product)
            
            return self.products
            
        except Exception as e:
            raise Exception(f"Ошибка при парсинге: {e}")
    
    def get_products(self) -> List[Dict]:
        """Возвращает список товаров"""
        if not self.products:
            self.parse()
        return self.products
    
    def get_products_by_name(self, name_pattern: str, case_sensitive: bool = False) -> List[Dict]:
        """
        Находит товары по названию (частичное совпадение)
        
        Args:
            name_pattern: паттерн для поиска в названии
            case_sensitive: учитывать регистр при поиске
        
        Returns:
            Список найденных товаров
        """
        products = self.get_products()
        if case_sensitive:
            return [p for p in products if name_pattern in p['название']]
        else:
            name_pattern_lower = name_pattern.lower()
            return [p for p in products if name_pattern_lower in p['название'].lower()]
    
    def get_products_by_price_range(self, min_price: float = None, max_price: float = None) -> List[Dict]:
        """
        Находит товары в указанном диапазоне цен
        
        Args:
            min_price: минимальная цена (None для отсутствия ограничения)
            max_price: максимальная цена (None для отсутствия ограничения)
        
        Returns:
            Список найденных товаров
        """
        products = self.get_products()
        result = []
        
        for product in products:
            price = product.get('цена')
            if price is None:
                continue
            
            if min_price is not None and price < min_price:
                continue
            if max_price is not None and price > max_price:
                continue
            
            result.append(product)
        
        return result
    
    def save_to_json(self, output_path: str = None):
        """
        Сохраняет товары в JSON файл
        
        Args:
            output_path: путь к выходному файлу (None для автоматического имени)
        """
        import json
        
        if output_path is None:
            output_path = self.file_path.parent / "products.json"
        else:
            output_path = Path(output_path)
        
        products = self.get_products()
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
        return output_path
    
    def save_to_csv(self, output_path: str = None):
        """
        Сохраняет товары в CSV файл
        
        Args:
            output_path: путь к выходному файлу (None для автоматического имени)
        """
        if output_path is None:
            output_path = self.file_path.parent / "products.csv"
        else:
            output_path = Path(output_path)
        
        products = self.get_products()
        df = pd.DataFrame(products)
        df.to_csv(output_path, index=False, encoding='utf-8-sig')
        
        return output_path


def parse_price_list(file_path: str, **kwargs) -> List[Dict]:
    """
    Удобная функция для быстрого парсинга прайс-листа
    
    Args:
        file_path: путь к файлу Excel
        **kwargs: дополнительные параметры для PriceListParser
    
    Returns:
        Список товаров
    """
    parser = PriceListParser(file_path, **kwargs)
    return parser.parse()


if __name__ == "__main__":
    # Пример использования
    file_path = Path(__file__).parent / "прайс-лист-01.10.25.xlsx"
    
    if file_path.exists():
        parser = PriceListParser(file_path)
        products = parser.parse()
        
        print(f"Найдено товаров: {len(products)}")
        print(f"\nПервые 3 товара:")
        for i, product in enumerate(products[:3], 1):
            print(f"{i}. {product['название']} - {product['цена']} ({product['единица_измерения']})")
        
        # Сохраняем в JSON
        json_path = parser.save_to_json()
        print(f"\nТовары сохранены в: {json_path}")
        
        # Сохраняем в CSV
        csv_path = parser.save_to_csv()
        print(f"Товары сохранены в: {csv_path}")
    else:
        print(f"Файл не найден: {file_path}")


