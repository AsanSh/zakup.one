#!/bin/bash
# Скрипт для установки зависимостей на Spaceship
# Используйте этот скрипт через панель Spaceship в секции "Execute python script"

set -e  # Остановка при ошибке

# Определяем корневую директорию проекта
PROJECT_DIR="/home/kdlqemdxxn/zakup.one"

# Переходим в директорию проекта
cd "$PROJECT_DIR" || {
    echo "ERROR: Cannot change to directory $PROJECT_DIR"
    exit 1
}

echo "Current directory: $(pwd)"
echo "Python version: $(python3 --version)"

# Проверяем наличие requirements.txt
if [ ! -f "requirements.txt" ]; then
    echo "ERROR: requirements.txt not found in $(pwd)"
    echo "Directory contents:"
    ls -la
    exit 1
fi

echo "Found requirements.txt"

# Активируем виртуальное окружение
VENV_PATH="/home/kdlqemdxxn/virtualenv/zakup.one/3.11"
if [ -d "$VENV_PATH" ]; then
    echo "Activating virtual environment..."
    source "$VENV_PATH/bin/activate"
else
    echo "WARNING: Virtual environment not found at $VENV_PATH"
    echo "Using system Python"
fi

# Обновляем pip
echo "Updating pip..."
pip install --upgrade pip --quiet

# Устанавливаем зависимости
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

# Деактивируем виртуальное окружение
if [ -n "$VIRTUAL_ENV" ]; then
    deactivate
fi

echo "SUCCESS: All dependencies installed successfully!"

# Проверяем установку основных пакетов
echo "Verifying installation..."
python3 -c "import fastapi; print('FastAPI:', fastapi.__version__)" || echo "WARNING: FastAPI not found"
python3 -c "import uvicorn; print('Uvicorn installed')" || echo "WARNING: Uvicorn not found"
python3 -c "import sqlalchemy; print('SQLAlchemy:', sqlalchemy.__version__)" || echo "WARNING: SQLAlchemy not found"



