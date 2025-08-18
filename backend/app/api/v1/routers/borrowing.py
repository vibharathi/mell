from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.borrowing_schema import BorrowRequest, BorrowRequestCreate
from app.services import borrowing_service
from app.api.v1.dependencies import get_current_user
from app.schemas.user_schema import UserSchema

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
    return created_request