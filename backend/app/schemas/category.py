from __future__ import annotations
from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    type: str
    color: str = "#6366f1"
    icon: str = "💰"


class CategoryOut(BaseModel):
    id: int
    name: str
    type: str
    color: str
    icon: str
    model_config = {"from_attributes": True}
