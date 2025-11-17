#!/bin/bash
# Автоматическая проверка проекта

set -e

echo "============================================================"
echo "АВТОМАТИЧЕСКАЯ ПРОВЕРКА ПРОЕКТА"
echo "============================================================"

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для проверки команды
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 установлен${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 не установлен${NC}"
        return 1
    fi
}

# Проверка зависимостей
echo ""
echo "1. Проверка зависимостей системы..."
check_command python3
check_command pip3
check_command node
check_command npm

# Проверка структуры проекта
echo ""
echo "2. Проверка структуры проекта..."
python3 check_project.py || echo -e "${YELLOW}⚠️  Некоторые проверки не прошли (это нормально если зависимости не установлены)${NC}"

# Проверка Python зависимостей
echo ""
echo "3. Проверка Python зависимостей..."
if [ -d "venv" ]; then
    echo -e "${GREEN}✅ Виртуальное окружение найдено${NC}"
    source venv/bin/activate
    pip list | grep -i fastapi && echo -e "${GREEN}✅ FastAPI установлен${NC}" || echo -e "${RED}❌ FastAPI не установлен${NC}"
else
    echo -e "${YELLOW}⚠️  Виртуальное окружение не найдено${NC}"
    echo "   Создайте его: python3 -m venv venv"
fi

# Проверка frontend
echo ""
echo "4. Проверка frontend..."
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅ node_modules найдены${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules не найдены${NC}"
    echo "   Установите: cd frontend && npm install"
fi

# Проверка .env
echo ""
echo "5. Проверка конфигурации..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env файл найден${NC}"
else
    echo -e "${YELLOW}⚠️  .env файл не найден${NC}"
    echo "   Создайте его из .env.example"
fi

echo ""
echo "============================================================"
echo "ПРОВЕРКА ЗАВЕРШЕНА"
echo "============================================================"
echo ""
echo "Следующие шаги:"
echo "1. Установите зависимости: pip install -r requirements.txt"
echo "2. Создайте .env файл с настройками БД"
echo "3. Примените миграции: alembic upgrade head"
echo "4. Создайте тестового пользователя: python3 create_test_user.py"
echo "5. Запустите сервер: uvicorn app.main:app --reload --port 8000"
echo "6. В другом терминале запустите тест: python3 test_login_api.py"

