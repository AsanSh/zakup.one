#!/bin/bash

# Скрипт для настройки PostgreSQL для проекта ZAKUP.ONE

echo "🔧 Настройка PostgreSQL для ZAKUP.ONE"
echo ""

# Проверка наличия PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL не установлен!"
    echo ""
    echo "Установите PostgreSQL:"
    echo "  macOS: brew install postgresql@14"
    echo "  Linux: sudo apt-get install postgresql"
    exit 1
fi

echo "✅ PostgreSQL найден"
echo ""

# Проверка запуска PostgreSQL
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "⚠️  PostgreSQL не запущен!"
    echo ""
    echo "Запустите PostgreSQL:"
    echo "  macOS: brew services start postgresql@14"
    echo "  Linux: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL запущен"
echo ""

# Создание базы данных
echo "📦 Создание базы данных zakup_db..."
createdb zakup_db 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ База данных zakup_db создана"
elif [ $? -eq 2 ]; then
    echo "ℹ️  База данных zakup_db уже существует"
else
    echo "❌ Ошибка при создании базы данных"
    echo "Попробуйте создать вручную:"
    echo "  psql postgres -c 'CREATE DATABASE zakup_db;'"
    exit 1
fi

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "Следующие шаги:"
echo "1. Проверьте настройки в файле .env"
echo "2. Выполните миграции: alembic upgrade head"
echo "3. Создайте админа: python3 create_admin_simple.py"
echo "4. Запустите backend: python3 run.py"
echo ""

