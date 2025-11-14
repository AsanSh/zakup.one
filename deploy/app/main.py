"""
Главный файл приложения FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy import text
from app.core.config import settings
from app.api.v1.api import api_router

# Импортируем все модели для инициализации SQLAlchemy
from app.models import (
    User, Product, Supplier, Order, OrderItem,
    DeliveryTracking, DeliveryEvent, Driver,
    PriceListUpdate
)

app = FastAPI(
    title="ZAKUP.ONE API",
    description="Веб-платформа для снабженцев строительных компаний",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Подключение статических файлов для frontend
# Путь относительно корня проекта (где находится wsgi.py)
project_root = Path(__file__).parent.parent
frontend_dist = project_root / "frontend" / "dist"
frontend_assets = frontend_dist / "assets"

if frontend_assets.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_assets)), name="static")

# Отдача index.html для всех остальных путей (SPA routing)
if frontend_dist.exists():
    frontend_index = frontend_dist / "index.html"
    if frontend_index.exists():
        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            """Отдает index.html для всех путей, которые не являются API"""
            if not full_path.startswith("api") and not full_path.startswith("static"):
                from fastapi.responses import FileResponse
                return FileResponse(str(frontend_index))
            # Если это API путь, вернем 404
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not found")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Подключение роутеров
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "message": "ZAKUP.ONE API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Простая проверка без подключения к БД
        return {"status": "ok", "message": "API is running"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/v1/health")
async def api_health_check():
    """API health check endpoint"""
    try:
        from app.core.database import SessionLocal
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            return {"status": "ok", "database": "connected"}
        except Exception as db_error:
            return {"status": "ok", "database": "error", "error": str(db_error)}
        finally:
            db.close()
    except Exception as e:
        return {"status": "error", "message": str(e)}

