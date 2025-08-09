from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from ....schemas.user_schema import UserSchema, UserResponse
from ....core.security import get_password_hash, verify_password, create_access_token
from ....db.database import db
from ....core.config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserSchema):
    user_exists = await db.users.find_one({"email": user.email})
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed_password = get_password_hash(user.hashed_password)
    user.hashed_password = hashed_password
    new_user = await db.users.insert_one(user.dict(by_alias=True))
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    return created_user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
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