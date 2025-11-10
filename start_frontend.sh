#!/bin/bash
# Скрипт для запуска frontend сервера

cd "$(dirname "$0")/frontend"

echo "🚀 Запуск ZAKUP.ONE Frontend..."
echo "================================"

# Проверяем наличие node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
fi

# Запускаем dev сервер
echo "✅ Запуск сервера на http://localhost:5467"
echo ""

npm run dev

