#!/usr/bin/env python3
"""
Скрипт для установки зависимостей Python
Можно запустить через панель Spaceship в секции "Execute python script"
"""
import os
import sys
import subprocess
from pathlib import Path

# Определяем корневую директорию проекта
project_dir = Path("/home/kdlqemdxxn/zakup.one")
os.chdir(str(project_dir))

print(f"Текущая директория: {os.getcwd()}")
print(f"Python версия: {sys.version}")

# Проверяем наличие requirements.txt
requirements_file = project_dir / "requirements.txt"
if not requirements_file.exists():
    print(f"ОШИБКА: Файл requirements.txt не найден в {project_dir}")
    print(f"Содержимое директории: {os.listdir('.')}")
    sys.exit(1)

print(f"Найден файл: {requirements_file}")

# Путь к pip из виртуального окружения
venv_pip = Path("/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip")
if not venv_pip.exists():
    print(f"ОШИБКА: pip не найден в {venv_pip}")
    print("Пробую использовать системный pip...")
    pip_cmd = [sys.executable, "-m", "pip"]
else:
    pip_cmd = [str(venv_pip)]

# Обновляем pip
print("\n=== Обновление pip ===")
try:
    subprocess.run(
        pip_cmd + ["install", "--upgrade", "pip", "--quiet"],
        check=False,
        capture_output=True
    )
except Exception as e:
    print(f"Предупреждение при обновлении pip: {e}")

# Устанавливаем зависимости
print("\n=== Установка зависимостей ===")
try:
    result = subprocess.run(
        pip_cmd + ["install", "-r", str(requirements_file)],
        capture_output=True,
        text=True,
        check=False
    )
    
    print("\n=== STDOUT ===")
    if result.stdout:
        print(result.stdout)
    
    if result.stderr:
        print("\n=== STDERR ===")
        print(result.stderr)
    
    if result.returncode == 0:
        print("\n✅ Зависимости успешно установлены!")
    else:
        print(f"\n❌ Ошибка при установке (код: {result.returncode})")
        sys.exit(result.returncode)
        
except Exception as e:
    print(f"\n❌ Критическая ошибка: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Проверяем установку основных пакетов
print("\n=== Проверка установки ===")
packages_to_check = ["fastapi", "uvicorn", "sqlalchemy"]
for package in packages_to_check:
    try:
        result = subprocess.run(
            pip_cmd + ["show", package],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            version_line = [line for line in result.stdout.split('\n') if line.startswith('Version:')]
            if version_line:
                print(f"✅ {package}: {version_line[0]}")
            else:
                print(f"✅ {package}: установлен")
        else:
            print(f"❌ {package}: не найден")
    except Exception as e:
        print(f"⚠️  {package}: ошибка проверки - {e}")

print("\n✅ Установка завершена!")



