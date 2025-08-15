from pydantic import BaseModel
from typing import Optional

class EquipmentItem(BaseModel):
    name: str
    description: str
    category: str
    condition: str
    image_url: Optional[str] = None
    status: str