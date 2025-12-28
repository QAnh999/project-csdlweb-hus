from fastapi import FastAPI
from app.routes import auth, flights, users

app = FastAPI(title="Lotus Travel API")

app.include_router(auth.router)
app.include_router(flights.router)
app.include_router(users.router)
