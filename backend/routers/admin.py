from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models, auth, database

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Admin authentication check
def require_admin(current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ==================== PENDING DOCTORS ====================

@router.get("/pending-doctors")
def get_pending_doctors(
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Get all doctor registrations pending approval"""
    doctors = db.query(models.User).filter(
        models.User.role == "doctor",
        models.User.is_active == False
    ).all()
    
    result = []
    for doctor in doctors:
        # Get doctor profile separately
        profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == doctor.id).first()
        result.append({
            "id": doctor.id,
            "full_name": doctor.full_name,
            "email": doctor.email,
            "phone": doctor.phone,
            "pmdc_license": profile.pmdc_license if profile else None,
            "specialization": profile.specialization if profile else None,
            "hospital_name": profile.hospital_name if profile else None,
            "registered_at": doctor.created_at.isoformat() if doctor.created_at else None,
        })
    return result


@router.post("/approve-doctor/{doctor_id}")
def approve_doctor(
    doctor_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Approve a doctor registration"""
    doctor = db.query(models.User).filter(
        models.User.id == doctor_id,
        models.User.role == "doctor"
    ).first()
    
    if not doctor:
        raise HTTPException(404, "Doctor not found")
    
    doctor.is_active = True
    
    # Update doctor profile
    profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == doctor.id).first()
    if profile:
        profile.is_verified = True
        profile.verification_status = "approved"
    
    db.commit()
    
    return {"message": f"Doctor {doctor.full_name} approved successfully"}


@router.post("/reject-doctor/{doctor_id}")
def reject_doctor(
    doctor_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Reject a doctor registration"""
    doctor = db.query(models.User).filter(
        models.User.id == doctor_id,
        models.User.role == "doctor"
    ).first()
    
    if not doctor:
        raise HTTPException(404, "Doctor not found")
    
    profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == doctor.id).first()
    if profile:
        profile.verification_status = "rejected"
    doctor.is_active = False
    
    db.commit()
    
    return {"message": f"Doctor {doctor.full_name} rejected"}


# ==================== DOCTOR MANAGEMENT ====================

@router.get("/all-doctors")
def get_all_doctors(
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Get all doctors"""
    doctors = db.query(models.User).filter(models.User.role == "doctor").all()
    
    result = []
    for doc in doctors:
        profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == doc.id).first()
        result.append({
            "id": doc.id,
            "profile_id": profile.id if profile else None,
            "full_name": doc.full_name,
            "email": doc.email,
            "phone": doc.phone,
            "specialization": profile.specialization if profile else "Hematologist",
            "hospital_name": profile.hospital_name if profile else "N/A",
            "consultation_fee": profile.consultation_fee if profile else 0,
            "city": profile.city if profile else "",
            "available_days": profile.available_days if profile else "Mon,Tue,Wed,Thu,Fri,Sat",
            "available_start": profile.available_start if profile else "09:00",
            "available_end": profile.available_end if profile else "17:00",
            "rating": profile.rating if profile else 0,
            "total_reviews": profile.total_reviews if profile else 0,
            "is_active": doc.is_active,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
        })
    return result


@router.put("/doctors/{doctor_id}")
def update_doctor(
    doctor_id: int,
    doctor_data: dict,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Update doctor information"""
    doctor = db.query(models.User).filter(
        models.User.id == doctor_id,
        models.User.role == "doctor"
    ).first()
    
    if not doctor:
        raise HTTPException(404, "Doctor not found")
    
    profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == doctor.id).first()
    
    # Update user fields
    if 'full_name' in doctor_data:
        doctor.full_name = doctor_data['full_name']
    if 'email' in doctor_data:
        doctor.email = doctor_data['email']
    if 'phone' in doctor_data:
        doctor.phone = doctor_data['phone']
    
    # Update profile fields
    if profile:
        if 'specialization' in doctor_data:
            profile.specialization = doctor_data['specialization']
        if 'hospital_name' in doctor_data:
            profile.hospital_name = doctor_data['hospital_name']
        if 'consultation_fee' in doctor_data:
            profile.consultation_fee = doctor_data['consultation_fee']
        if 'city' in doctor_data:
            profile.city = doctor_data['city']
    
    db.commit()
    
    return {"message": "Doctor updated successfully"}


@router.delete("/doctors/{doctor_id}")
def delete_doctor(
    doctor_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Delete a doctor"""
    doctor = db.query(models.User).filter(
        models.User.id == doctor_id,
        models.User.role == "doctor"
    ).first()
    
    if not doctor:
        raise HTTPException(404, "Doctor not found")
    
    # Delete profile first
    profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == doctor.id).first()
    if profile:
        db.delete(profile)
    
    db.delete(doctor)
    db.commit()
    
    return {"message": "Doctor deleted successfully"}


# ==================== PATIENT MANAGEMENT ====================

@router.get("/all-patients")
def get_all_patients(
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Get all patients"""
    patients = db.query(models.User).filter(models.User.role == "patient").all()
    return [{
        "id": p.id,
        "full_name": p.full_name,
        "email": p.email,
        "phone": p.phone,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "is_active": p.is_active,
    } for p in patients]


@router.delete("/patients/{patient_id}")
def delete_patient(
    patient_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Delete a patient"""
    patient = db.query(models.User).filter(
        models.User.id == patient_id,
        models.User.role == "patient"
    ).first()
    
    if not patient:
        raise HTTPException(404, "Patient not found")
    
    db.delete(patient)
    db.commit()
    
    return {"message": "Patient deleted successfully"}


# ==================== LAB TECHNICIAN MANAGEMENT ====================

@router.get("/all-labtechs")
def get_all_labtechs(
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Get all lab technicians"""
    labtechs = db.query(models.User).filter(models.User.role == "labtech").all()
    return [{
        "id": l.id,
        "full_name": l.full_name,
        "email": l.email,
        "phone": l.phone,
        "created_at": l.created_at.isoformat() if l.created_at else None,
        "is_active": l.is_active,
    } for l in labtechs]


@router.delete("/labtechs/{labtech_id}")
def delete_labtech(
    labtech_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Delete a lab technician"""
    labtech = db.query(models.User).filter(
        models.User.id == labtech_id,
        models.User.role == "labtech"
    ).first()
    
    if not labtech:
        raise HTTPException(404, "Lab technician not found")
    
    # Delete profile
    profile = db.query(models.LabTechProfile).filter(models.LabTechProfile.user_id == labtech.id).first()
    if profile:
        db.delete(profile)
    
    db.delete(labtech)
    db.commit()
    
    return {"message": "Lab technician deleted successfully"}


# ==================== PENDING PROFILE UPDATES ====================

@router.get("/pending-profile-updates")
def get_pending_profile_updates(
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Get all doctors with pending profile updates"""
    doctors = db.query(models.User).filter(models.User.role == "doctor").all()
    
    result = []
    for doc in doctors:
        profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == doc.id).first()
        if profile and profile.profile_update_status == "pending":
            result.append({
                "doctor_id": doc.id,
                "doctor_name": doc.full_name,
                "email": doc.email,
                "current": {
                    "hospital_name": profile.hospital_name,
                    "consultation_fee": profile.consultation_fee,
                    "available_days": profile.available_days,
                    "available_start": profile.available_start,
                    "available_end": profile.available_end,
                    "specialization": profile.specialization,
                },
                "pending": {
                    "hospital_name": profile.pending_hospital_name,
                    "consultation_fee": profile.pending_consultation_fee,
                    "available_days": profile.pending_available_days,
                    "available_start": profile.pending_available_start,
                    "available_end": profile.pending_available_end,
                    "specialization": profile.pending_specialization,
                },
                "requested_at": profile.profile_update_requested_at.isoformat() if profile.profile_update_requested_at else None
            })
    return result


@router.post("/approve-profile-update/{doctor_id}")
def approve_profile_update(
    doctor_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Approve doctor's profile update request"""
    doctor = db.query(models.User).filter(models.User.id == doctor_id, models.User.role == "doctor").first()
    if not doctor:
        raise HTTPException(404, "Doctor not found")
    
    profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == doctor.id).first()
    if not profile or profile.profile_update_status != "pending":
        raise HTTPException(400, "No pending profile update")
    
    # Apply pending changes
    if profile.pending_hospital_name is not None:
        profile.hospital_name = profile.pending_hospital_name
        profile.pending_hospital_name = None
    if profile.pending_consultation_fee is not None:
        profile.consultation_fee = profile.pending_consultation_fee
        profile.pending_consultation_fee = None
    if profile.pending_available_days is not None:
        profile.available_days = profile.pending_available_days
        profile.pending_available_days = None
    if profile.pending_available_start is not None:
        profile.available_start = profile.pending_available_start
        profile.pending_available_start = None
    if profile.pending_available_end is not None:
        profile.available_end = profile.pending_available_end
        profile.pending_available_end = None
    if profile.pending_specialization is not None:
        profile.specialization = profile.pending_specialization
        profile.pending_specialization = None
    
    profile.profile_update_status = "approved"
    db.commit()
    
    return {"message": f"Profile update approved for Dr. {doctor.full_name}"}


@router.post("/reject-profile-update/{doctor_id}")
def reject_profile_update(
    doctor_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Reject doctor's profile update request"""
    doctor = db.query(models.User).filter(models.User.id == doctor_id, models.User.role == "doctor").first()
    if not doctor:
        raise HTTPException(404, "Doctor not found")
    
    profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == doctor.id).first()
    if not profile:
        raise HTTPException(404, "Profile not found")
    
    # Clear pending changes
    profile.pending_hospital_name = None
    profile.pending_consultation_fee = None
    profile.pending_available_days = None
    profile.pending_available_start = None
    profile.pending_available_end = None
    profile.pending_specialization = None
    profile.profile_update_status = "rejected"
    db.commit()
    
    return {"message": f"Profile update rejected for Dr. {doctor.full_name}"}


# ==================== USER MANAGEMENT ====================
@router.get("/pending-labtechs")
def get_pending_labtechs(
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Get lab technicians pending verification"""
    labtechs = db.query(models.User).filter(
        models.User.role == "labtech",
        models.User.is_active == False
    ).all()
    
    result = []
    for tech in labtechs:
        profile = db.query(models.LabTechProfile).filter(models.LabTechProfile.user_id == tech.id).first()
        if profile:
            result.append({
                "id": tech.id,
                "full_name": tech.full_name,
                "email": tech.email,
                "phone": tech.phone,
                "lab_name": profile.lab_name,
                "city": profile.city,
                "cnic": profile.cnic,
                "ahpc_registration_no": profile.ahpc_registration_no,
                "ahpc_status": profile.ahpc_status,
                "institution_name": profile.institution_name,
                "employee_id": profile.employee_id,
                "supervisor_pmdc_no": profile.supervisor_pmdc_no,
            })
    return result

@router.post("/approve-labtech/{user_id}")
def approve_labtech(
    user_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Approve a lab technician after verification"""
    user = db.query(models.User).filter(models.User.id == user_id, models.User.role == "labtech").first()
    if not user:
        raise HTTPException(404, "Lab technician not found")
    
    user.is_active = True
    
    profile = db.query(models.LabTechProfile).filter(models.LabTechProfile.user_id == user.id).first()
    if profile:
        profile.verification_status = "approved"
        from datetime import datetime
        profile.verified_at = datetime.utcnow()
    
    db.commit()
    return {"message": f"Lab technician {user.full_name} approved successfully"}

@router.post("/reject-labtech/{user_id}")
def reject_labtech(
    user_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Reject a lab technician registration"""
    user = db.query(models.User).filter(models.User.id == user_id, models.User.role == "labtech").first()
    if not user:
        raise HTTPException(404, "Lab technician not found")
    
    profile = db.query(models.LabTechProfile).filter(models.LabTechProfile.user_id == user.id).first()
    if profile:
        profile.verification_status = "rejected"
    
    db.delete(user)
    db.commit()
    return {"message": f"Lab technician {user.full_name} rejected"}


@router.put("/users/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(database.get_db)
):
    """Toggle user active status"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.role == "admin":
        raise HTTPException(403, "Cannot modify admin status")
    
    user.is_active = not user.is_active
    db.commit()
    
    return {"message": f"User {'activated' if user.is_active else 'deactivated'} successfully", "is_active": user.is_active}