#!/bin/bash
# Скрипт для запуска backend сервера

cd "$(dirname "$0")"

echo "🚀 Запуск ZAKUP.ONE Backend..."
echo "================================"

# Проверяем наличие виртуального окружения
if [ ! -d "venv" ]; then
    echo "⚠️  Виртуальное окружение не найдено. Создаю..."
    python3 -m venv venv
fi

# Активируем виртуальное окружение
source venv/bin/activate

# Устанавливаем зависимости
echo "📦 Проверка зависимостей..."
pip install -q -r requirements.txt

# Проверяем наличие .env файла
if [ ! -f ".env" ]; then
    echo "⚠️  Файл .env не найден. Создаю базовый..."
    cat > .env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/zakup_db
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
EOF
fi

# Запускаем сервер
echo "✅ Запуск сервера на http://localhost:8000"
echo "📚 Документация API: http://localhost:8000/api/docs"
echo ""

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

