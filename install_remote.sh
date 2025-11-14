#!/bin/bash
# Скрипт для установки зависимостей на удаленном сервере
# Этот скрипт будет выполнен через панель Spaceship

cd /home/kdlqemdxxn/zakup.one || exit 1

echo "Current directory: $(pwd)"
echo "Checking for requirements.txt..."

if [ ! -f "requirements.txt" ]; then
    echo "ERROR: requirements.txt not found!"
    echo "Directory contents:"
    ls -la
    exit 1
fi

echo "Found requirements.txt, installing dependencies..."

# Активируем виртуальное окружение
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate

# Устанавливаем зависимости
pip install -r requirements.txt

# Деактивируем окружение
deactivate

echo "SUCCESS: All dependencies installed!"
