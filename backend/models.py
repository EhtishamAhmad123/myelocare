from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    patient = "patient"
    doctor = "doctor"
    labtech = "labtech"
    admin = "admin"

class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"

class TestStatus(str, enum.Enum):
    ordered = "ordered"
    scheduled = "scheduled"
    images_uploaded = "images_uploaded"
    results_ready = "results_ready"
    completed = "completed"
    cancelled = "cancelled"  # ← ADD THIS

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    phone = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)
    labtech_profile = relationship("LabTechProfile", back_populates="user", uselist=False)

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    specialization = Column(String(150), default="Hematology / Oncology")
    hospital_name = Column(String(200))
    hospital_address = Column(Text)
    city = Column(String(100))
    consultation_fee = Column(Float, default=0)
    available_days = Column(String(200))
    available_start = Column(String(10))
    available_end = Column(String(10))
    bio = Column(Text)
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    is_claimed = Column(Boolean, default=False)
    pmdc_license = Column(String(50), nullable=True)
    verification_status = Column(String(20), default="pending")
    verification_notes = Column(Text, nullable=True)
    claimed_at = Column(DateTime(timezone=True), nullable=True)
    pending_hospital_name = Column(String(200), nullable=True)
    pending_consultation_fee = Column(Float, nullable=True)
    pending_available_days = Column(String(200), nullable=True)
    pending_available_start = Column(String(10), nullable=True)
    pending_available_end = Column(String(10), nullable=True)
    pending_specialization = Column(String(150), nullable=True)
    profile_update_status = Column(String(20), default="approved")
    profile_update_requested_at = Column(DateTime(timezone=True), nullable=True)

class LabTechProfile(Base):
    __tablename__ = "labtech_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    lab_name = Column(String(200))
    lab_address = Column(Text)
    city = Column(String(100))
    
    # NEW VERIFICATION FIELDS
    cnic = Column(String(20), nullable=True, unique=True)
    ahpc_registration_no = Column(String(50), nullable=True, unique=True)
    ahpc_status = Column(String(20), default="pending")
    qualification_document = Column(String(500), nullable=True)
    institution_name = Column(String(200), nullable=True)
    employee_id = Column(String(50), nullable=True)
    supervisor_pmdc_no = Column(String(50), nullable=True)
    supervisor_verified = Column(Boolean, default=False)
    verification_status = Column(String(20), default="pending")
    verification_notes = Column(Text, nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="labtech_profile")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"))
    doctor_id = Column(Integer, ForeignKey("doctor_profiles.id"))
    appointment_date = Column(DateTime(timezone=True))
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.pending)
    notes = Column(Text)
    doctor_feedback = Column(Text)
    prescription = Column(Text)
    reschedule_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LabTest(Base):
    __tablename__ = "lab_tests"
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True)
    labtech_id = Column(Integer, ForeignKey("labtech_profiles.id"), nullable=True)
    scheduled_date = Column(DateTime(timezone=True))
    lab_name = Column(String(200))
    lab_address = Column(Text)
    status = Column(Enum(TestStatus), default=TestStatus.ordered)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DiagnosticImage(Base):
    __tablename__ = "diagnostic_images"
    id = Column(Integer, primary_key=True, index=True)
    lab_test_id = Column(Integer, ForeignKey("lab_tests.id"))
    file_path = Column(String(500))
    original_filename = Column(String(255))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

class DiagnosticResult(Base):
    __tablename__ = "diagnostic_results"
    id = Column(Integer, primary_key=True, index=True)
    lab_test_id = Column(Integer, ForeignKey("lab_tests.id"), unique=True)
    plasma_cells_detected = Column(Integer)
    non_plasma_cells_detected = Column(Integer)
    total_cells = Column(Integer)
    plasma_ratio = Column(Float)
    mm_positive = Column(Boolean)
    confidence_notes = Column(Text)
    annotated_image_path = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DoctorReview(Base):
    __tablename__ = "doctor_reviews"
    id = Column(Integer, primary_key=True)
    doctor_profile_id = Column(Integer, ForeignKey("doctor_profiles.id"))
    patient_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())