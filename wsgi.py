"""
WSGI entry point for Spaceship hosting
"""
import os
import sys
from pathlib import Path

# Определяем корневую директорию проекта
# wsgi.py должен быть в корне проекта
project_root = Path(__file__).parent.absolute()

# Добавляем корневую директорию в Python path
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Меняем рабочую директорию на корень проекта
os.chdir(str(project_root))

# Загружаем переменные окружения из .env файла
env_file = project_root / '.env'
if env_file.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(str(env_file))
    except ImportError:
        # dotenv не установлен, пропускаем
        pass

# Создаем необходимые директории если их нет
uploads_dir = project_root / 'uploads'
downloads_dir = project_root / 'downloads'
for dir_path in [uploads_dir, downloads_dir]:
    dir_path.mkdir(exist_ok=True)
    # Устанавливаем права доступа (если возможно)
    try:
        os.chmod(str(dir_path), 0o777)
    except:
        pass

try:
    # Импортируем приложение
    from app.main import app
    application = app
except Exception as e:
    # Если импорт не удался, создаем простое приложение для отладки
    import traceback
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
    
    error_app = FastAPI(title="ZAKUP.ONE - Error")
    
    @error_app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Application initialization failed",
                "message": str(exc),
                "type": type(exc).__name__,
                "path": str(project_root),
                "env_exists": env_file.exists(),
                "traceback": traceback.format_exc() if os.getenv("DEBUG", "False").lower() == "true" else None
            }
        )
    
    @error_app.get("/{path:path}")
    async def error_handler(path: str):
        return {
            "error": "Application initialization failed",
            "message": str(e),
            "type": type(e).__name__,
            "path": str(project_root),
            "env_exists": env_file.exists(),
            "traceback": traceback.format_exc() if os.getenv("DEBUG", "False").lower() == "true" else None
        }
    
    application = error_app

