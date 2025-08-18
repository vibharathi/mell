import pytest
from fastapi.testclient import TestClient
from fastapi import status

from app.main import app
from app.api.v1.dependencies import get_current_admin_user
from app.schemas.user_schema import UserSchema

client = TestClient(app)

# Mock admin user for testing protected endpoints
async def override_get_current_admin_user():
    return UserSchema(
        id="60c72b9f9b1d8c001f8e4a3a",
        name="Test Admin",
        email="admin@test.com",
        role="Admin",
        hashed_password="dummy_password",
    )

app.dependency_overrides[get_current_admin_user] = override_get_current_admin_user


def test_get_all_equipment_items():
    response = client.get("/api/v1/inventory/")
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)


def test_create_and_delete_equipment_item():
    # Create a new item
    new_item_data = {
        "name": "Test Wheelchair",
        "description": "A sturdy wheelchair",
        "category": "Mobility Equipment",
        "condition": "New",
        "status": "Available",
    }
    response = client.post("/api/v1/inventory/", json=new_item_data)
    assert response.status_code == status.HTTP_200_OK
    created_item = response.json()
    assert created_item["name"] == new_item_data["name"]

    # Delete the item
    item_id = created_item["_id"]
    response = client.delete(f"/api/v1/inventory/{item_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT