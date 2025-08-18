from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.inventory_schema import EquipmentItem, EquipmentItemCreate, EquipmentItemUpdate
from app.services import inventory_service
from app.api.v1.dependencies import get_current_admin_user, get_current_user
from app.schemas.user_schema import UserSchema

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])


@router.post("/", response_model=EquipmentItem, response_model_by_alias=False)
async def create_item(
    item_data: EquipmentItemCreate,
    current_user: UserSchema = Depends(get_current_admin_user),
):
    created_item = await inventory_service.create_equipment_item(item_data)
    if not created_item:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create equipment item",
        )
    return created_item


@router.get("/", response_model=List[EquipmentItem], response_model_by_alias=False)
async def get_all_items(
    name: str = None, category: str = None, status: str = None
):
    items = await inventory_service.get_all_equipment_items(
        name=name, category=category, status=status
    )
    return items


@router.get("/{item_id}", response_model=EquipmentItem, response_model_by_alias=False)
async def get_item(item_id: str, current_user: UserSchema = Depends(get_current_user)):
    item = await inventory_service.get_equipment_item(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Equipment item not found"
        )
    return item


@router.put("/{item_id}", response_model=EquipmentItem, response_model_by_alias=False)
async def update_item(
    item_id: str,
    item_data: EquipmentItemUpdate,
    current_user: UserSchema = Depends(get_current_admin_user),
):
    updated_item = await inventory_service.update_equipment_item(item_id, item_data)
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Equipment item not found"
        )
    return updated_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: str, current_user: UserSchema = Depends(get_current_admin_user)
):
    deleted = await inventory_service.delete_equipment_item(item_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Equipment item not found"
        )
    return None
