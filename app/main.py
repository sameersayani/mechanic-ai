from fastapi import FastAPI
import asyncio
import os
from dotenv import load_dotenv
from app.routes import customer, vehicle, job
from app.init_db import init_db
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth
from app.routes import mechanic
from app.routes import invoice
from app.routes import business

# Load .env in development/local runs
load_dotenv()

app = FastAPI()

@app.on_event("startup")
async def startup():
    # Run blocking DB initialization in a background thread to avoid
    # blocking the event loop and causing lifespan cancellation issues.
    await asyncio.to_thread(init_db)

allowed = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allow_origins = [o.strip() for o in allowed.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(business.router)
app.include_router(customer.router)
app.include_router(vehicle.router)
app.include_router(job.router)
# AI router can perform network calls at import/runtime; exclude temporarily for troubleshooting
from app.routes import ai
app.include_router(ai.router)
app.include_router(auth.router)
app.include_router(mechanic.router)
app.include_router(invoice.router)

@app.get("/")
def root():
    return {"message": "Mechanic AI Backend Running"}