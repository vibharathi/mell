import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("MONGO_DETAILS")
print(f"DATABASE_URL: {DATABASE_URL}")

client = AsyncIOMotorClient(DATABASE_URL)
db = client.get_database("MELL")

async def get_db():
    return db