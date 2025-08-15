from fastapi import APIRouter, Depends
from typing import List
from app.schemas.user_schema import UserResponse
from app.api.v1.dependencies import get_current_user, get_current_admin_user
from app.services import user_service

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user


@router.get("/", response_model=List[UserResponse])
async def read_all_users(
    current_user: UserResponse = Depends(get_current_admin_user),
):
    users = await user_service.get_all_users()
    admin_users = [user for user in users if user.get("role") == "Admin"]
    return admin_users