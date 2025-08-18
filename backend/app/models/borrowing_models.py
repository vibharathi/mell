import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime

class BorrowStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    DENIED = "Denied"
    CHECKED_OUT = "Checked Out"
    RETURNED = "Returned"
    CANCELLED = "Cancelled"

class BorrowRequest(Base):
    __tablename__ = "borrow_requests"

    id = Column(Integer, primary_key=True, index=True)
    equipment_item_id = Column(Integer, ForeignKey("equipment_items.id"))
    borrower_id = Column(Integer, ForeignKey("users.id"))
    request_date = Column(DateTime, default=datetime.utcnow)
    return_date = Column(DateTime, nullable=True)
    request_details = Column(String, nullable=True)
    status = Column(Enum(BorrowStatus), default=BorrowStatus.PENDING)

    borrower = relationship("User", back_populates="borrow_requests")
    equipment_item = relationship("EquipmentItem", back_populates="borrow_requests")