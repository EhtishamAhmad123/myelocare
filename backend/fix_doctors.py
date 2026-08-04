from database import SessionLocal
import models
from auth import hash_password

db = SessionLocal()

# Get all doctor profiles
profiles = db.query(models.DoctorProfile).all()

print("=" * 60)
print("Fixing doctor profiles...")
print("=" * 60)

for profile in profiles:
    # Check if profile has a user
    if profile.user_id:
        user = db.query(models.User).filter(models.User.id == profile.user_id).first()
        if user:
            print(f"✓ Profile {profile.id} already linked to user: {user.full_name}")
            continue
    
    # Create a user for this profile
    # Generate a name from the profile or use a default
    if profile.hospital_name:
        name = f"Dr. {profile.hospital_name.split()[0] if profile.hospital_name else 'Unknown'}"
    else:
        name = f"Dr. Doctor_{profile.id}"
    
    email = f"doctor_{profile.id}@hospital.com"
    
    # Check if user already exists with this email
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        profile.user_id = existing_user.id
        profile.is_claimed = True
        profile.is_verified = True
        print(f"✓ Linked profile {profile.id} to existing user: {existing_user.full_name}")
    else:
        # Create new user
        new_user = models.User(
            full_name=name,
            email=email,
            hashed_password=hash_password("Doctor123!"),
            role="doctor",
            is_active=True
        )
        db.add(new_user)
        db.flush()
        
        profile.user_id = new_user.id
        profile.is_claimed = True
        profile.is_verified = True
        print(f"✓ Created new user {name} for profile {profile.id}")

db.commit()
db.close()

print("\n" + "=" * 60)
print("✅ All doctor profiles have been linked to user accounts!")
print("=" * 60)