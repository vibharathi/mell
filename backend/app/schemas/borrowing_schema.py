from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.borrowing_models import BorrowStatus

class BorrowRequestBase(BaseModel):
    equipment_item_id: str
    borrower_name: str
    borrower_email: str
    borrower_phone: str
    request_details: Optional[str] = None
    return_date: datetime

class BorrowRequestCreate(BorrowRequestBase):
    pass

class BorrowRequest(BorrowRequestBase):
    id: str
    borrower_id: str
    request_date: datetime
    status: BorrowStatus

    class Config:
        from_attributes = True


class BorrowRequestUpdate(BaseModel):
    status: BorrowStatus