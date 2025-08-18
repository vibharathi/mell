import os
import ssl
import certifi
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from sqlalchemy.ext.declarative import declarative_base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

DATABASE_URL = os.getenv("MONGO_DETAILS")
logger.info(f"DATABASE_URL: {DATABASE_URL}")
logger.info(f"SSL Version: {ssl.OPENSSL_VERSION}")
logger.info(f"Certifi CA file path: {certifi.where()}")

try:
    # Log default SSL context details
    context = ssl.create_default_context(cafile=certifi.where())
    logger.info(f"Default SSL context: {context.get_ciphers()}")

    # Explicitly set TLS 1.2 and provide CA file
    client = AsyncIOMotorClient(
        DATABASE_URL,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=20000,
        socketTimeoutMS=20000
    )
    logger.info("MongoDB client created successfully with TLS 1.2")
except Exception as e:
    logger.error(f"Failed to create MongoDB client: {e}")
    raise e

db = client.get_database("MELL")

Base = declarative_base()

async def get_db():
    return db

# Test connection function
async def test_connection():
    try:
        # Test the connection
        await client.admin.command('ping')
        logger.info("MongoDB connection test successful")
        return True
    except Exception as e:
        logger.error(f"MongoDB connection test failed: {e}")
        return False