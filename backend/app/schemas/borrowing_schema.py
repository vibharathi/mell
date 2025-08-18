from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.borrowing_models import BorrowStatus

class BorrowRequestBase(BaseModel):
    equipment_item_id: int
    request_details: Optional[str] = None

class BorrowRequestCreate(BorrowRequestBase):
    pass

class BorrowRequest(BorrowRequestBase):
    id: int
    borrower_id: int
    request_date: datetime
    return_date: Optional[datetime] = None
    status: BorrowStatus

    class Config:
        from_attributes = True