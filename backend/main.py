from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import models, database, os
from routers import auth, doctors, appointments, lab_tests, password_reset, admin, doctor_profile, labtech_profile

app = FastAPI(title="MyeloCare API")

# Configure CORS properly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
models.Base.metadata.create_all(bind=database.engine)

# Create uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include all routers
app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(lab_tests.router)
app.include_router(password_reset.router)
app.include_router(admin.router)
app.include_router(doctor_profile.router)
app.include_router(labtech_profile.router)

@app.get("/")
def root():
    return {"message": "MyeloCare API running"}

@app.get("/health")
def health():
    return {"status": "ok"}