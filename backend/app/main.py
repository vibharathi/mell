from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.database import client
from .api.v1.routers import auth, users, inventory, borrowing

app = FastAPI()

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(inventory.router)
app.include_router(borrowing.router)

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://mell-ps53.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_client():
    try:
        client.admin.command('ping')
        print("Successfully connected to MongoDB")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")


@app.on_event("shutdown")
def shutdown_db_client():
    client.close()

@app.get("/api/v1/health")
def health_check():
    print("Health check endpoint reached")
    return {"status": "ok"}