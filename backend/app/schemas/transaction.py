from __future__ import annotations
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from app.schemas.category import CategoryOut


class TransactionCreate(BaseModel):
    amount: float
    currency: str = "TRY"
    description: Optional[str] = None
    date: date
    type: str
    category_id: Optional[int] = None


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    type: Optional[str] = None
    category_id: Optional[int] = None


class TransactionOut(BaseModel):
    id: int
    amount: float
    currency: str
    amount_try: float
    description: Optional[str]
    date: date
    type: str
    category: Optional[CategoryOut]
    created_at: datetime
    model_config = {"from_attributes": True}
