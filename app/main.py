"""
Главный файл приложения FastAPI
Максимально упрощенная версия для надежной работы
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response, JSONResponse
from pathlib import Path
import os

# Определяем пути
project_root = Path(__file__).parent.parent
frontend_dist = project_root / "frontend" / "dist"
frontend_assets = frontend_dist / "assets" if frontend_dist.exists() else None

# Создаем приложение
app = FastAPI(
    title="ZAKUP.ONE API",
    description="Веб-платформа для снабженцев строительных компаний",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware - настраиваем из переменных окружения
cors_origins = os.getenv("CORS_ORIGINS", "https://www.zakup.one,https://zakup.one,http://www.zakup.one,http://zakup.one")
if isinstance(cors_origins, str) and cors_origins.startswith("["):
    import json
    try:
        cors_origins = json.loads(cors_origins)
    except:
        cors_origins = [origin.strip() for origin in cors_origins.split(",")]
elif isinstance(cors_origins, str):
    cors_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Подключение статических файлов для frontend
if frontend_assets and frontend_assets.exists():
    try:
        app.mount("/assets", StaticFiles(directory=str(frontend_assets)), name="assets")
    except Exception:
        pass  # Игнорируем ошибки монтирования статики

# Обработка favicon.ico - ВАЖНО: регистрируем ПЕРВЫМ
@app.get("/favicon.ico")
async def favicon():
    """Обработка favicon.ico"""
    try:
        favicon_path = frontend_dist / "favicon.ico"
        if favicon_path.exists():
            return FileResponse(str(favicon_path))
    except Exception:
        pass
    return Response(status_code=204)

# Базовые health endpoints - регистрируем ДО catch-all
@app.get("/health")
async def health_check():
    """Health check endpoint без подключения к БД"""
    return JSONResponse({
        "status": "ok",
        "message": "API is running",
        "frontend": "available" if (frontend_dist.exists() and (frontend_dist / "index.html").exists()) else "not found"
    })

@app.get("/api/v1/health")
async def api_health_check():
    """API health check endpoint с проверкой БД"""
    try:
        from app.core.database import SessionLocal
        from sqlalchemy import text
        
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            return JSONResponse({"status": "ok", "database": "connected"})
        except Exception as db_error:
            return JSONResponse({"status": "ok", "database": "error", "error": str(db_error)})
        finally:
            db.close()
    except ImportError:
        return JSONResponse({"status": "ok", "database": "not configured", "note": "Database module not available"})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)})

# Корневой endpoint
@app.get("/")
async def root():
    """Корневой endpoint"""
    try:
        if frontend_dist.exists() and (frontend_dist / "index.html").exists():
            return FileResponse(str(frontend_dist / "index.html"))
    except Exception:
        pass
    return JSONResponse({
        "message": "ZAKUP.ONE API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "frontend": "available" if frontend_dist.exists() else "not found"
    })

# Подключение API роутеров (с обработкой ошибок)
try:
    from app.core.config import settings
    from app.api.v1.api import api_router
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)
except Exception as e:
    # Если не удалось загрузить роутеры, создаем fallback endpoint
    @app.get("/api/v1/{path:path}")
    async def api_fallback(path: str):
        return JSONResponse({
            "error": "API modules not loaded",
            "message": str(e),
            "note": "Check server logs for details"
        }, status_code=503)

# Отдача index.html для всех остальных путей (SPA routing)
# ВАЖНО: Этот обработчик должен быть ПОСЛЕДНИМ
if frontend_dist.exists():
    frontend_index = frontend_dist / "index.html"
    if frontend_index.exists():
        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            """Отдает index.html для всех путей, которые не являются API или статическими файлами"""
            # Пропускаем API пути
            if full_path.startswith("api/"):
                raise HTTPException(status_code=404, detail="API endpoint not found")
            
            # Пропускаем статические файлы
            if full_path.startswith("assets/") or full_path.startswith("static/"):
                raise HTTPException(status_code=404, detail="Static file not found")
            
            # Пропускаем файлы с расширениями
            if full_path and "." in full_path.split("/")[-1]:
                raise HTTPException(status_code=404, detail="File not found")
            
            # Отдаем index.html
            try:
                return FileResponse(str(frontend_index))
            except Exception:
                raise HTTPException(status_code=500, detail="Frontend file not accessible")
