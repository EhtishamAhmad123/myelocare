from database import SessionLocal
import models

db = SessionLocal()

print("=" * 60)
print("CLEANING UP DOCTOR DATABASE")
print("=" * 60)

# 1. Delete generic users created by the fix script (emails starting with doctor_)
generic_users = db.query(models.User).filter(
    models.User.email.like("doctor_%@hospital.com")
).all()

print(f"\nFound {len(generic_users)} generic doctor users to delete")

for user in generic_users:
    # First delete the doctor profile
    profile = db.query(models.DoctorProfile).filter(models.DoctorProfile.user_id == user.id).first()
    if profile:
        db.delete(profile)
        print(f"  Deleted profile for {user.email}")
    db.delete(user)
    print(f"  Deleted user {user.email}")

db.commit()
print(f"\n✅ Removed {len(generic_users)} generic doctor entries")

# 2. Now check remaining doctors
remaining_doctors = db.query(models.User).filter(models.User.role == "doctor").all()
print(f"\nRemaining doctors in database: {len(remaining_doctors)}")
for doc in remaining_doctors:
    profile = doc.doctor_profile
    print(f"  - {doc.full_name}: {doc.email} | Hospital: {profile.hospital_name if profile else 'N/A'}")

db.close()
print("\n" + "=" * 60)
print("✅ Cleanup complete!")
print("=" * 60)