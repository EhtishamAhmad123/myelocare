from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models, schemas, auth, database

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

@router.post("/")
def book_appointment(
    data: schemas.AppointmentCreate,
    current_user: models.User = Depends(auth.require_role(models.UserRole.patient)),
    db: Session = Depends(database.get_db)
):
    # Check if doctor exists
    doctor = db.query(models.DoctorProfile).filter(models.DoctorProfile.id == data.doctor_id).first()
    if not doctor:
        raise HTTPException(404, "Doctor not found")
    
    appt = models.Appointment(
        patient_id=current_user.id,
        doctor_id=data.doctor_id,
        appointment_date=data.appointment_date,
        notes=data.notes,
        status="pending"
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return {"message": "Appointment booked", "appointment_id": appt.id}

@router.get("/my")
def my_appointments(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    print(f"User authenticated: {current_user.id} - {current_user.role}")
    
    appointments_list = []
    
    # FOR PATIENTS: Get appointments where patient_id matches
    if current_user.role == "patient":
        appts = db.query(models.Appointment).filter(
            models.Appointment.patient_id == current_user.id
        ).all()
        
        for a in appts:
            # Get doctor details
            doctor_name = None
            hospital = None
            if a.doctor_id:
                doc_profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.id == a.doctor_id).first()
                if doc_profile:
                    hospital = doc_profile.hospital_name
                    doctor_user = db.query(models.User).filter(models.User.id == doc_profile.user_id).first()
                    if doctor_user:
                        doctor_name = doctor_user.full_name
            
            appointments_list.append({
                "id": a.id,
                "appointment_date": a.appointment_date.isoformat() if a.appointment_date else None,
                "status": a.status,
                "notes": a.notes,
                "doctor_feedback": a.doctor_feedback,
                "prescription": a.prescription,
                "has_lab_test": False,
                "doctor_name": doctor_name,
                "hospital": hospital,
            })
    
    # FOR DOCTORS: Get appointments where doctor_id matches their profile ID
    elif current_user.role == "doctor":
        # First, find the doctor's profile
        doctor_profile = db.query(models.DoctorProfile).filter(
            models.DoctorProfile.user_id == current_user.id
        ).first()
        
        if not doctor_profile:
            print(f"No doctor profile found for user {current_user.id}")
            return []
        
        print(f"Found doctor profile ID: {doctor_profile.id}")
        
        # Get appointments for this doctor using the profile ID (not user ID)
        appts = db.query(models.Appointment).filter(
            models.Appointment.doctor_id == doctor_profile.id
        ).all()
        
        print(f"Found {len(appts)} appointments for doctor")
        
        for a in appts:
            # Get patient details
            patient_name = None
            if a.patient_id:
                patient = db.query(models.User).filter(models.User.id == a.patient_id).first()
                if patient:
                    patient_name = patient.full_name
            
            appointments_list.append({
                "id": a.id,
                "appointment_date": a.appointment_date.isoformat() if a.appointment_date else None,
                "status": a.status,
                "notes": a.notes,
                "doctor_feedback": a.doctor_feedback,
                "prescription": a.prescription,
                "has_lab_test": False,
                "patient_name": patient_name,
                "patient_id": a.patient_id,
            })
    
    return appointments_list

@router.get("/{appt_id}")
def get_appointment(
    appt_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
    
    if not appt:
        raise HTTPException(404, "Appointment not found")
    
    # Check authorization for patients
    if current_user.role == "patient" and appt.patient_id != current_user.id:
        raise HTTPException(403, "Not authorized to view this appointment")
    
    # Check authorization for doctors
    if current_user.role == "doctor":
        doctor_profile = db.query(models.DoctorProfile).filter(
            models.DoctorProfile.user_id == current_user.id
        ).first()
        if not doctor_profile or appt.doctor_id != doctor_profile.id:
            raise HTTPException(403, "Not authorized to view this appointment")
    
    # Get doctor details
    doctor_name = None
    hospital = None
    specialization = None
    if appt.doctor_id:
        doc_profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.id == appt.doctor_id).first()
        if doc_profile:
            hospital = doc_profile.hospital_name
            specialization = doc_profile.specialization
            doctor_user = db.query(models.User).filter(models.User.id == doc_profile.user_id).first()
            if doctor_user:
                doctor_name = doctor_user.full_name
    
    # Get patient details
    patient_name = None
    if appt.patient_id:
        patient = db.query(models.User).filter(models.User.id == appt.patient_id).first()
        if patient:
            patient_name = patient.full_name
    
    return {
        "id": appt.id,
        "appointment_date": appt.appointment_date.isoformat() if appt.appointment_date else None,
        "status": appt.status,
        "notes": appt.notes,
        "doctor_feedback": appt.doctor_feedback,
        "prescription": appt.prescription,
        "has_lab_test": False,
        "doctor": {
            "name": doctor_name,
            "hospital": hospital,
            "specialization": specialization,
        },
        "patient": {
            "id": appt.patient_id,
            "name": patient_name,
        }
    }

@router.put("/{appt_id}/status")
def update_status(
    appt_id: int,
    status: str,
    current_user: models.User = Depends(auth.require_role(models.UserRole.doctor)),
    db: Session = Depends(database.get_db)
):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(404, "Appointment not found")
    appt.status = status
    db.commit()
    return {"message": "Status updated"}

@router.post("/feedback")
def give_feedback(
    data: schemas.FeedbackCreate,
    current_user: models.User = Depends(auth.require_role(models.UserRole.doctor)),
    db: Session = Depends(database.get_db)
):
    appt = db.query(models.Appointment).filter(models.Appointment.id == data.appointment_id).first()
    if not appt:
        raise HTTPException(404, "Appointment not found")
    appt.doctor_feedback = data.doctor_feedback
    appt.prescription = data.prescription
    appt.status = "completed"
    db.commit()
    return {"message": "Feedback saved"}

@router.put("/{appt_id}/auto-update-status")
def auto_update_appointment_status(
    db: Session = Depends(database.get_db)
):
    """Automatically update status of all past appointments"""
    from datetime import datetime
    
    # Get all pending appointments with past dates
    past_appointments = db.query(models.Appointment).filter(
        models.Appointment.status == "pending",
        models.Appointment.appointment_date < datetime.utcnow()
    ).all()
    
    updated_count = 0
    for apt in past_appointments:
        apt.status = "cancelled"
        apt.notes = (apt.notes or "") + "\n[Auto-cancelled: Patient did not show up]"
        updated_count += 1
    
    db.commit()
    return {"message": f"Updated {updated_count} past appointments to cancelled"}