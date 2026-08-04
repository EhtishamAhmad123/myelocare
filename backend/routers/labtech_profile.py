from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import sys
import os
import shutil
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models, auth, database

router = APIRouter(prefix="/api/labtech", tags=["labtech"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "labtech_profiles")

@router.get("/profile")
def get_profile(
    current_user: models.User = Depends(auth.require_role(models.UserRole.labtech)),
    db: Session = Depends(database.get_db)
):
    profile = db.query(models.LabTechProfile).filter(models.LabTechProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(404, "Profile not found")
    
    return {
        "lab_name": profile.lab_name,
        "lab_address": profile.lab_address,
        "city": profile.city,
        "phone": current_user.phone,
        "bio": getattr(profile, 'bio', ''),
        "ahpc_registration_no": profile.ahpc_registration_no,
        "verification_status": profile.verification_status,
        "profile_image": getattr(profile, 'profile_image', None)
    }

@router.put("/profile")
def update_profile(
    data: dict,
    current_user: models.User = Depends(auth.require_role(models.UserRole.labtech)),
    db: Session = Depends(database.get_db)
):
    profile = db.query(models.LabTechProfile).filter(models.LabTechProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(404, "Profile not found")
    
    if 'lab_name' in data:
        profile.lab_name = data['lab_name']
    if 'lab_address' in data:
        profile.lab_address = data['lab_address']
    if 'city' in data:
        profile.city = data['city']
    if 'bio' in data:
        profile.bio = data['bio']
    if 'phone' in data:
        current_user.phone = data['phone']
    
    db.commit()
    return {"message": "Profile updated successfully"}

@router.post("/upload-profile-image")
async def upload_profile_image(
    profile_image: UploadFile = File(...),
    current_user: models.User = Depends(auth.require_role(models.UserRole.labtech)),
    db: Session = Depends(database.get_db)
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(profile_image.filename)[1]
    filename = f"labtech_{current_user.id}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(profile_image.file, buffer)
    
    profile = db.query(models.LabTechProfile).filter(models.LabTechProfile.user_id == current_user.id).first()
    if profile:
        profile.profile_image = f"/uploads/labtech_profiles/{filename}"
        db.commit()
    
    return {"message": "Profile image uploaded", "path": f"/uploads/labtech_profiles/{filename}"}