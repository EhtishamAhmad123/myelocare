from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models, auth, database

router = APIRouter(prefix="/api/doctors", tags=["doctors"])

@router.get("/")
def list_doctors(
    city: Optional[str] = None, 
    db: Session = Depends(database.get_db)
):
    """List all doctors with their profiles and user info"""
    
    # Get all doctor profiles that are claimed/verified
    profiles = db.query(models.DoctorProfile).filter(
        models.DoctorProfile.is_claimed == True,
        models.DoctorProfile.is_verified == True
    ).all()
    
    doctors_list = []
    for profile in profiles:
        # Get the associated user
        user = db.query(models.User).filter(models.User.id == profile.user_id).first()
        
        if user:
            doctors_list.append({
                "id": profile.id,
                "user_id": user.id,
                "full_name": user.full_name,  # This is where the name comes from
                "specialization": profile.specialization or "Hematologist",
                "hospital_name": profile.hospital_name,
                "hospital_address": profile.hospital_address,
                "city": profile.city,
                "consultation_fee": profile.consultation_fee or 0,
                "available_days": profile.available_days,
                "available_start": profile.available_start,
                "available_end": profile.available_end,
                "bio": profile.bio,
                "rating": profile.rating or 0.0,
                "total_reviews": profile.total_reviews or 0,
            })
    
    return doctors_list

@router.get("/{doctor_id}")
def get_doctor(doctor_id: int, db: Session = Depends(database.get_db)):
    """Get single doctor details"""
    profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.id == doctor_id).first()
    
    if not profile:
        raise HTTPException(404, "Doctor not found")
    
    user = db.query(models.User).filter(models.User.id == profile.user_id).first()
    
    if not user:
        raise HTTPException(404, "Doctor user not found")
    
    return {
        "id": profile.id,
        "user_id": user.id,
        "full_name": user.full_name,
        "specialization": profile.specialization or "Hematologist",
        "hospital_name": profile.hospital_name,
        "hospital_address": profile.hospital_address,
        "city": profile.city,
        "consultation_fee": profile.consultation_fee or 0,
        "available_days": profile.available_days,
        "available_start": profile.available_start,
        "available_end": profile.available_end,
        "bio": profile.bio,
        "rating": profile.rating or 0.0,
        "total_reviews": profile.total_reviews or 0,
    }