from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user_schema import UserSchema, UserResponse, UserCreateSchema
from app.core.security import get_password_hash, verify_password, create_access_token
from app.db.database import get_db
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreateSchema):
    db = await get_db()
    user_exists = await db.users.find_one({"email": user.email})
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]
    if user.admin_secret == settings.ADMIN_SECRET:
        user_dict["role"] = "Admin"
    else:
        user_dict["role"] = "Borrower"
    user_dict["createdAt"] = datetime.utcnow()
    user_dict["updatedAt"] = datetime.utcnow()
    new_user = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    return created_user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = await get_db()
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=None
    )
    return {"access_token": access_token, "token_type": "bearer"}