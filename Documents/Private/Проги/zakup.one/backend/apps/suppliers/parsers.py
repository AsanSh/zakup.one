import pandas as pd
import openpyxl
from openpyxl.styles import PatternFill
from typing import List, Dict, Optional, Any
import logging
import re
import math
import hashlib

logger = logging.getLogger(__name__)

# Цвет фона для категорий (золотисто-желтый и похожие оттенки)
# Формат: RGB в формате AARRGGBB (с префиксом FF для альфа-канала)
CATEGORY_BACKGROUND_COLORS = [
    'FFFFD700',  # Gold
    'FFFFFF00',  # Yellow
    'FFFFE4B5',  # Moccasin
    'FFFFDAB9',  # PeachPuff
    'FFFFE4E1',  # MistyRose
    'FFFFF8DC',  # Cornsilk
    'FFFFFACD',  # LemonChiffon
    'FFEEE8AA',  # PaleGoldenrod
    'FFDAA520',  # Goldenrod
    'FFB8860B',  # DarkGoldenrod
    'FFFFEBCD',  # BlanchedAlmond
    'FFFFEFD5',  # PapayaWhip
    'FFFFF5EE',  # Seashell
    'FFFFF8F0',  # FloralWhite
    'FFFFFFF0',  # Ivory
]

def is_category_color(fill) -> bool:
    """Проверяет, является ли цвет заливки цветом категории (золотисто-желтый)"""
    if not fill or fill.patternType != 'solid':
        return False
    
    if not fill.start_color:
        return False
    
    # Проверяем RGB цвет
    if hasattr(fill.start_color, 'rgb') and fill.start_color.rgb:
        rgb = str(fill.start_color.rgb).upper()
        
        # Убираем префикс FF если есть (формат AARRGGBB)
        rgb_clean = rgb[2:] if rgb.startswith('FF') and len(rgb) == 8 else rgb
        
        # Проверяем точное совпадение
        if rgb in CATEGORY_BACKGROUND_COLORS:
            return True
        
        # Проверяем без префикса альфа-канала
        if rgb_clean in [c[2:] if len(c) == 8 else c for c in CATEGORY_BACKGROUND_COLORS]:
            return True
        
        # Проверяем похожие оттенки (золотисто-желтые)
        # Извлекаем RGB компоненты
        if len(rgb_clean) == 6:
            try:
                r = int(rgb_clean[0:2], 16)
                g = int(rgb_clean[2:4], 16)
                b = int(rgb_clean[4:6], 16)
                
                # Золотисто-желтый: высокий R и G, низкий B
                # Пример: FFC000 (RGB: 255, 192, 0) - золотисто-желтый
                if r >= 200 and g >= 150 and b <= 100:
                    # Дополнительная проверка: G должен быть близок к R
                    if abs(r - g) < 100:
                        return True
            except ValueError:
                pass
    
    # Проверяем индекс цвета (для стандартных цветов Excel)
    if hasattr(fill.start_color, 'index') and fill.start_color.index is not None:
        color_index = fill.start_color.index
        # Индексы для желтых/золотых оттенков в Excel (расширенный диапазон)
        yellow_indices = list(range(44, 54))  # 44-53
        if color_index in yellow_indices:
            return True
    
    # Проверяем theme color (для тем Excel)
    if hasattr(fill.start_color, 'theme') and fill.start_color.theme is not None:
        # Theme 4 обычно соответствует желтым оттенкам
        if fill.start_color.theme in [4, 5, 6]:
            return True
    
    return False


