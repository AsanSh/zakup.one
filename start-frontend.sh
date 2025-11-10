#!/bin/bash
echo "Запуск фронтенда ZAKUP.ONE"
echo ""
echo "Переход в директорию frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей..."
    npm install
    echo ""
fi

echo "Запуск dev сервера на порту 5467..."
echo "Фронтенд будет доступен на: http://localhost:5467"
echo ""
npm run dev
