from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.dashboard import DashboardSummary
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def summary(year: int = Query(default=None), db: Session = Depends(get_db), user=Depends(get_current_user)):
    return dashboard_service.get_summary(user.id, year or date.today().year, db)
