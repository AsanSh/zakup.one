FROM python:3.11-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Копирование requirements и установка зависимостей
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование проекта
COPY backend/ .

# Создание директорий для media и static
RUN mkdir -p media staticfiles

EXPOSE 8000

CMD ["gunicorn", "zakup_backend.wsgi:application", "--bind", "0.0.0.0:8000"]



