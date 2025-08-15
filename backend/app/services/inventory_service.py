from bson import ObjectId
from fastapi import HTTPException, status
from app.db.database import get_db
from app.schemas.inventory_schema import EquipmentItem

INVENTORY_COLLECTION = "inventory"


async def create_equipment_item(item_data: EquipmentItem):
    db = await get_db()
    item_dict = item_data.model_dump()
    result = await db[INVENTORY_COLLECTION].insert_one(item_dict)
    created_item = await db[INVENTORY_COLLECTION].find_one({"_id": result.inserted_id})
    if created_item:
        created_item["_id"] = str(created_item["_id"])
    return created_item


async def get_equipment_item(item_id: str):
    db = await get_db()
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid item ID")
    item = await db[INVENTORY_COLLECTION].find_one({"_id": ObjectId(item_id)})
    if item:
        item["_id"] = str(item["_id"])
    return item


async def update_equipment_item(item_id: str, item_data: EquipmentItem):
    db = await get_db()
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid item ID")
    
    item_dict = item_data.model_dump(exclude_unset=True)
    
    await db[INVENTORY_COLLECTION].update_one(
        {"_id": ObjectId(item_id)}, {"$set": item_dict}
    )
    updated_item = await db[INVENTORY_COLLECTION].find_one({"_id": ObjectId(item_id)})
    if updated_item:
        updated_item["_id"] = str(updated_item["_id"])
    return updated_item


async def delete_equipment_item(item_id: str):
    db = await get_db()
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid item ID")
    result = await db[INVENTORY_COLLECTION].delete_one({"_id": ObjectId(item_id)})
    return result.deleted_count > 0


async def get_all_equipment_items():
    db = await get_db()
    items = []
    cursor = db[INVENTORY_COLLECTION].find()
    async for item in cursor:
        item["_id"] = str(item["_id"])
        items.append(item)
    return items
