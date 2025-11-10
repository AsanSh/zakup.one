"""
Парсер прайс-листа Стройдвор
Анализирует структуру Excel файла и парсит товары с категориями
"""
import pandas as pd
from pathlib import Path
import sys

def analyze_excel_structure(file_path: str):
    """Анализирует структуру Excel файла"""
    print(f"Анализ файла: {file_path}")
    print("=" * 80)
    
    try:
        # Читаем все листы
        xls = pd.ExcelFile(file_path)
        print(f"Листы в файле: {xls.sheet_names}")
        print()
        
        # Анализируем каждый лист
        for sheet_name in xls.sheet_names:
            print(f"\n{'='*80}")
            print(f"Лист: {sheet_name}")
            print(f"{'='*80}")
            
            df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
            print(f"Размер: {df.shape[0]} строк, {df.shape[1]} колонок")
            print()
            
            # Показываем первые 20 строк
            print("Первые 20 строк:")
            print(df.head(20).to_string())
            print()
            
            # Ищем строку с заголовками
            print("Поиск заголовков...")
            for i in range(min(15, len(df))):
                row = df.iloc[i]
                non_null = row.dropna()
                if len(non_null) >= 3:
                    print(f"Строка {i}: {list(non_null.values[:5])}")
            
    except Exception as e:
        print(f"Ошибка: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    file_path = "stroydvor_price_list.xlsx"
    if not Path(file_path).exists():
        print(f"Файл {file_path} не найден!")
        sys.exit(1)
    
    analyze_excel_structure(file_path)

