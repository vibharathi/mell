from pydantic import BaseModel, Field, GetJsonSchemaHandler
from typing import Optional, Any
from bson import ObjectId
from pydantic_core import core_schema
from enum import Enum

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, _: Any):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ):
        return handler(core_schema.string_schema())

class EquipmentCategory(str, Enum):
    MOBILITY_EQUIPMENT = "Mobility Equipment"
    BEDROOM_AIDS = "Bedroom Aids"
    BATHROOM_AIDS = "Bathroom Aids"
    SUPPORT_EQUIPMENT = "Support Equipment"
    MISCELLANEOUS = "Miscellaneous"

class EquipmentItemBase(BaseModel):
    name: str
    description: str
    category: EquipmentCategory
    condition: str
    image_url: Optional[str] = None
    status: str

class EquipmentItemCreate(EquipmentItemBase):
    pass

class EquipmentItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None

class EquipmentItem(EquipmentItemBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        json_encoders = {ObjectId: str}
        from_attributes = True
        populate_by_name = True