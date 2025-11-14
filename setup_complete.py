#!/usr/bin/env python3
"""
Полная автоматическая установка и настройка приложения
Запустите этот скрипт через панель Spaceship: Execute python script -> setup_complete.py
"""
import os
import sys
import subprocess
from pathlib import Path

print("=" * 60)
print("🚀 АВТОМАТИЧЕСКАЯ УСТАНОВКА ZAKUP.ONE")
print("=" * 60)

# Определяем пути
project_dir = Path("/home/kdlqemdxxn/zakup.one")
venv_pip = Path("/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip")
requirements_file = project_dir / "requirements.txt"

os.chdir(str(project_dir))
print(f"\n📁 Рабочая директория: {os.getcwd()}")

# ШАГ 1: Проверка файлов
print("\n" + "=" * 60)
print("ШАГ 1: Проверка файлов")
print("=" * 60)

if not requirements_file.exists():
    print(f"❌ ОШИБКА: {requirements_file} не найден!")
    print(f"Содержимое директории:")
    for item in os.listdir('.'):
        print(f"  - {item}")
    sys.exit(1)

print(f"✅ Найден: {requirements_file}")

if not venv_pip.exists():
    print(f"⚠️  {venv_pip} не найден, использую системный pip")
    pip_cmd = [sys.executable, "-m", "pip"]
else:
    pip_cmd = [str(venv_pip)]
    print(f"✅ Найден pip: {venv_pip}")

# ШАГ 2: Создание директорий
print("\n" + "=" * 60)
print("ШАГ 2: Создание необходимых директорий")
print("=" * 60)

dirs_to_create = ['uploads', 'downloads']
for dir_name in dirs_to_create:
    dir_path = project_dir / dir_name
    try:
        dir_path.mkdir(exist_ok=True)
        os.chmod(str(dir_path), 0o777)
        print(f"✅ Создана/проверена директория: {dir_name}")
    except Exception as e:
        print(f"⚠️  Не удалось создать {dir_name}: {e}")

# ШАГ 3: Обновление pip
print("\n" + "=" * 60)
print("ШАГ 3: Обновление pip")
print("=" * 60)

try:
    result = subprocess.run(
        pip_cmd + ["install", "--upgrade", "pip", "--quiet"],
        capture_output=True,
        text=True,
        timeout=120
    )
    if result.returncode == 0:
        print("✅ pip обновлен")
    else:
        print(f"⚠️  pip не обновлен (код: {result.returncode})")
except Exception as e:
    print(f"⚠️  Ошибка при обновлении pip: {e}")

# ШАГ 4: Установка зависимостей
print("\n" + "=" * 60)
print("ШАГ 4: Установка зависимостей из requirements.txt")
print("=" * 60)
print("Это может занять несколько минут...")

try:
    result = subprocess.run(
        pip_cmd + ["install", "-r", str(requirements_file)],
        capture_output=True,
        text=True,
        timeout=600  # 10 минут максимум
    )
    
    if result.stdout:
        # Показываем только важные строки
        important_lines = [
            line for line in result.stdout.split('\n')
            if 'Successfully installed' in line or 'Requirement already satisfied' in line or 'Collecting' in line
        ]
        if important_lines:
            print("\n".join(important_lines[-20:]))  # Последние 20 строк
    
    if result.stderr:
        error_lines = [line for line in result.stderr.split('\n') if 'ERROR' in line or 'WARNING' in line]
        if error_lines:
            print("\n⚠️  Предупреждения/Ошибки:")
            print("\n".join(error_lines[:10]))
    
    if result.returncode == 0:
        print("\n✅ Все зависимости успешно установлены!")
    else:
        print(f"\n❌ Ошибка при установке (код: {result.returncode})")
        print("Проверьте вывод выше для деталей")
        # Не выходим с ошибкой, продолжаем проверку
        
except subprocess.TimeoutExpired:
    print("\n❌ Таймаут при установке зависимостей")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Критическая ошибка: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# ШАГ 5: Проверка установки
print("\n" + "=" * 60)
print("ШАГ 5: Проверка установки основных пакетов")
print("=" * 60)

packages_to_check = [
    ("fastapi", "FastAPI"),
    ("uvicorn", "Uvicorn"),
    ("sqlalchemy", "SQLAlchemy"),
    ("pydantic", "Pydantic"),
]

all_ok = True
for package, name in packages_to_check:
    try:
        result = subprocess.run(
            pip_cmd + ["show", package],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            version_line = [line for line in result.stdout.split('\n') if line.startswith('Version:')]
            if version_line:
                print(f"✅ {name}: {version_line[0].split(':')[1].strip()}")
            else:
                print(f"✅ {name}: установлен")
        else:
            print(f"❌ {name}: НЕ УСТАНОВЛЕН")
            all_ok = False
    except Exception as e:
        print(f"⚠️  {name}: ошибка проверки - {e}")
        all_ok = False

# ШАГ 6: Проверка структуры проекта
print("\n" + "=" * 60)
print("ШАГ 6: Проверка структуры проекта")
print("=" * 60)

required_files = [
    "wsgi.py",
    "app/main.py",
    "app/core/config.py",
    "requirements.txt"
]

for file_path in required_files:
    full_path = project_dir / file_path
    if full_path.exists():
        print(f"✅ {file_path}")
    else:
        print(f"❌ {file_path} - НЕ НАЙДЕН!")

# Проверка frontend
frontend_dist = project_dir / "frontend" / "dist" / "index.html"
if frontend_dist.exists():
    print(f"✅ frontend/dist/index.html")
else:
    print(f"⚠️  frontend/dist/index.html - не найден (frontend может быть не собран)")

# ИТОГ
print("\n" + "=" * 60)
print("📋 ИТОГОВЫЙ СТАТУС")
print("=" * 60)

if all_ok:
    print("✅ Установка завершена успешно!")
    print("\n📝 СЛЕДУЮЩИЕ ШАГИ:")
    print("1. В панели Spaceship добавьте переменные окружения:")
    print("   - DATABASE_URL = sqlite:///./zakup.db")
    print("   - SECRET_KEY = qfM-nNd85eKQRQS34q0TAFkWy2Zsh7-QJUelBkFsFYA")
    print("   - DEBUG = True")
    print("   - CORS_ORIGINS = [\"https://www.zakup.one\",\"https://zakup.one\"]")
    print("2. Нажмите 'SAVE'")
    print("3. Проверьте работу:")
    print("   - https://zakup.one/health")
    print("   - https://zakup.one/api/v1/health")
else:
    print("⚠️  Установка завершена с предупреждениями")
    print("Проверьте вывод выше для деталей")

print("\n" + "=" * 60)
print("✅ СКРИПТ ЗАВЕРШЕН")
print("=" * 60)



