#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для парсинга прайс-листа из Excel файла
"""

import pandas as pd
import sys
from pathlib import Path

def analyze_excel_structure(file_path):
    """Анализирует структуру Excel файла"""
    print(f"Анализ файла: {file_path}\n")
    
    try:
        # Читаем все листы
        excel_file = pd.ExcelFile(file_path)
        print(f"Найдено листов: {len(excel_file.sheet_names)}")
        print(f"Названия листов: {excel_file.sheet_names}\n")
        
        # Анализируем каждый лист
        for sheet_name in excel_file.sheet_names:
            print(f"{'='*60}")
            print(f"Лист: {sheet_name}")
            print(f"{'='*60}")
            
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            print(f"\nРазмер данных: {df.shape[0]} строк, {df.shape[1]} столбцов")
            print(f"\nСтолбцы:")
            for i, col in enumerate(df.columns, 1):
                print(f"  {i}. {col}")
            
            print(f"\nПервые 10 строк:")
            print(df.head(10).to_string())
            
            print(f"\nИнформация о данных:")
            print(df.info())
            
            print(f"\nПримеры данных по столбцам:")
            for col in df.columns:
                non_null_count = df[col].notna().sum()
                print(f"  {col}: {non_null_count} непустых значений")
                if non_null_count > 0:
                    sample = df[col].dropna().head(3).tolist()
                    print(f"    Примеры: {sample}")
            
            print("\n")
        
    except Exception as e:
        print(f"Ошибка при чтении файла: {e}")
        import traceback
        traceback.print_exc()

def parse_products(file_path, sheet_name=None, header_row=7, start_row=8):
    """Парсит товары из Excel файла
    
    Args:
        file_path: путь к файлу Excel
        sheet_name: название листа (None для первого листа)
        header_row: номер строки с заголовками (0-based индекс)
        start_row: номер строки, с которой начинаются данные (0-based индекс)
    """
    try:
        # Читаем файл без заголовков, чтобы иметь полный контроль
        if sheet_name is None:
            df = pd.read_excel(file_path, sheet_name=0, header=None)
        else:
            df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
        
        # Получаем заголовки из указанной строки
        # В файле заголовки находятся в столбцах 0, 2, 3: "Товар", "Ед.изм", "Цена"
        if header_row < len(df):
            header_row_data = df.iloc[header_row]
            # Определяем названия столбцов
            col_name = header_row_data.iloc[0] if pd.notna(header_row_data.iloc[0]) else "Товар"
            col_unit = header_row_data.iloc[2] if pd.notna(header_row_data.iloc[2]) else "Ед.изм"
            col_price = header_row_data.iloc[3] if pd.notna(header_row_data.iloc[3]) else "Цена"
            
            headers = {
                0: str(col_name).strip(),
                2: str(col_unit).strip(),
                3: str(col_price).strip()
            }
        else:
            headers = {0: "Товар", 2: "Ед.изм", 3: "Цена"}
        
        # Извлекаем данные начиная с указанной строки
        if start_row < len(df):
            data_df = df.iloc[start_row:].copy()
        else:
            data_df = pd.DataFrame()
        
        # Удаляем полностью пустые строки
        data_df = data_df.dropna(how='all')
        
        # Парсим товары
        products = []
        
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
                products.append(product)
        
        return products, list(headers.values())
        
    except Exception as e:
        print(f"Ошибка при парсинге: {e}")
        import traceback
        traceback.print_exc()
        return [], []

def main():
    # Путь к файлу
    file_path = Path(__file__).parent / "прайс-лист-01.10.25.xlsx"
    
    if not file_path.exists():
        print(f"Файл не найден: {file_path}")
        sys.exit(1)
    
    print("="*60)
    print("АНАЛИЗ СТРУКТУРЫ ФАЙЛА")
    print("="*60)
    analyze_excel_structure(file_path)
    
    print("\n" + "="*60)
    print("ПАРСИНГ ТОВАРОВ")
    print("="*60)
    
    products, columns = parse_products(file_path)
    
    print(f"\nНайдено товаров: {len(products)}")
    print(f"\nСтолбцы: {columns}")
    
    if products:
        print(f"\nПервые 5 товаров:")
        for i, product in enumerate(products[:5], 1):
            print(f"\nТовар {i}:")
            print(f"  Название: {product['название']}")
            print(f"  Единица измерения: {product['единица_измерения']}")
            print(f"  Цена: {product['цена']}")
        
        print(f"\nПоследние 3 товара:")
        for i, product in enumerate(products[-3:], len(products)-2):
            print(f"\nТовар {i}:")
            print(f"  Название: {product['название']}")
            print(f"  Единица измерения: {product['единица_измерения']}")
            print(f"  Цена: {product['цена']}")
        
        # Сохраняем в JSON для удобства
        import json
        output_file = Path(__file__).parent / "products.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        print(f"\nТовары сохранены в файл: {output_file}")

if __name__ == "__main__":
    main()

