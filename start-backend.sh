#!/bin/bash
# Скрипт для запуска backend

echo "Запуск Backend ZAKUP.ONE..."
echo ""

# Проверка зависимостей
if ! python3 -c "import uvicorn" 2>/dev/null; then
    echo "⚠️  Установка зависимостей..."
    pip install -q -r requirements.txt
fi

# Проверка .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден. Создаю из .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Файл .env создан. Отредактируйте его и укажите правильные данные БД."
    else
        echo "❌ .env.example не найден!"
    fi
fi

echo "Запуск backend на http://localhost:8000"
echo "API документация: http://localhost:8000/api/docs"
echo ""
python3 run.py

