from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List
import sys
import os
import uuid
import shutil
from datetime import datetime
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models, auth, database

router = APIRouter(prefix="/api/lab-tests", tags=["lab_tests"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

@router.get("/labtechs", response_model=List[dict])
def list_labtechs(db: Session = Depends(database.get_db)):
    """List all lab technicians"""
    try:
        labtechs = db.query(models.LabTechProfile).options(joinedload(models.LabTechProfile.user)).all()
        result = []
        for l in labtechs:
            if l.user:
                result.append({
                    "id": l.id, 
                    "name": l.user.full_name, 
                    "lab_name": l.lab_name or "Unknown Lab", 
                    "city": l.city or "Unknown",
                    "address": l.lab_address or "Address not provided"
                })
        return result
    except Exception as e:
        print(f"Error in list_labtechs: {e}")
        return []

@router.post("/order")
def order_lab_test(
    data: dict,
    current_user: models.User = Depends(auth.require_role(models.UserRole.doctor)),
    db: Session = Depends(database.get_db)
):
    """Doctor orders a lab test - assigns to selected lab technician"""
    appointment_id = data.get("appointment_id")
    scheduled_date = data.get("scheduled_date")
    lab_name = data.get("lab_name")
    lab_address = data.get("lab_address")
    labtech_id = data.get("labtech_id")  # ← THIS WAS MISSING!
    
    print(f"Ordering lab test - Appointment: {appointment_id}, Lab Tech ID: {labtech_id}")
    
    # Verify appointment exists
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(404, "Appointment not found")
    
    # Get doctor profile
    doctor_profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == current_user.id).first()
    if not doctor_profile:
        raise HTTPException(404, "Doctor profile not found")
    
    if appointment.doctor_id != doctor_profile.id:
        raise HTTPException(403, "Not authorized to order tests for this appointment")
    
    # Check if lab test already exists
    existing_test = db.query(models.LabTest).filter(models.LabTest.appointment_id == appointment_id).first()
    if existing_test:
        raise HTTPException(400, "Lab test already ordered for this appointment")
    
    # Parse scheduled date
    try:
        scheduled_datetime = datetime.fromisoformat(scheduled_date.replace('Z', '+00:00'))
    except:
        raise HTTPException(400, "Invalid date format")
    
    # Create lab test with labtech_id
    lab_test = models.LabTest(
        appointment_id=appointment_id,
        labtech_id=labtech_id,  # ← NOW INCLUDED!
        scheduled_date=scheduled_datetime,
        lab_name=lab_name,
        lab_address=lab_address,
        status="ordered"
    )
    db.add(lab_test)
    db.commit()
    db.refresh(lab_test)
    
    print(f"✅ Lab test ordered successfully - ID: {lab_test.id}, Assigned to Lab Tech: {labtech_id}")
    
    return {"message": "Lab test ordered successfully", "lab_test_id": lab_test.id}
@router.get("/my-pending")
def get_my_pending_tests(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get pending tests assigned to this lab technician"""
    print(f"Getting pending tests for user: {current_user.id} - Role: {current_user.role}")
    
    # Only lab technicians can access this
    if current_user.role != "labtech":
        print(f"User {current_user.id} is not a lab technician")
        return []
    
    # Get lab tech profile
    profile = db.query(models.LabTechProfile).filter(models.LabTechProfile.user_id == current_user.id).first()
    if not profile:
        print(f"No lab tech profile found for user {current_user.id}")
        return []
    
    print(f"Found lab tech profile: {profile.id}, Lab: {profile.lab_name}")
    
    # Get pending tests
    tests = db.query(models.LabTest).filter(
        models.LabTest.labtech_id == profile.id,
        models.LabTest.status.in_(["ordered", "scheduled", "images_uploaded"])
    ).all()
    
    print(f"Found {len(tests)} pending tests")
    
    result = []
    for t in tests:
        # Get appointment and patient info
        appointment = db.query(models.Appointment).filter(models.Appointment.id == t.appointment_id).first()
        patient_name = "Unknown"
        if appointment and appointment.patient_id:
            patient = db.query(models.User).filter(models.User.id == appointment.patient_id).first()
            if patient:
                patient_name = patient.full_name
        
        # Check if images exist
        images = db.query(models.DiagnosticImage).filter(models.DiagnosticImage.lab_test_id == t.id).all()
        has_images = len(images) > 0
        
        # Check if result exists
        result_obj = db.query(models.DiagnosticResult).filter(models.DiagnosticResult.lab_test_id == t.id).first()
        has_result = result_obj is not None
        mm_positive = result_obj.mm_positive if result_obj else None
        
        result.append({
            "id": t.id,
            "patient_name": patient_name,
            "test_type": "Bone Marrow Biopsy",
            "scheduled_date": t.scheduled_date.isoformat() if t.scheduled_date else None,
            "status": t.status,
            "lab_name": t.lab_name,
            "has_images": has_images,
            "has_result": has_result,
            "mm_positive": mm_positive,
        })
    
    return result

@router.get("/{test_id}")
def get_test_details(
    test_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get detailed test information with images and results"""
    print(f"Getting test details for test {test_id}")
    
    lab_test = db.query(models.LabTest).filter(models.LabTest.id == test_id).first()
    if not lab_test:
        raise HTTPException(404, "Test not found")
    
    # Verify lab tech has access
    if current_user.role == "labtech":
        lab_tech_profile = db.query(models.LabTechProfile).filter(
            models.LabTechProfile.user_id == current_user.id
        ).first()
        if not lab_tech_profile or lab_test.labtech_id != lab_tech_profile.id:
            raise HTTPException(403, "Not authorized")
    
    # Get appointment and patient
    appointment = db.query(models.Appointment).filter(models.Appointment.id == lab_test.appointment_id).first()
    patient_name = "Unknown"
    if appointment and appointment.patient_id:
        patient = db.query(models.User).filter(models.User.id == appointment.patient_id).first()
        if patient:
            patient_name = patient.full_name
    
    # Get images
    images = db.query(models.DiagnosticImage).filter(
        models.DiagnosticImage.lab_test_id == test_id
    ).all()
    
    # Get result if exists
    result_obj = db.query(models.DiagnosticResult).filter(
        models.DiagnosticResult.lab_test_id == test_id
    ).first()
    
    return {
        "id": lab_test.id,
        "patient_name": patient_name,
        "test_type": "Bone Marrow Biopsy",
        "scheduled_date": lab_test.scheduled_date.isoformat() if lab_test.scheduled_date else None,
        "status": lab_test.status,
        "has_result": result_obj is not None,
        "has_images": len(images) > 0,
        "result": {
            "plasma_cells": result_obj.plasma_cells_detected,
            "non_plasma_cells": result_obj.non_plasma_cells_detected,
            "total_cells": result_obj.total_cells,
            "plasma_ratio": result_obj.plasma_ratio,
            "mm_positive": result_obj.mm_positive,
            "notes": result_obj.confidence_notes
        } if result_obj else None,
        "images": [{"id": img.id, "path": img.file_path} for img in images]
    }

@router.post("/{test_id}/upload-images")
async def upload_images(
    test_id: int,
    files: List[UploadFile] = File(...),
    current_user: models.User = Depends(auth.require_role(models.UserRole.labtech)),
    db: Session = Depends(database.get_db)
):
    """Upload bone marrow images for a test"""
    print(f"Uploading {len(files)} images for test {test_id}")
    
    # Get the lab test
    lab_test = db.query(models.LabTest).filter(models.LabTest.id == test_id).first()
    if not lab_test:
        raise HTTPException(404, "Lab test not found")
    
    # Verify lab tech owns this test
    lab_tech_profile = db.query(models.LabTechProfile).filter(
        models.LabTechProfile.user_id == current_user.id
    ).first()
    if not lab_tech_profile or lab_test.labtech_id != lab_tech_profile.id:
        raise HTTPException(403, "Not authorized")
    
    # Create directory for this test
    test_dir = os.path.join(UPLOAD_DIR, f"test_{test_id}")
    os.makedirs(test_dir, exist_ok=True)
    
    saved_paths = []
    for file in files:
        # Generate unique filename
        ext = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(test_dir, unique_name)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Save to database
        diagnostic_image = models.DiagnosticImage(
            lab_test_id=test_id,
            file_path=file_path,
            original_filename=file.filename
        )
        db.add(diagnostic_image)
        saved_paths.append(file_path)
    
    # Update lab test status
    lab_test.status = "images_uploaded"
    db.commit()
    
    return {"message": f"{len(files)} image(s) uploaded successfully", "paths": saved_paths}


@router.post("/{test_id}/run-diagnosis")
def run_diagnosis(
    test_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Run YOLOv8 AI diagnosis on uploaded images"""
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    print(f"🔬 Running diagnosis for test {test_id}")
    print(f"Current user: {current_user.id} - Role: {current_user.role}")
    
    # Check if user is lab tech
    if current_user.role != "labtech":
        raise HTTPException(403, "Only lab technicians can run diagnosis")
    
    # Get the lab test
    lab_test = db.query(models.LabTest).filter(models.LabTest.id == test_id).first()
    if not lab_test:
        raise HTTPException(404, "Lab test not found")
    
    # Verify lab tech owns this test
    lab_tech_profile = db.query(models.LabTechProfile).filter(
        models.LabTechProfile.user_id == current_user.id
    ).first()
    
    if not lab_tech_profile or lab_test.labtech_id != lab_tech_profile.id:
        raise HTTPException(403, "Not authorized to run diagnosis for this test")
    
    # Get images
    images = db.query(models.DiagnosticImage).filter(
        models.DiagnosticImage.lab_test_id == test_id
    ).all()
    
    if not images:
        raise HTTPException(400, "No images uploaded yet")
    
    # Get image file paths
    image_paths = [img.file_path for img in images]
    print(f"📷 Processing {len(image_paths)} images")
    
    # Import detector and run inference
    try:
        from ml.detector import run_inference
        inference_result = run_inference(image_paths)
        print(f"✅ Inference complete: {inference_result}")
    except Exception as e:
        print(f"❌ Inference failed: {e}")
        raise HTTPException(500, f"AI diagnosis failed: {str(e)}")
    
    # Save results to database
    existing_result = db.query(models.DiagnosticResult).filter(
        models.DiagnosticResult.lab_test_id == test_id
    ).first()
    
    if existing_result:
        existing_result.plasma_cells_detected = inference_result["plasma_cells"]
        existing_result.non_plasma_cells_detected = inference_result["non_plasma_cells"]
        existing_result.total_cells = inference_result["total_cells"]
        existing_result.plasma_ratio = inference_result["plasma_ratio"]
        existing_result.mm_positive = inference_result["mm_positive"]
        existing_result.confidence_notes = inference_result["notes"]
    else:
        result = models.DiagnosticResult(
            lab_test_id=test_id,
            plasma_cells_detected=inference_result["plasma_cells"],
            non_plasma_cells_detected=inference_result["non_plasma_cells"],
            total_cells=inference_result["total_cells"],
            plasma_ratio=inference_result["plasma_ratio"],
            mm_positive=inference_result["mm_positive"],
            confidence_notes=inference_result["notes"]
        )
        db.add(result)
    
    # Update lab test status
    lab_test.status = "completed"
    db.commit()
    
    print(f"✅ Diagnosis saved for test {test_id}")
    
    return {
        "plasma_cells": inference_result["plasma_cells"],
        "non_plasma_cells": inference_result["non_plasma_cells"],
        "total_cells": inference_result["total_cells"],
        "plasma_ratio": inference_result["plasma_ratio"],
        "mm_positive": inference_result["mm_positive"],
        "notes": inference_result["notes"],
        "images_processed": len(image_paths)
    }

@router.put("/{test_id}/cancel")
def cancel_lab_test(
    test_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Cancel a lab test (only if not already completed)"""
    
    # Check if user is lab tech or doctor
    if current_user.role not in ["labtech", "doctor"]:
        raise HTTPException(403, "Only lab technicians or doctors can cancel tests")
    
    # Get the lab test
    lab_test = db.query(models.LabTest).filter(models.LabTest.id == test_id).first()
    if not lab_test:
        raise HTTPException(404, "Lab test not found")
    
    # Check if test is already completed
    if lab_test.status == "completed":
        raise HTTPException(400, "Cannot cancel a completed test")
    
    # Check if test is already cancelled
    if lab_test.status == "cancelled":
        raise HTTPException(400, "Test is already cancelled")
    
    # Store old status for reference
    old_status = lab_test.status
    
    # Update status to cancelled
    lab_test.status = "cancelled"
    db.commit()
    
    print(f"✅ Test {test_id} cancelled by {current_user.role}. Old status: {old_status}")
    
    return {
        "message": "Lab test cancelled successfully",
        "test_id": test_id,
        "old_status": old_status,
        "new_status": "cancelled"
    }