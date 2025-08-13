from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional

class UserSchema(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    name: str
    email: EmailStr
    hashed_password: str
    role: str = "Borrower"
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Jane Doe",
                "email": "jdoe@example.com",
                "password": "password123",
                "role": "Borrower"
            }
        }

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    email: EmailStr
    role: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True

class UserCreateSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    admin_secret: Optional[str] = None