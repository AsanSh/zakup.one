"""
Упрощенная версия app/main.py для быстрого запуска на Spaceship
Без сложных зависимостей, с mock данными
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime
from pathlib import Path

app = FastAPI(
    title="ZAKUP.ONE",
    description="Платформа для снабженцев строительных компаний",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модели данных
class User(BaseModel):
    id: int
    email: str
    role: str
    name: str
    company: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    user: User
    accessToken: str

class Product(BaseModel):
    id: int
    name: str
    price: float
    unit: str
    category: str
    stock: int

# Mock данные
mock_users = [
    User(id=1, email="admin@zakup.one", role="admin", name="Администратор"),
    User(id=2, email="client@example.com", role="client", name="Иван Иванов", company="СтройГрад")
]

mock_products = [
    Product(id=1, name="Арматура 10мм A500C", price=450.00, unit="шт", category="Металлопрокат", stock=1245),
    Product(id=2, name="Гипсокартон Кнауф 12.5мм", price=320.50, unit="лист", category="Отделка", stock=567),
    Product(id=3, name="Цемент М500 Д0", price=285.00, unit="мешок", category="Смеси", stock=892),
]

# Serve frontend static files
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    # Mount static assets
    if (frontend_dist / "assets").exists():
        try:
            app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
        except Exception:
            pass
    
    # Serve index.html for root path
    @app.get("/")
    async def serve_index():
        if (frontend_dist / "index.html").exists():
            return FileResponse(str(frontend_dist / "index.html"))
        return JSONResponse({"message": "Frontend not found"})
    
    # Serve SPA for all other routes
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Check if file exists
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        
        # Fallback to index.html for SPA routing
        if (frontend_dist / "index.html").exists():
            return FileResponse(str(frontend_dist / "index.html"))
        
        raise HTTPException(status_code=404, detail="Not found")

# API Routes
@app.post("/api/v1/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    user = next((u for u in mock_users if u.email == credentials.email), None)
    
    if not user:
        # Auto-create client user for any email
        user = User(
            id=len(mock_users) + 1,
            email=credentials.email,
            role="client",
            name="Новый пользователь",
            company="Тестовая компания"
        )
        mock_users.append(user)
    
    return LoginResponse(
        user=user,
        accessToken=f"mock-token-{uuid.uuid4()}"
    )

@app.get("/api/v1/products")
async def get_products():
    return mock_products

@app.get("/api/v1/users/me")
async def get_current_user():
    return mock_users[0]  # Return admin user for demo

@app.get("/health")
async def health():
    return JSONResponse({
        "status": "ok",
        "service": "zakup.one",
        "timestamp": datetime.now().isoformat()
    })

@app.get("/api/v1/health")
async def api_health():
    return JSONResponse({
        "status": "ok",
        "api": "v1",
        "frontend_available": frontend_dist.exists()
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

