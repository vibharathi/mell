from app.db.database import get_db

USERS_COLLECTION = "users"


async def get_all_users():
    db = await get_db()
    users = []
    cursor = db[USERS_COLLECTION].find({})
    async for user in cursor:
        user["_id"] = str(user["_id"])
        users.append(user)
    return users
