from fastapi import FastAPI
from app.routes import customer, vehicle, job
from app.init_db import init_db
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ai
from app.routes import auth

app = FastAPI()

@app.on_event("startup")
def startup():
    init_db()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:3000"], 
    allow_methods=["*"], 
    allow_headers=["*"],
    allow_credentials=True)
app.include_router(customer.router)
app.include_router(vehicle.router)
app.include_router(job.router)
app.include_router(ai.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Mechanic AI Backend Running"}