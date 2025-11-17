#!/usr/bin/env python3
"""
Проверка структуры проекта
"""
import os
import sys
from pathlib import Path

def check_file_exists(path, description):
    """Проверка существования файла"""
    if Path(path).exists():
        print(f"✅ {description}: {path}")
        return True
    else:
        print(f"❌ {description}: {path} - НЕ НАЙДЕН")
        return False

def check_directory_exists(path, description):
    """Проверка существования директории"""
    if Path(path).is_dir():
        files = list(Path(path).iterdir())
        print(f"✅ {description}: {path} ({len(files)} файлов)")
        return True
    else:
        print(f"❌ {description}: {path} - НЕ НАЙДЕНА")
        return False

def check_imports():
    """Проверка импортов"""
    print("\n🔍 Проверка импортов...")
    
    try:
        # Проверяем что можем импортировать основные модули
        sys.path.insert(0, str(Path(__file__).parent))
        
        from app.main import app
        print("✅ app.main импортируется")
        
        from app.api.v1.api import api_router
        print("✅ app.api.v1.api импортируется")
        
        from app.core.config import settings
        print(f"✅ app.core.config импортируется (API_V1_PREFIX={settings.API_V1_PREFIX})")
        
        from app.api.v1.endpoints.auth import LoginRequest, TokenResponse
        print("✅ app.api.v1.endpoints.auth импортируется")
        
        return True
    except Exception as e:
        print(f"❌ Ошибка импорта: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("=" * 60)
    print("ПРОВЕРКА СТРУКТУРЫ ПРОЕКТА")
    print("=" * 60)
    
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    checks = []
    
    # Проверка структуры
    print("\n📁 Проверка структуры проекта...")
    checks.append(check_file_exists("app/main.py", "Главный файл FastAPI"))
    checks.append(check_directory_exists("app/api/v1/endpoints", "API endpoints"))
    checks.append(check_file_exists("app/api/v1/api.py", "Главный роутер API"))
    checks.append(check_file_exists("app/api/v1/endpoints/auth.py", "Auth endpoints"))
    checks.append(check_file_exists("app/api/v1/endpoints/admin.py", "Admin endpoints"))
    checks.append(check_file_exists("app/core/config.py", "Конфигурация"))
    checks.append(check_file_exists("app/core/database.py", "База данных"))
    checks.append(check_file_exists("requirements.txt", "Зависимости"))
    checks.append(check_directory_exists("frontend/src", "Frontend"))
    checks.append(check_file_exists("frontend/src/shared/api/authApi.ts", "Frontend auth API"))
    
    # Проверка импортов
    imports_ok = check_imports()
    checks.append(imports_ok)
    
    # Итог
    print("\n" + "=" * 60)
    if all(checks):
        print("✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ")
        return 0
    else:
        print("❌ НЕКОТОРЫЕ ПРОВЕРКИ НЕ ПРОЙДЕНЫ")
        return 1

if __name__ == "__main__":
    sys.exit(main())

