from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models, schemas, auth, database

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.get("/unclaimed-doctors")
def get_unclaimed_doctors(db: Session = Depends(database.get_db)):
    """Get list of unclaimed doctor profiles for claiming"""
    unclaimed = db.query(models.DoctorProfile).filter(
        models.DoctorProfile.is_claimed == False,
        models.DoctorProfile.user_id == None
    ).all()
    
    result = []
    for doc in unclaimed:
        result.append({
            "id": doc.id,
            "name": f"Dr. {doc.user.full_name if doc.user else 'Unknown'}",
            "specialization": doc.specialization,
            "hospital_name": doc.hospital_name,
            "city": doc.city,
            "rating": doc.rating or 0.0,
        })
    return result

@router.post("/register", response_model=schemas.Token)
def register(user_data: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if email already exists
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Handle doctor registration
    if user_data.role == "doctor":
        if user_data.doctor_profile_id:
            # CLAIM EXISTING PROFILE
            doctor_profile = db.query(models.DoctorProfile).filter(
                models.DoctorProfile.id == user_data.doctor_profile_id,
                models.DoctorProfile.is_claimed == False,
                models.DoctorProfile.user_id == None
            ).first()
            
            if not doctor_profile:
                raise HTTPException(status_code=400, detail="Invalid or already claimed doctor profile")
            
            # Create user account
            user = models.User(
                full_name=user_data.full_name,
                email=user_data.email,
                hashed_password=auth.hash_password(user_data.password),
                role=user_data.role,
                phone=user_data.phone,
                is_active=True
            )
            db.add(user)
            db.flush()
            
            # Claim the profile
            doctor_profile.user_id = user.id
            doctor_profile.is_claimed = True
            doctor_profile.is_verified = False  # Requires admin verification
            doctor_profile.verification_status = "pending"
            doctor_profile.pmdc_license = user_data.pmdc_license
            doctor_profile.claimed_at = db.func.now()
            
            db.commit()
            db.refresh(user)
            
            token = auth.create_access_token({"sub": user.id, "role": user.role})
            return {
                "access_token": token, 
                "token_type": "bearer", 
                "role": user.role, 
                "user_id": user.id, 
                "full_name": user.full_name,
                "requires_verification": True  # Flag for frontend
            }
        else:
            # NEW DOCTOR REGISTRATION (requires admin approval)
            user = models.User(
                full_name=user_data.full_name,
                email=user_data.email,
                hashed_password=auth.hash_password(user_data.password),
                role=user_data.role,
                phone=user_data.phone,
                is_active=False  # Inactive until admin approves
            )
            db.add(user)
            db.flush()
            
            # Create pending profile
            doctor_profile = models.DoctorProfile(
                user_id=user.id,
                is_claimed=True,
                is_verified=False,
                verification_status="pending",
                pmdc_license=user_data.pmdc_license
            )
            db.add(doctor_profile)
            db.commit()
            db.refresh(user)
            
            # In development, just print the admin notification
            print(f"\n{'='*60}")
            print(f"⚠️ NEW DOCTOR REGISTRATION PENDING APPROVAL")
            print(f"Name: {user.full_name}")
            print(f"Email: {user.email}")
            print(f"PMDC License: {user_data.pmdc_license}")
            print(f"{'='*60}\n")
            
            raise HTTPException(
                status_code=status.HTTP_202_ACCEPTED,
                detail="Your registration is pending admin approval. You will be notified once verified."
            )
    
    else:
        # Patient or Lab Tech registration (regular flow)
        user = models.User(
            full_name=user_data.full_name,
            email=user_data.email,
            hashed_password=auth.hash_password(user_data.password),
            role=user_data.role,
            phone=user_data.phone,
            is_active=True
        )
        db.add(user)
        db.flush()
        
        # Create profile based on role
        if user_data.role == models.UserRole.labtech:
            db.add(models.LabTechProfile(user_id=user.id))
        
        db.commit()
        db.refresh(user)
        
        token = auth.create_access_token({"sub": user.id, "role": user.role})
        return {
            "access_token": token, 
            "token_type": "bearer", 
            "role": user.role, 
            "user_id": user.id, 
            "full_name": user.full_name
        }

@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account pending admin approval. Please wait for verification.")
    
    token = auth.create_access_token({"sub": user.id, "role": user.role})
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "role": user.role, 
        "user_id": user.id, 
        "full_name": user.full_name
    }

@router.get("/me")
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "id": current_user.id, 
        "full_name": current_user.full_name, 
        "email": current_user.email, 
        "role": current_user.role,
        "phone": current_user.phone,
        "is_active": current_user.is_active
    }