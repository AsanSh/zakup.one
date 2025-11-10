#!/bin/bash

# Скрипт инициализации PostgreSQL для ZAKUP.ONE

echo "🚀 Инициализация PostgreSQL для ZAKUP.ONE"
echo ""

# Проверка PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL не установлен!"
    echo ""
    echo "Установите PostgreSQL:"
    echo "  brew install postgresql@14"
    exit 1
fi

echo "✅ PostgreSQL найден"
echo ""

# Запуск PostgreSQL
echo "🔄 Запуск PostgreSQL..."
if brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null; then
    echo "✅ PostgreSQL запущен"
else
    echo "⚠️  Не удалось запустить автоматически"
    echo "Попробуйте вручную: brew services start postgresql@14"
fi

# Ждем запуска
echo "⏳ Ожидание запуска PostgreSQL..."
sleep 5

# Проверка готовности
if pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "✅ PostgreSQL готов к работе"
else
    echo "❌ PostgreSQL не отвечает"
    echo "Проверьте вручную: pg_isready -h localhost -p 5432"
    exit 1
fi

echo ""

# Создание базы данных
echo "📦 Создание базы данных zakup_db..."
if createdb zakup_db 2>/dev/null; then
    echo "✅ База данных zakup_db создана"
elif psql -lqt | cut -d \| -f 1 | grep -qw zakup_db; then
    echo "ℹ️  База данных zakup_db уже существует"
else
    echo "⚠️  Ошибка при создании базы данных"
    echo "Попробуйте создать вручную:"
    echo "  psql postgres -c 'CREATE DATABASE zakup_db;'"
fi

echo ""
echo "✅ Инициализация завершена!"
echo ""
echo "Следующие шаги:"
echo "1. Проверьте настройки в файле .env (пароль PostgreSQL)"
echo "2. Выполните миграции: alembic upgrade head"
echo "3. Создайте админа: python3 create_admin_simple.py"
echo "4. Запустите backend: python3 run.py"
echo ""

