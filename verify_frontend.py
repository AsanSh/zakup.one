#!/usr/bin/env python3
"""
Скрипт для проверки структуры frontend/dist на сервере
Запуск: python verify_frontend.py
"""
import os
import sys
from pathlib import Path
from mimetypes import guess_type

def check_color(text, color='green'):
    """Цветной вывод для терминала"""
    colors = {
        'green': '\033[92m',
        'red': '\033[91m',
        'yellow': '\033[93m',
        'blue': '\033[94m',
        'reset': '\033[0m'
    }
    return f"{colors.get(color, '')}{text}{colors['reset']}"

def verify_frontend():
    """Проверка структуры frontend/dist"""
    print("=" * 60)
    print(check_color("🔍 ПРОВЕРКА FRONTEND/DIST", 'blue'))
    print("=" * 60)
    
    # Определяем корневую директорию проекта
    project_root = Path(__file__).parent.absolute()
    frontend_dist = project_root / "frontend" / "dist"
    
    print(f"\n📁 Корневая директория проекта: {project_root}")
    print(f"📁 Ожидаемый путь к dist: {frontend_dist}")
    print()
    
    issues = []
    warnings = []
    success = []
    
    # 1. Проверка наличия папки frontend/dist
    print("1️⃣  Проверка наличия папки frontend/dist...")
    if not frontend_dist.exists():
        issues.append(f"❌ Папка {frontend_dist} НЕ СУЩЕСТВУЕТ!")
        print(check_color(f"   ❌ Папка не найдена: {frontend_dist}", 'red'))
    else:
        success.append(f"✅ Папка {frontend_dist} существует")
        print(check_color(f"   ✅ Папка найдена: {frontend_dist}", 'green'))
    print()
    
    if not frontend_dist.exists():
        print(check_color("⚠️  КРИТИЧЕСКАЯ ОШИБКА: Папка frontend/dist не найдена!", 'red'))
        print("\n📋 Что делать:")
        print("   1. Соберите frontend: cd frontend && npm run build")
        print("   2. Загрузите папку dist на сервер")
        print("   3. Проверьте путь на сервере: /home/kdlqemdxxn/zakup.one/frontend/dist/")
        return False
    
    # 2. Проверка index.html
    print("2️⃣  Проверка index.html...")
    index_html = frontend_dist / "index.html"
    if not index_html.exists():
        issues.append("❌ index.html не найден!")
        print(check_color(f"   ❌ Файл не найден: {index_html}", 'red'))
    else:
        size = index_html.stat().st_size
        success.append(f"✅ index.html найден ({size} байт)")
        print(check_color(f"   ✅ Файл найден: {index_html} ({size} байт)", 'green'))
    print()
    
    # 3. Проверка папки assets
    print("3️⃣  Проверка папки assets...")
    assets_dir = frontend_dist / "assets"
    if not assets_dir.exists():
        issues.append("❌ Папка assets не найдена!")
        print(check_color(f"   ❌ Папка не найдена: {assets_dir}", 'red'))
    else:
        success.append(f"✅ Папка assets найдена")
        print(check_color(f"   ✅ Папка найдена: {assets_dir}", 'green'))
        
        # Проверка содержимого assets
        js_files = list(assets_dir.glob("*.js"))
        css_files = list(assets_dir.glob("*.css"))
        
        print(f"   📦 JS файлов: {len(js_files)}")
        print(f"   📦 CSS файлов: {len(css_files)}")
        
        if len(js_files) == 0:
            warnings.append("⚠️  Нет JS файлов в assets/")
            print(check_color("   ⚠️  Нет JS файлов!", 'yellow'))
        else:
            print(check_color(f"   ✅ JS файлы найдены:", 'green'))
            for js_file in js_files[:5]:  # Показываем первые 5
                size = js_file.stat().st_size
                print(f"      - {js_file.name} ({size:,} байт)")
            if len(js_files) > 5:
                print(f"      ... и еще {len(js_files) - 5} файлов")
        
        if len(css_files) == 0:
            warnings.append("⚠️  Нет CSS файлов в assets/")
            print(check_color("   ⚠️  Нет CSS файлов!", 'yellow'))
        else:
            print(check_color(f"   ✅ CSS файлы найдены:", 'green'))
            for css_file in css_files[:5]:  # Показываем первые 5
                size = css_file.stat().st_size
                print(f"      - {css_file.name} ({size:,} байт)")
            if len(css_files) > 5:
                print(f"      ... и еще {len(css_files) - 5} файлов")
    print()
    
    # 4. Проверка MIME типов
    print("4️⃣  Проверка MIME типов файлов...")
    if assets_dir.exists():
        all_files = list(assets_dir.glob("*"))
        mime_issues = []
        
        for file_path in all_files[:10]:  # Проверяем первые 10 файлов
            if file_path.is_file():
                mime_type, _ = guess_type(str(file_path))
                expected_mime = None
                
                if file_path.suffix == '.js':
                    expected_mime = 'application/javascript'
                elif file_path.suffix == '.css':
                    expected_mime = 'text/css'
                
                if expected_mime and mime_type != expected_mime:
                    mime_issues.append(f"{file_path.name}: {mime_type} (ожидается {expected_mime})")
        
        if mime_issues:
            warnings.append("⚠️  Проблемы с MIME типами")
            print(check_color("   ⚠️  Обнаружены проблемы:", 'yellow'))
            for issue in mime_issues:
                print(f"      - {issue}")
        else:
            success.append("✅ MIME типы корректны")
            print(check_color("   ✅ MIME типы файлов корректны", 'green'))
    print()
    
    # 5. Проверка конфигурации в main.py
    print("5️⃣  Проверка конфигурации в app/main.py...")
    main_py = project_root / "app" / "main.py"
    if main_py.exists():
        with open(main_py, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Проверяем наличие StaticFiles
        if 'StaticFiles' in content:
            print(check_color("   ✅ StaticFiles используется", 'green'))
            
            # Проверяем путь
            if 'frontend/dist/assets' in content or 'frontend_assets' in content:
                print(check_color("   ✅ Путь к assets указан правильно", 'green'))
            else:
                warnings.append("⚠️  Путь к assets может быть неправильным")
                print(check_color("   ⚠️  Проверьте путь к assets в main.py", 'yellow'))
        else:
            issues.append("❌ StaticFiles не найден в main.py")
            print(check_color("   ❌ StaticFiles не найден!", 'red'))
    else:
        warnings.append("⚠️  app/main.py не найден")
        print(check_color("   ⚠️  app/main.py не найден", 'yellow'))
    print()
    
    # 6. Проверка конфигурации в wsgi.py
    print("6️⃣  Проверка конфигурации в wsgi.py...")
    wsgi_py = project_root / "wsgi.py"
    if wsgi_py.exists():
        with open(wsgi_py, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'frontend' in content.lower() or 'dist' in content.lower():
            print(check_color("   ✅ wsgi.py упоминает frontend/dist", 'green'))
        else:
            warnings.append("⚠️  wsgi.py может не учитывать frontend")
            print(check_color("   ⚠️  Проверьте wsgi.py", 'yellow'))
    else:
        warnings.append("⚠️  wsgi.py не найден")
        print(check_color("   ⚠️  wsgi.py не найден", 'yellow'))
    print()
    
    # Итоговый отчет
    print("=" * 60)
    print(check_color("📊 ИТОГОВЫЙ ОТЧЕТ", 'blue'))
    print("=" * 60)
    
    if success:
        print(check_color("\n✅ Успешно:", 'green'))
        for item in success:
            print(f"   {item}")
    
    if warnings:
        print(check_color("\n⚠️  Предупреждения:", 'yellow'))
        for item in warnings:
            print(f"   {item}")
    
    if issues:
        print(check_color("\n❌ Критические проблемы:", 'red'))
        for item in issues:
            print(f"   {item}")
        print()
        print(check_color("🔧 РЕКОМЕНДАЦИИ:", 'blue'))
        print("   1. Соберите frontend: cd frontend && npm run build")
        print("   2. Загрузите папку frontend/dist на сервер")
        print("   3. Проверьте путь: /home/kdlqemdxxn/zakup.one/frontend/dist/")
        print("   4. Убедитесь что .htaccess правильно настроен")
        return False
    
    if not warnings:
        print(check_color("\n🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО!", 'green'))
        print("\n📋 Следующие шаги:")
        print("   1. Загрузите frontend/dist на сервер")
        print("   2. Проверьте что файлы доступны по URL:")
        print("      - https://zakup.one/assets/index-XXXX.css")
        print("      - https://zakup.one/assets/index-XXXX.js")
        print("   3. Очистите кеш браузера и обновите страницу")
        return True
    else:
        print(check_color("\n⚠️  Есть предупреждения, но критических проблем нет", 'yellow'))
        return True

if __name__ == "__main__":
    try:
        result = verify_frontend()
        sys.exit(0 if result else 1)
    except Exception as e:
        print(check_color(f"\n❌ Ошибка при проверке: {e}", 'red'))
        import traceback
        traceback.print_exc()
        sys.exit(1)

