from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum

class ItemStatus(str, enum.Enum):
    AVAILABLE = "Available"
    UNAVAILABLE = "Unavailable"

class EquipmentItem(Base):
    __tablename__ = 'equipment_items'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    category = Column(String)
    condition = Column(String)
    image_url = Column(String, nullable=True)
    status = Column(Enum(ItemStatus), default=ItemStatus.AVAILABLE)

    borrow_requests = relationship("BorrowRequest", back_populates="equipment_item")