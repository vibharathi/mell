from bson import ObjectId
from fastapi import HTTPException, status
from app.db.database import get_db
from app.schemas.borrowing_schema import BorrowRequestCreate
from app.services.inventory_service import INVENTORY_COLLECTION

BORROWING_COLLECTION = "borrow_requests"


async def create_borrow_request(
    request_data: BorrowRequestCreate, user_id: str
):
    db = await get_db()
    
    # Check if the equipment item exists and is available
    equipment_item = await db[INVENTORY_COLLECTION].find_one(
        {"_id": ObjectId(request_data.equipment_item_id)}
    )
    if not equipment_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment item not found",
        )
    if equipment_item["status"] != "Available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Equipment item is not available for borrowing",
        )

    request_dict = request_data.model_dump()
    request_dict["borrower_id"] = user_id
    
    result = await db[BORROWING_COLLECTION].insert_one(request_dict)
    created_request = await db[BORROWING_COLLECTION].find_one(
        {"_id": result.inserted_id}
    )
    return created_request