class ExcelPriceListParser:
    """Парсер для Excel прайс-листов
    
    Правила определения категорий:
    - Если ячейка имеет цвет фона из списка CATEGORY_BACKGROUND_COLORS - это категория/подкатегория
    - Если в колонке 0 есть название, но в колонке 2 нет единицы измерения - это категория
    - Если в колонке 0 есть название И в колонке 2 есть единица измерения - это товар
    """
    
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.products = []
        self.categories = []
        self.current_category = None
        self.workbook = None
        self.worksheet = None
        
    def parse(self, sheet_name: str = None) -> Dict:
        """
        Парсит Excel файл и возвращает словарь с товарами и категориями
        
        Новый алгоритм:
        1. Ищет строку с заголовком "Товар | Ед.изм | Цена"
        2. Берет все строки до последней строки с ценой
        3. Определяет категории: строки без цены, но с названием (или с цветом фона категории)
        4. Определяет товары: строки с названием и ценой
        
        Возвращает:
        {
            'products': [{'name': str, 'article': str, 'unit': str, 'price': float, 'category': str}],
            'categories': [str],
            'total_products': int
        }
        """
        try:
            # Открываем Excel файл для чтения цветов
            logger.info(f"Чтение файла: {self.file_path}")
            self.workbook = openpyxl.load_workbook(self.file_path, data_only=True)
            if sheet_name:
                self.worksheet = self.workbook[sheet_name]
            else:
                self.worksheet = self.workbook.active
            
            # Читаем Excel файл через pandas для данных
            df = pd.read_excel(self.file_path, sheet_name=sheet_name, header=None, engine='openpyxl')
            logger.info(f"Файл прочитан. Строк: {len(df)}, Колонок: {len(df.columns) if len(df) > 0 else 0}")
            
            # Ищем строку с заголовком "Товар"
            header_row = self._find_header_row_new(df)
            
            if header_row is None:
                logger.warning("Не найдена строка с заголовком 'Товар'. Пробуем старый метод.")
                header_row = self._find_header_row(df)
                if header_row is None:
                    header_row = 8  # Fallback: строка 9 (0-based индекс 8)
            
            logger.info(f"Найдена строка заголовков: {header_row + 1} (индекс {header_row})")
            
            # Получаем индексы колонок
            header = df.iloc[header_row]
            try:
                product_col = header[header == "Товар"].index[0]
                unit_col = header[header == "Ед.изм"].index[0]
                price_col = header[header == "Цена"].index[0]
            except (IndexError, KeyError):
                # Если не нашли точные заголовки, пробуем найти по ключевым словам
                logger.warning("Не найдены точные заголовки. Пробуем найти по ключевым словам.")
                product_col, unit_col, price_col = self._find_columns_by_keywords(df, header_row)
            
            logger.info(f"Колонки: Товар={product_col}, Ед.изм={unit_col}, Цена={price_col}")
            
            # Находим последнюю строку с ценой
            price_series = df.iloc[:, price_col]
            last_price_idx = price_series.last_valid_index()
            if last_price_idx is None:
                logger.warning("Не найдена ни одна строка с ценой. Используем все строки после заголовка.")
                last_price_idx = len(df) - 1
            
            logger.info(f"Последняя строка с ценой: {last_price_idx + 1} (индекс {last_price_idx})")
            
            # Парсим данные
            self._parse_data_new(df, header_row + 1, last_price_idx + 1, product_col, unit_col, price_col)
            
            logger.info(f"Парсинг завершен. Товаров: {len(self.products)}, категорий: {len(self.categories)}")
            
            # Закрываем workbook
            if self.workbook:
                self.workbook.close()
            
            return {
                'products': self.products,
                'categories': self.categories,
                'total_products': len(self.products)
            }
            
        except Exception as e:
            logger.error(f"Ошибка парсинга Excel файла: {str(e)}", exc_info=True)
            if self.workbook:
                self.workbook.close()
            raise
    
    def _find_header_row_new(self, df: pd.DataFrame) -> Optional[int]:
        """Находит строку с заголовком 'Товар' (новый метод)"""
        for idx, row in df.iterrows():
            # Ищем строку, где в любой ячейке есть слово "Товар"
            if (df.iloc[idx] == "Товар").any():
                return idx
        return None
    
    def _find_header_row(self, df: pd.DataFrame) -> Optional[int]:
        """Находит строку с заголовками таблицы (старый метод)"""
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
    
    def _find_columns_by_keywords(self, df: pd.DataFrame, header_row: int) -> tuple:
        """Находит колонки по ключевым словам"""
        header = df.iloc[header_row]
        product_col = None
        unit_col = None
        price_col = None
        
        for idx, val in enumerate(header):
            val_str = str(val).lower().strip() if pd.notna(val) else ''
            if 'товар' in val_str and product_col is None:
                product_col = idx
            elif ('ед' in val_str or 'единиц' in val_str) and unit_col is None:
                unit_col = idx
            elif 'цена' in val_str and price_col is None:
                price_col = idx
        
        # Если не нашли, используем стандартные индексы
        if product_col is None:
            product_col = 0
        if unit_col is None:
            unit_col = 2
        if price_col is None:
            price_col = 3
        
        return product_col, unit_col, price_col
    
    def _to_str_or_none(self, value) -> Optional[str]:
        """Нормализуем строку: если NaN — вернём None, иначе обрежем пробелы."""
        if isinstance(value, float) and math.isnan(value):
            return None
        if value is None:
            return None
        s = str(value).strip()
        return s or None
    
    def _to_float_or_nan(self, value) -> float:
        """Пытаемся привести значение к float (с учётом пробелов и запятых)."""
        if isinstance(value, float) or isinstance(value, int):
            return float(value)
        
        if value is None:
            return float("nan")
        
        s = str(value).strip()
        if not s:
            return float("nan")
        
        s = s.replace(" ", "").replace(",", ".")
        try:
            return float(s)
        except ValueError:
            return float("nan")
    
    def _parse_data_new(self, df: pd.DataFrame, start_row: int, end_row: int, 
                       product_col: int, unit_col: int, price_col: int):
        """
        Новый метод парсинга данных
        
        Алгоритм:
        1. Строка без цены, но с названием — категория (или если цвет фона категории)
        2. Строка с названием и ценой — товар
        """
        current_category: Optional[str] = None
        
        # Берём только строки с данными (между заголовком и последней ценой)
        data = df.iloc[start_row:end_row].copy()
        
        for idx, row in data.iterrows():
            raw_name = row[product_col]
            raw_unit = row[unit_col]
            raw_price = row[price_col]
            
            name = self._to_str_or_none(raw_name)
            unit = self._to_str_or_none(raw_unit)
            price = self._to_float_or_nan(raw_price)
            
            is_price_nan = math.isnan(price)
            
            # Полностью пустая строка — пропускаем
            if not name and not unit and is_price_nan:
                continue
            
            # ПРИОРИТЕТ 1: Проверяем цвет фона ячейки (если есть название)
            is_category_by_color = False
            if name and self.worksheet:
                try:
                    # Excel строки начинаются с 1, а pandas индексы с 0
                    cell = self.worksheet.cell(row=idx+1, column=product_col+1)
                    fill = cell.fill
                    is_category_by_color = is_category_color(fill)
                    if is_category_by_color:
                        logger.debug(f"Найдена категория по цвету фона: '{name}'")
                except Exception as e:
                    logger.debug(f"Ошибка чтения цвета ячейки row={idx+1}, col={product_col+1}: {str(e)}")
            
            # Строка без цены, но с названием — считаем заголовком категории
            # ИЛИ если цвет фона указывает на категорию
            if name and (is_price_nan or is_category_by_color):
                current_category = name
                if current_category not in self.categories:
                    self.categories.append(current_category)
                logger.debug(f"Найдена категория: {current_category}")
                continue
            
            # Обычная товарная строка: есть название и цена
            if name and not is_price_nan:
                # Нормализуем единицу измерения
                unit_normalized = self._normalize_unit(unit) if unit else 'шт'
                
                # Генерируем артикул
                article = self._generate_article(name)
                
                product = {
                    'name': name,
                    'article': article,
                    'unit': unit_normalized,
                    'price': float(price),
                    'category': current_category
                }
                
                self.products.append(product)
                logger.debug(f"Извлечен товар: {name}, цена: {price}, единица: {unit_normalized}, категория: {current_category}")
        
        logger.info(f"Распознано товаров: {len(self.products)}, категорий: {len(self.categories)}")
        if len(self.products) == 0:
            logger.warning("Не найдено ни одного товара! Проверьте структуру файла.")
    
    def _parse_data(self, df: pd.DataFrame, start_row: int):
        """Парсит данные товаров из DataFrame
        
        Логика для Стройдвор (реальная структура файла):
        - Колонка 0 (индекс 0): название товара/категории
        - Колонка 1 (индекс 1): обычно пустая
        - Колонка 2 (индекс 2): единица измерения (для товаров) или может быть число (для категорий)
        - Колонка 3 (индекс 3): цена
        
        Правила определения категорий (в порядке приоритета):
        1. Если ячейка в колонке 0 имеет цвет фона из CATEGORY_BACKGROUND_COLORS - это категория
        2. Если в колонке 0 есть запись, но в колонке 2 нет единицы измерения - это категория
        3. Если в колонке 0 есть запись И в колонке 2 есть единица измерения - это товар
        """
        current_category = None
        
        for idx in range(start_row, len(df)):
            row = df.iloc[idx]
            
            # Пропускаем полностью пустые строки
            if row.isna().all():
                continue
            
            # Получаем значения конкретных колонок (по индексу)
            # Колонка 0 (индекс 0) - название товара/категории
            # Колонка 2 (индекс 2) - единица измерения
            # Колонка 3 (индекс 3) - цена
            
            col0_value = str(row.iloc[0]).strip() if len(row) > 0 and pd.notna(row.iloc[0]) else ''
            col2_value = str(row.iloc[2]).strip() if len(row) > 2 and pd.notna(row.iloc[2]) else ''
            col3_value = str(row.iloc[3]).strip() if len(row) > 3 and pd.notna(row.iloc[3]) else ''
            
            # Пропускаем строки, где нет названия
            if not col0_value:
                continue
            
            # ПРИОРИТЕТ 1: Проверяем цвет фона ячейки в колонке 0 (A)
            # Excel строки начинаются с 1, а pandas индексы с 0, поэтому idx+1
            is_category_by_color = False
            if self.worksheet:
                try:
                    cell = self.worksheet.cell(row=idx+1, column=1)  # Колонка A (1)
                    fill = cell.fill
                    is_category_by_color = is_category_color(fill)
                    if is_category_by_color:
                        color_info = 'unknown'
                        if hasattr(fill.start_color, 'rgb') and fill.start_color.rgb:
                            color_info = fill.start_color.rgb
                        elif hasattr(fill.start_color, 'index'):
                            color_info = f'index={fill.start_color.index}'
                        logger.debug(f"Найдена категория по цвету фона: '{col0_value}', цвет: {color_info}")
                except Exception as e:
                    logger.debug(f"Ошибка чтения цвета ячейки row={idx+1}, col=1: {str(e)}")
            
            # Если ячейка имеет цвет категории - это категория, пропускаем проверку единицы измерения
            if is_category_by_color:
                current_category = col0_value
                if current_category not in self.categories:
                    self.categories.append(current_category)
                logger.debug(f"Найдена категория (по цвету): {current_category}")
                continue
            
            # ПРИОРИТЕТ 2: Проверяем, является ли значение в колонке 2 единицей измерения
            is_unit = self._is_unit_measurement(col2_value)
            
            # Определяем тип строки по логике
            # Если есть название (колонка 0), но нет единицы измерения в колонке 2 - это категория
            if col0_value and not is_unit:
                # Это категория
                current_category = col0_value
                if current_category not in self.categories:
                    self.categories.append(current_category)
                logger.debug(f"Найдена категория (по отсутствию единицы): {current_category}")
                
            # Если есть название (колонка 0) И есть единица измерения в колонке 2 - это товар
            elif col0_value and is_unit:
                # Это товар
                product = self._extract_product_stroydvor(row, current_category)
                if product:
                    self.products.append(product)
        
        logger.info(f"Распознано товаров: {len(self.products)}, категорий: {len(self.categories)}")
        if len(self.products) == 0:
            logger.warning("Не найдено ни одного товара! Проверьте структуру файла.")
    
    def _is_unit_measurement(self, value: str) -> bool:
        """Проверяет, является ли значение единицей измерения"""
        if not value:
            return False
        
        value_upper = value.strip().upper()
        
        # Список единиц измерения
        units = ['ШТ', 'ШТУК', 'ШТУКИ', 'М', 'МЕТР', 'МЕТРЫ', 'М2', 'М²', 'М.КВ', 'М.КВ.', 'КВ.М', 'КВ.М.', 
                 'М3', 'М³', 'М.КУБ', 'М.КУБ.', 'КГ', 'КИЛОГРАММ', 'КИЛОГРАММЫ', 'Т', 'ТОННА', 'ТОННЫ',
                 'Л', 'ЛИТР', 'ЛИТРЫ', 'МЛ', 'МИЛЛИЛИТР']
        
        if value_upper in units:
            return True
        
        # Проверка по содержимому
        if 'шт' in value.lower():
            return True
        elif 'м²' in value or 'м2' in value.upper() or ('кв' in value.lower() and 'м' in value.lower()):
            return True
        elif 'м³' in value or 'м3' in value.upper() or 'куб' in value.lower():
            return True
        elif 'кг' in value.lower():
            return True
        elif 'т' in value.lower() and ('тонн' in value.lower() or len(value) <= 3):
            return True
        elif 'л' in value.lower() and 'мл' not in value.lower():
            return True
        elif 'мл' in value.lower():
            return True
        elif 'м' in value.lower() and len(value) <= 5:  # Короткие значения с "м" могут быть единицами
            return True
        
        # Если это число, это не единица измерения
        try:
            float(re.sub(r'[^\d.]', '', value))
            return False
        except:
            pass
        
        return False
    
    
    def _extract_product_stroydvor(self, row: pd.Series, category: Optional[str]) -> Optional[Dict]:
        """Извлекает данные товара из строки для формата Стройдвор
        
        Структура (реальная):
        - Колонка 0 (индекс 0): название товара
        - Колонка 2 (индекс 2): единица измерения
        - Колонка 3 (индекс 3): цена
        """
        try:
            # Получаем значения по индексам колонок
            product_name = str(row.iloc[0]).strip() if len(row) > 0 and pd.notna(row.iloc[0]) else ''
            unit_raw = str(row.iloc[2]).strip() if len(row) > 2 and pd.notna(row.iloc[2]) else ''
            price_raw = str(row.iloc[3]).strip() if len(row) > 3 and pd.notna(row.iloc[3]) else ''
            
            if not product_name:
                return None
            
            if not unit_raw or not self._is_unit_measurement(unit_raw):
                # Если нет единицы измерения, это не товар (должно быть обработано как категория)
                logger.debug(f"Пропущена строка без единицы измерения: {product_name}, col2={unit_raw}")
                return None
            
            # Парсим цену
            price = None
            try:
                # Убираем пробелы и пробуем преобразовать в число
                clean_price = re.sub(r'[\s]', '', price_raw)  # Убираем пробелы
                # Пробуем извлечь число (может быть с разделителями тысяч)
                numbers = re.findall(r'\d+[.,]?\d*', clean_price)
                if numbers:
                    # Берем первое число
                    num_str = numbers[0].replace(',', '.')
                    price = float(num_str)
            except Exception as e:
                logger.debug(f"Не удалось распарсить цену из '{price_raw}': {str(e)}")
            
            if price is None or price <= 0:
                logger.debug(f"Не найдена валидная цена в строке: название={product_name}, цена={price_raw}")
                return None
            
            # Нормализуем единицу измерения
            unit = self._normalize_unit(unit_raw)
            
            # Генерируем артикул из названия
            article = self._generate_article(product_name)
            
            product = {
                'name': product_name,
                'article': article,
                'unit': unit,
                'price': price,
                'category': category
            }
            
            logger.debug(f"Извлечен товар: {product_name}, цена: {price}, единица: {unit}, категория: {category}")
            return product
            
        except Exception as e:
            logger.error(f"Ошибка извлечения товара из строки: {str(e)}")
            return None
    
    def _normalize_unit(self, unit_raw: str) -> str:
        """Нормализует единицу измерения к стандартному формату"""
        unit_upper = unit_raw.strip().upper()
        
        # Прямые совпадения
        unit_map = {
            'ШТ': 'шт',
            'ШТУК': 'шт',
            'ШТУКИ': 'шт',
            'М': 'м',
            'МЕТР': 'м',
            'МЕТРЫ': 'м',
            'М2': 'м²',
            'М²': 'м²',
            'М.КВ': 'м²',
            'М.КВ.': 'м²',
            'КВ.М': 'м²',
            'КВ.М.': 'м²',
            'М3': 'м³',
            'М³': 'м³',
            'М.КУБ': 'м³',
            'М.КУБ.': 'м³',
            'КГ': 'кг',
            'КИЛОГРАММ': 'кг',
            'КИЛОГРАММЫ': 'кг',
            'Т': 'т',
            'ТОННА': 'т',
            'ТОННЫ': 'т',
            'Л': 'л',
            'ЛИТР': 'л',
            'ЛИТРЫ': 'л',
            'МЛ': 'мл',
            'МИЛЛИЛИТР': 'мл',
        }
        
        if unit_upper in unit_map:
            return unit_map[unit_upper]
        
        # Проверка по содержимому
        if 'шт' in unit_raw.lower():
            return 'шт'
        elif 'м²' in unit_raw or 'м2' in unit_raw.upper() or 'кв' in unit_raw.lower():
            return 'м²'
        elif 'м³' in unit_raw or 'м3' in unit_raw.upper() or 'куб' in unit_raw.lower():
            return 'м³'
        elif 'кг' in unit_raw.lower():
            return 'кг'
        elif 'т' in unit_raw.lower() and 'тонн' in unit_raw.lower():
            return 'т'
        elif 'л' in unit_raw.lower() and 'мл' not in unit_raw.lower():
            return 'л'
        elif 'мл' in unit_raw.lower():
            return 'мл'
        elif 'м' in unit_raw.lower():
            return 'м'
        
        # По умолчанию
        return unit_raw.lower()
    
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

