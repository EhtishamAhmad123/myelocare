from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models, database
from email_mailtrap import send_password_reset_email_mailtrap as send_password_reset_email
from email_mailtrap import send_password_reset_email_mailtrap as send_password_reset_email

router = APIRouter(prefix="/api/password-reset", tags=["password-reset"])

@router.post("/request")
def request_reset(
    request: dict, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    email = request.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    
    # Security: Always return success even if email doesn't exist
    # But only send email if user exists
    if user:
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        
        # Create reset link
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
        
        # Send email in background (doesn't block the response)
        background_tasks.add_task(
            send_password_reset_email, 
            user.email, 
            reset_link, 
            user.full_name
        )
        
        # Also print to console for development
        print(f"\n{'='*60}")
        print(f"📧 Password reset email queued for: {user.email}")
        print(f"🔗 Reset link: {reset_link}")
        print(f"{'='*60}\n")
    
    # Always return success (security best practice)
    return {"message": "If an account exists with this email, you will receive a password reset link"}

@router.post("/confirm")
def confirm_reset(data: dict, db: Session = Depends(database.get_db)):
    token = data.get("token")
    new_password = data.get("new_password")
    
    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token and new password are required")
    
    user = db.query(models.User).filter(
        models.User.reset_token == token,
        models.User.reset_token_expiry > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    # Import auth here to avoid circular import
    import auth
    user.hashed_password = auth.hash_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    
    return {"message": "Password reset successful"}