"""
Упрощенный WSGI файл для Spaceship hosting
С детальной диагностикой и fallback приложением
"""
import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

print(f"🚀 Starting ZAKUP.ONE from: {project_root}")
print(f"📁 Files in directory: {[f for f in os.listdir('.') if not f.startswith('.')]}")

try:
    # Пробуем импортировать упрощенную версию
    from app.main_simple import app
    application = app
    print("✅ Application imported successfully (simple version)!")
    
except Exception as e:
    print(f"❌ Failed to import simple application: {e}")
    import traceback
    traceback.print_exc()
    
    # Пробуем импортировать полную версию
    try:
        from app.main import app
        application = app
        print("✅ Application imported successfully (full version)!")
    except Exception as e2:
        print(f"❌ Failed to import full application: {e2}")
        traceback.print_exc()
        
        # Fallback application
        from fastapi import FastAPI
        fallback_app = FastAPI()
        
        @fallback_app.get("/")
        def root():
            return {
                "error": "Main app failed to load",
                "simple_error": str(e),
                "full_error": str(e2),
                "path": str(project_root)
            }
        
        @fallback_app.get("/health")
        def health():
            return {"status": "fallback", "message": "Using fallback app"}
        
        application = fallback_app
        print("⚠️ Using fallback application")

