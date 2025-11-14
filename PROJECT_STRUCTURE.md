# 📋 Структура проекта ZAKUP.ONE

## ✅ Это FULLSTACK приложение:

### Backend: Python/FastAPI
- **Папка:** `app/`
- **Фреймворк:** FastAPI
- **База данных:** SQLite/PostgreSQL
- **Файлы:**
  - `app/main.py` - главный файл приложения
  - `app/api/` - API endpoints
  - `app/models/` - модели данных
  - `app/core/` - конфигурация и БД
  - `requirements.txt` - Python зависимости
  - `wsgi.py` - точка входа для Spaceship

### Frontend: React/Vite
- **Папка:** `frontend/`
- **Фреймворк:** React 18 + TypeScript
- **Сборщик:** Vite
- **Файлы:**
  - `frontend/src/` - исходники React
  - `frontend/dist/` - собранные файлы (для продакшена)
  - `frontend/package.json` - Node.js зависимости

## 🎯 Как это работает:

1. **Backend (FastAPI)** обрабатывает API запросы
2. **Frontend (React)** отображается как статические файлы
3. **FastAPI** отдает статические файлы из `frontend/dist/`
4. **SPA routing** - FastAPI отдает `index.html` для всех не-API путей

## ✅ Настройка правильная!

- **Entry Point:** `wsgi:application` ✅
- **Startup File:** `wsgi.py` ✅
- **Python version:** 3.11 ✅

## ❌ Проблема не в настройке, а в:

1. **Зависимости не установлены** - нужно установить Python пакеты
2. **Переменные окружения** - нужно настроить
3. **База данных** - нужно создать/настроить

## 🚀 Что нужно сделать:

1. Установить Python зависимости через `install_dependencies_fixed.sh`
2. Настроить переменные окружения в панели Spaceship
3. Проверить что `frontend/dist/` загружен на сервер



