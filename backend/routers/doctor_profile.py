from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models, auth, database

router = APIRouter(prefix="/api/doctor/profile", tags=["doctor"])

@router.get("/")
def get_my_profile(
    current_user: models.User = Depends(auth.require_role(models.UserRole.doctor)),
    db: Session = Depends(database.get_db)
):
    """Get doctor's own profile"""
    profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(404, "Profile not found")
    
    return {
        "id": profile.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "specialization": profile.specialization,
        "hospital_name": profile.hospital_name,
        "consultation_fee": profile.consultation_fee,
        "available_days": profile.available_days,
        "available_start": profile.available_start,
        "available_end": profile.available_end,
        "city": profile.city,
        "bio": profile.bio,
        "is_verified": profile.is_verified,
        "verification_status": profile.verification_status,
        "profile_update_status": profile.profile_update_status,
        "pending_changes": {
            "hospital_name": profile.pending_hospital_name,
            "consultation_fee": profile.pending_consultation_fee,
            "available_days": profile.pending_available_days,
            "available_start": profile.pending_available_start,
            "available_end": profile.pending_available_end,
            "specialization": profile.pending_specialization,
        } if profile.profile_update_status == "pending" else None
    }

@router.post("/request-update")
def request_profile_update(
    update_data: dict,
    current_user: models.User = Depends(auth.require_role(models.UserRole.doctor)),
    db: Session = Depends(database.get_db)
):
    """Request to update profile (requires admin approval)"""
    profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(404, "Profile not found")
    
    # Store pending changes
    if 'hospital_name' in update_data:
        profile.pending_hospital_name = update_data['hospital_name']
    if 'consultation_fee' in update_data:
        profile.pending_consultation_fee = update_data['consultation_fee']
    if 'available_days' in update_data:
        profile.pending_available_days = update_data['available_days']
    if 'available_start' in update_data:
        profile.pending_available_start = update_data['available_start']
    if 'available_end' in update_data:
        profile.pending_available_end = update_data['available_end']
    if 'specialization' in update_data:
        profile.pending_specialization = update_data['specialization']
    
    profile.profile_update_status = "pending"
    profile.profile_update_requested_at = datetime.utcnow()
    db.commit()
    
    print(f"\n{'='*60}")
    print(f"📝 Doctor PROFILE UPDATE REQUEST from: {current_user.full_name}")
    print(f"Pending changes: {update_data}")
    print(f"{'='*60}\n")
    
    return {"message": "Profile update request submitted for admin approval", "status": "pending"}

@router.put("/update-contact")
def update_contact_info(
    data: dict,
    current_user: models.User = Depends(auth.require_role(models.UserRole.doctor)),
    db: Session = Depends(database.get_db)
):
    """Update contact info (no approval needed)"""
    if 'phone' in data:
        current_user.phone = data['phone']
    if 'bio' in data:
        profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == current_user.id).first()
        if profile:
            profile.bio = data['bio']
    db.commit()
    return {"message": "Contact info updated successfully"}