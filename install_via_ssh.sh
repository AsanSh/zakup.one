#!/bin/bash
# Скрипт для установки зависимостей через SSH
# Выполните этот скрипт в SSH терминале на сервере

cd /home/kdlqemdxxn/zakup.one

# Проверяем что файл есть
if [ ! -f "requirements.txt" ]; then
    echo "ОШИБКА: Файл requirements.txt не найден!"
    echo "Текущая директория: $(pwd)"
    echo "Содержимое директории:"
    ls -la
    exit 1
fi

echo "Файл requirements.txt найден!"
echo "Устанавливаю зависимости..."

# Активируем виртуальное окружение и устанавливаем
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install -r requirements.txt
deactivate

echo "✅ Установка завершена!"



