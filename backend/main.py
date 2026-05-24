from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.database import engine
from core.seed import seed_db

import models.models as models

from routes.auth import router as auth_router
from routes.notice import router as notice_router
from routes.complaint import router as complaint_router
from routes.poll import router as poll_router
from routes.maintenance import router as maintenance_router

# Create Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Dev Homes Welfare Society API"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup
@app.on_event("startup")
def startup_event():
    seed_db()

# Root Route
@app.get("/")
def root():
    return {
        "message": "API Running"
    }

# Include Routers
app.include_router(auth_router)
app.include_router(notice_router)
app.include_router(complaint_router)
app.include_router(poll_router)
app.include_router(maintenance_router)