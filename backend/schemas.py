from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import UserRole, AppointmentStatus, TestStatus
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re

# User schemas
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str
    phone: Optional[str] = None
    doctor_profile_id: Optional[int] = None  # NEW: For claiming existing profile
    pmdc_license: Optional[str] = None  # NEW: For verification

    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    full_name: str

# Doctor schemas
class DoctorProfileUpdate(BaseModel):
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    hospital_address: Optional[str] = None
    city: Optional[str] = None
    consultation_fee: Optional[float] = None
    available_days: Optional[str] = None
    available_start: Optional[str] = None
    available_end: Optional[str] = None
    bio: Optional[str] = None

class DoctorOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    specialization: str
    hospital_name: Optional[str] = None
    hospital_address: Optional[str] = None
    city: Optional[str] = None
    consultation_fee: float = 0
    available_days: Optional[str] = None
    available_start: Optional[str] = None
    available_end: Optional[str] = None
    bio: Optional[str] = None
    rating: float = 0.0
    total_reviews: int = 0
    
    class Config:
        from_attributes = True

# Appointment schemas
class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: datetime
    notes: Optional[str] = None

class LabTestCreate(BaseModel):
    appointment_id: int
    scheduled_date: datetime
    lab_name: str
    lab_address: str
    labtech_id: Optional[int] = None

class FeedbackCreate(BaseModel):
    appointment_id: int
    doctor_feedback: str
    prescription: Optional[str] = None

class ReviewCreate(BaseModel):
    doctor_profile_id: int
    rating: int
    comment: Optional[str] = None

class DiagnosticResultOut(BaseModel):
    id: int
    plasma_cells_detected: int
    non_plasma_cells_detected: int
    total_cells: int
    plasma_ratio: float
    mm_positive: bool
    confidence_notes: Optional[str] = None
    annotated_image_path: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# Add after existing schemas

class DoctorClaimRequest(BaseModel):
    doctor_profile_id: int
    pmdc_license: str
    notes: Optional[str] = None

class DoctorClaimResponse(BaseModel):
    id: int
    doctor_profile_id: int
    status: str
    message: str

class UnclaimedDoctorOut(BaseModel):
    id: int
    name: str
    specialization: str
    hospital_name: Optional[str]
    city: Optional[str]
    rating: float
    
    class Config:
        from_attributes = True