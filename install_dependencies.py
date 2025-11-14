#!/usr/bin/env python3
"""
Скрипт для установки зависимостей Python
Можно запустить через панель Spaceship в секции "Execute python script"
"""
import os
import sys
import subprocess

# Переходим в директорию проекта
project_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(project_dir)

print(f"Текущая директория: {os.getcwd()}")
print(f"Файл requirements.txt существует: {os.path.exists('requirements.txt')}")

if not os.path.exists('requirements.txt'):
    print("ОШИБКА: Файл requirements.txt не найден!")
    print(f"Содержимое директории: {os.listdir('.')}")
    sys.exit(1)

# Проверяем версию Python
python_version = sys.version_info
print(f"Python версия: {python_version.major}.{python_version.minor}.{python_version.micro}")

# Устанавливаем зависимости
try:
    print("\nНачинаю установку зависимостей...")
    result = subprocess.run(
        [sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'],
        capture_output=True,
        text=True,
        check=False
    )
    
    print("\n=== STDOUT ===")
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
    sys.exit(1)



