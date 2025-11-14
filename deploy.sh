#!/bin/bash

# Скрипт для подготовки проекта к деплою на Spaceship

echo "🚀 Подготовка проекта к деплою на Spaceship..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Сборка Frontend
echo -e "${YELLOW}📦 Сборка Frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей frontend..."
    npm install
fi
npm run build
cd ..

if [ ! -d "frontend/dist" ]; then
    echo -e "${YELLOW}❌ Ошибка: frontend/dist не найден!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend собран успешно${NC}"

# 2. Создание папки для деплоя
echo -e "${YELLOW}📁 Создание папки deploy...${NC}"
rm -rf deploy
mkdir -p deploy

# 3. Копирование необходимых файлов
echo -e "${YELLOW}📋 Копирование файлов...${NC}"

# Backend файлы
cp -r app deploy/
cp wsgi.py deploy/
cp .htaccess deploy/
cp requirements.txt deploy/
cp alembic.ini deploy/
cp -r alembic deploy/

# Frontend
mkdir -p deploy/frontend
cp -r frontend/dist deploy/frontend/

# Конфигурация
cp env.production.example deploy/.env.example 2>/dev/null || echo "# Создайте .env файл на основе env.production.example" > deploy/.env.example

# Создание необходимых папок
mkdir -p deploy/uploads
mkdir -p deploy/downloads

# 4. Создание инструкции
cat > deploy/README.txt << EOF
ИНСТРУКЦИЯ ПО ЗАГРУЗКЕ НА SPACESHIP

1. Загрузите все файлы из этой папки на сервер через FTP
2. Переименуйте .env.example в .env и настройте его
3. Установите права:
   - Папки: 755
   - Файлы: 644
   - uploads/: 777
4. В панели Spaceship настройте Python приложение с точкой входа: wsgi:application
5. Установите зависимости: pip install -r requirements.txt

FTP данные:
- Host: ftp.spaceship.ru
- Username: www.zakup.one
- Password: ParolJok9@
EOF

echo -e "${GREEN}✅ Файлы подготовлены в папке deploy/${NC}"
echo -e "${YELLOW}📝 Следующие шаги:${NC}"
echo "1. Загрузите содержимое папки deploy/ на сервер через FTP"
echo "2. Настройте .env файл на сервере"
echo "3. Настройте Python приложение в панели Spaceship"
echo ""
echo -e "${GREEN}Готово! 🎉${NC}"

