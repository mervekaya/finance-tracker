from __future__ import annotations
from pydantic import BaseModel
from typing import List


class MonthlySummary(BaseModel):
    month: str
    income: float
    expense: float
    net: float


class CategoryBreakdown(BaseModel):
    category: str
    icon: str
    color: str
    amount: float
    percentage: float


class DashboardSummary(BaseModel):
    total_income: float
    total_expense: float
    net: float
    monthly: List[MonthlySummary]
    category_breakdown: List[CategoryBreakdown]
