from database import SessionLocal
import models

db = SessionLocal()

# Update all existing doctor profiles to be unclaimed
doctor_profiles = db.query(models.DoctorProfile).all()

for profile in doctor_profiles:
    profile.is_claimed = False
    profile.is_verified = False
    profile.verification_status = "pending"
    profile.user_id = None  # Remove any existing user association
    print(f"Updated: Profile {profile.id}")

db.commit()
db.close()

print("\n✅ All doctor profiles are now unclaimed and ready for claiming!")