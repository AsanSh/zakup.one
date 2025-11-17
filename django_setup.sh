#!/bin/bash
# Скрипт для создания структуры Django проекта

echo "🔄 Создание структуры Django проекта..."

# Создаем директории
mkdir -p zakup_one_django
cd zakup_one_django

# Создаем виртуальное окружение (опционально)
# python3 -m venv venv
# source venv/bin/activate

# Устанавливаем Django
pip install Django djangorestframework django-cors-headers djangorestframework-simplejwt

# Создаем Django проект
django-admin startproject zakup_one .

# Создаем приложения
python manage.py startapp users
python manage.py startapp products
python manage.py startapp orders
python manage.py startapp admin_panel

echo "✅ Структура Django проекта создана!"
echo "📁 Расположение: $(pwd)"

