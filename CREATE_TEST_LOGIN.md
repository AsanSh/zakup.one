# 🔧 СОЗДАНИЕ test_login.py НА СЕРВЕРЕ

## Проблема
Файл `test_login.py` не найден на сервере. Нужно создать его.

## ✅ Решение: Создать файл на сервере

### Вариант 1: Через команду cat (РЕКОМЕНДУЕТСЯ)

Выполните на сервере:

```bash
cd /home/kdlqemdxxn/zakup.one
cat > test_login.py << 'ENDOFFILE'
#!/usr/bin/env python3
"""
Скрипт для тестирования API логина
Проверяет что запросы доходят до FastAPI и возвращают правильный ответ
"""
import sys
import os
import requests
from pathlib import Path

# Добавляем путь к проекту для импорта настроек
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Загружаем переменные окружения
env_file = project_root / '.env'
if env_file.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(str(env_file))
    except ImportError:
        pass

# Получаем URL из переменной окружения или используем дефолтный
API_URL = os.getenv("TEST_API_URL", "https://zakup.one")

# Тестовые данные (из create_superadmin.py)
TEST_EMAIL = "asannameg@gmail.com"
TEST_PASSWORD = "ParolJok6#"

def test_login():
    """Тестирование логина"""
    print("=" * 60)
    print("🧪 ТЕСТИРОВАНИЕ API ЛОГИНА")
    print("=" * 60)
    print()
    print(f"API URL: {API_URL}")
    print(f"Endpoint: {API_URL}/api/v1/auth/login")
    print(f"Email: {TEST_EMAIL}")
    print()
    
    # URL для логина
    login_url = f"{API_URL}/api/v1/auth/login"
    
    # Данные для запроса (OAuth2PasswordRequestForm использует form-data)
    form_data = {
        "username": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        print("📤 Отправка POST запроса...")
        response = requests.post(
            login_url,
            data=form_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        
        print()
        print("=" * 60)
        print("📥 ОТВЕТ СЕРВЕРА")
        print("=" * 60)
        print(f"HTTP Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type', 'N/A')}")
        print()
        
        # Проверяем тип ответа
        content_type = response.headers.get('Content-Type', '')
        is_html = 'text/html' in content_type or response.text.strip().startswith('<!DOCTYPE')
        
        if is_html:
            print("❌ ОШИБКА: Получен HTML вместо JSON!")
            print("   Это означает, что запрос НЕ доходит до FastAPI")
            print("   Проблема в .htaccess или настройках Spaceship")
            print()
            print("📄 Первые 500 символов ответа:")
            print("-" * 60)
            print(response.text[:500])
            print("-" * 60)
            return False
        
        # Пытаемся распарсить JSON
        try:
            data = response.json()
            print("✅ Получен JSON ответ:")
            print("-" * 60)
            import json
            print(json.dumps(data, indent=2, ensure_ascii=False))
            print("-" * 60)
            
            # Проверяем наличие токена
            if response.status_code == 200:
                if "access_token" in data:
                    print()
                    print("✅ УСПЕХ: Логин работает!")
                    print(f"   Токен получен: {data['access_token'][:20]}...")
                    if "user" in data:
                        print(f"   Пользователь: {data['user'].get('email', 'N/A')}")
                    return True
                else:
                    print()
                    print("⚠️  ВНИМАНИЕ: Статус 200, но токен отсутствует")
                    return False
            else:
                print()
                print(f"❌ ОШИБКА: Статус {response.status_code}")
                if "detail" in data:
                    print(f"   Сообщение: {data['detail']}")
                return False
                
        except ValueError as e:
            print("❌ ОШИБКА: Не удалось распарсить JSON")
            print(f"   Ошибка: {e}")
            print()
            print("📄 Ответ сервера:")
            print("-" * 60)
            print(response.text[:500])
            print("-" * 60)
            return False
            
    except requests.exceptions.Timeout:
        print("❌ ОШИБКА: Таймаут запроса")
        print("   Сервер не отвечает в течение 10 секунд")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ ОШИБКА: Не удалось подключиться к серверу")
        print("   Проверьте URL и доступность сервера")
        return False
    except Exception as e:
        print(f"❌ ОШИБКА: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_login()
    print()
    print("=" * 60)
    if success:
        print("✅ ТЕСТ ПРОЙДЕН")
    else:
        print("❌ ТЕСТ НЕ ПРОЙДЕН")
        print()
        print("📋 Что проверить:")
        print("   1. Приложение запущено в Spaceship? (Status = Running)")
        print("   2. Entry point = 'application' (без 'wsgi:')")
        print("   3. .htaccess правильно настроен для проксирования /api/*")
        print("   4. Пользователь существует в базе данных")
    print("=" * 60)
    sys.exit(0 if success else 1)
ENDOFFILE

chmod +x test_login.py
```

### Вариант 2: Через "Execute python script" в Spaceship

1. Откройте панель Spaceship
2. Перейдите в "Execute python script"
3. Скопируйте содержимое из `test_login.py` (из репозитория)
4. Вставьте и выполните

### Вариант 3: Через FTP/File Manager

1. Скачайте `test_login.py` из репозитория GitHub
2. Загрузите его на сервер в `/home/kdlqemdxxn/zakup.one/`
3. Установите права: `chmod +x test_login.py`

## После создания файла

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python test_login.py
```

## Ожидаемый результат

Если все работает:
```
✅ УСПЕХ: Логин работает!
   Токен получен: eyJhbGciOiJIUzI1NiIs...
   Пользователь: asannameg@gmail.com
✅ ТЕСТ ПРОЙДЕН
```

Если есть проблемы:
```
❌ ОШИБКА: Получен HTML вместо JSON!
   Это означает, что запрос НЕ доходит до FastAPI
❌ ТЕСТ НЕ ПРОЙДЕН
```

