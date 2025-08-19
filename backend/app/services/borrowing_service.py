from bson import ObjectId
from fastapi import HTTPException, status
from app.db.database import get_db
from app.schemas.borrowing_schema import BorrowRequestCreate
from app.schemas.user_schema import UserSchema
from app.services.inventory_service import INVENTORY_COLLECTION
from app.models.borrowing_models import BorrowStatus
from app.models.inventory_models import EquipmentStatus
from datetime import datetime
import logging

# Set up logging
logger = logging.getLogger(__name__)

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
    request_dict["request_date"] = datetime.utcnow()
    request_dict["status"] = BorrowStatus.PENDING
    
    # Log the request data before insertion
    logger.info(f"Creating borrow request with data: {request_dict}")
    
    result = await db[BORROWING_COLLECTION].insert_one(request_dict)
    created_request = await db[BORROWING_COLLECTION].find_one(
        {"_id": result.inserted_id}
    )
    
    # Log the created request from MongoDB
    logger.info(f"Created borrow request in MongoDB: {created_request}")
    
    # Transform MongoDB document to match the expected schema
    transformed_request = transform_borrow_request(created_request)
    logger.info(f"Transformed borrow request: {transformed_request}")
    
    return transformed_request

def transform_borrow_request(mongo_doc):
    """Transform MongoDB document to match the BorrowRequest schema."""
    if not mongo_doc:
        return None
        
    # Create a copy to avoid modifying the original
    transformed = dict(mongo_doc)
    
    # Rename _id to id and convert to string
    if "_id" in transformed:
        transformed["id"] = str(transformed["_id"])
        del transformed["_id"]
    
    # Convert borrower_id to string
    if "borrower_id" in transformed:
        transformed["borrower_id"] = str(transformed["borrower_id"])
    
    # Ensure all required fields are present
    if "borrower_name" not in transformed:
        transformed["borrower_name"] = "N/A"
    if "borrower_email" not in transformed:
        transformed["borrower_email"] = "N/A"
    if "borrower_phone" not in transformed:
        transformed["borrower_phone"] = "N/A"
    if "return_date" not in transformed:
        transformed["return_date"] = datetime.utcnow()
    if "request_date" not in transformed:
        transformed["request_date"] = datetime.utcnow()
    if "status" not in transformed:
        transformed["status"] = BorrowStatus.PENDING

    return transformed


async def get_all_borrow_requests():
    db = await get_db()
    requests_cursor = db[BORROWING_COLLECTION].find()
    return [
        transform_borrow_request(request) async for request in requests_cursor
    ]


async def get_user_borrow_requests(user_id: str):
    db = await get_db()
    requests_cursor = db[BORROWING_COLLECTION].find({"borrower_id": user_id})
    return [
        transform_borrow_request(request) async for request in requests_cursor
    ]


async def update_borrow_request_status(
    request_id: str, new_status: BorrowStatus, current_user: UserSchema
):
    db = await get_db()
    
    # Find the borrow request
    borrow_request = await db[BORROWING_COLLECTION].find_one(
        {"_id": ObjectId(request_id)}
    )
    if not borrow_request:
        return None

    # Authorization check
    is_admin = current_user.role == "Admin"
    is_borrower = str(borrow_request["borrower_id"]) == str(current_user.id)

    if not is_admin and not is_borrower:
        return None  # Not authorized

    # Logic for status change
    if is_borrower:
        # Borrowers can only cancel pending requests
        if (
            borrow_request["status"] == BorrowStatus.PENDING
            and new_status == BorrowStatus.CANCELLED
        ):
            await db[BORROWING_COLLECTION].update_one(
                {"_id": ObjectId(request_id)},
                {"$set": {"status": new_status}},
            )
        else:
            return None  # Invalid status change for borrower
    elif is_admin:
        # Admins can approve, deny, etc.
        await db[BORROWING_COLLECTION].update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": new_status}},
        )
        # Update equipment status if necessary
        if new_status == BorrowStatus.APPROVED:
            await db[INVENTORY_COLLECTION].update_one(
                {"_id": ObjectId(borrow_request["equipment_item_id"])},
                {"$set": {"status": EquipmentStatus.UNAVAILABLE}},
            )
        elif new_status == BorrowStatus.RETURNED:
            await db[INVENTORY_COLLECTION].update_one(
                {"_id": ObjectId(borrow_request["equipment_item_id"])},
                {"$set": {"status": EquipmentStatus.AVAILABLE}},
            )

    updated_request = await db[BORROWING_COLLECTION].find_one(
        {"_id": ObjectId(request_id)}
    )
    return transform_borrow_request(updated_request)