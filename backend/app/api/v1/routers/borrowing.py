from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.borrowing_schema import BorrowRequest, BorrowRequestCreate, BorrowRequestUpdate
from app.services import borrowing_service
from app.api.v1.dependencies import get_current_user, get_current_admin_user
from app.schemas.user_schema import UserSchema
import logging

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/borrow-requests", tags=["Borrowing"])

@router.post("/", response_model=BorrowRequest, response_model_by_alias=False)
async def create_borrow_request(
    request_data: BorrowRequestCreate,
    current_user: UserSchema = Depends(get_current_user),
):
    created_request = await borrowing_service.create_borrow_request(
        request_data, current_user.id
    )
    if not created_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create borrow request",
        )
    
    # Log the response before returning it
    logger.info(f"Router returning borrow request: {created_request}")
    
    return created_request


@router.get("/", response_model=List[BorrowRequest], response_model_by_alias=False)
async def get_all_borrow_requests(
    current_user: UserSchema = Depends(get_current_admin_user),
):
    return await borrowing_service.get_all_borrow_requests()


@router.get(
    "/my-requests", response_model=List[BorrowRequest], response_model_by_alias=False
)
async def get_my_borrow_requests(
    current_user: UserSchema = Depends(get_current_user),
):
    return await borrowing_service.get_user_borrow_requests(current_user.id)


@router.put(
    "/{request_id}", response_model=BorrowRequest, response_model_by_alias=False
)
async def update_borrow_request_status(
    request_id: str,
    status_update: BorrowRequestUpdate,
    current_user: UserSchema = Depends(get_current_user),
):
    updated_request = await borrowing_service.update_borrow_request_status(
        request_id, status_update.status, current_user
    )
    if not updated_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Borrow request not found or user not authorized to update",
        )
    return updated_request