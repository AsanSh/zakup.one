#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Пример использования парсера прайс-листа
"""

from price_list_parser import PriceListParser, parse_price_list

# Пример 1: Простое использование функции
print("="*60)
print("Пример 1: Простое использование функции")
print("="*60)

products = parse_price_list("прайс-лист-01.10.25.xlsx")
print(f"Найдено товаров: {len(products)}")
print(f"Первый товар: {products[0]}")

# Пример 2: Использование класса с дополнительными возможностями
print("\n" + "="*60)
print("Пример 2: Использование класса")
print("="*60)

parser = PriceListParser("прайс-лист-01.10.25.xlsx")
products = parser.parse()

print(f"Всего товаров: {len(products)}")

# Поиск товаров по названию
print("\nПоиск товаров содержащих 'ДВП':")
dsp_products = parser.get_products_by_name("ДВП")
print(f"Найдено: {len(dsp_products)}")
for product in dsp_products[:5]:
    print(f"  - {product['название']}: {product['цена']} {product['единица_измерения']}")

# Поиск товаров по диапазону цен
print("\nТовары с ценой от 1000 до 2000:")
price_range_products = parser.get_products_by_price_range(min_price=1000, max_price=2000)
print(f"Найдено: {len(price_range_products)}")
for product in price_range_products[:5]:
    print(f"  - {product['название']}: {product['цена']}")

# Сохранение в разные форматы
print("\n" + "="*60)
print("Сохранение данных")
print("="*60)

json_path = parser.save_to_json("products_output.json")
print(f"Сохранено в JSON: {json_path}")

csv_path = parser.save_to_csv("products_output.csv")
print(f"Сохранено в CSV: {csv_path}")


