from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
import app.models  # noqa: ensure all models are registered before create_all
from app.routers import auth, categories, transactions, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finance Tracker API", version="2.0")

import os

origins = ["http://localhost:5173"]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"status": "ok", "version": "2.0"}
