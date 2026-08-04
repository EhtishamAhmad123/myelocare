from database import SessionLocal
import models
from auth import hash_password

db = SessionLocal()

print("=" * 70)
print("🚨 DOCTOR DATABASE COMPLETE RESET")
print("=" * 70)

# Step 1: Delete all appointments (to break foreign key constraints)
print("\n📋 Step 1: Deleting all appointments...")
appointments = db.query(models.Appointment).all()
print(f"   Found {len(appointments)} appointments to delete")
for apt in appointments:
    db.delete(apt)
db.commit()
print("   ✅ All appointments deleted")

# Step 2: Delete all diagnostic results and images
print("\n🖼️ Step 2: Deleting diagnostic data...")
results = db.query(models.DiagnosticResult).all()
print(f"   Found {len(results)} diagnostic results")
for res in results:
    db.delete(res)

images = db.query(models.DiagnosticImage).all()
print(f"   Found {len(images)} diagnostic images")
for img in images:
    db.delete(img)
db.commit()
print("   ✅ Diagnostic data deleted")

# Step 3: Delete all lab tests
print("\n🔬 Step 3: Deleting lab tests...")
lab_tests = db.query(models.LabTest).all()
print(f"   Found {len(lab_tests)} lab tests")
for test in lab_tests:
    db.delete(test)
db.commit()
print("   ✅ Lab tests deleted")

# Step 4: Delete doctor profiles
print("\n👨‍⚕️ Step 4: Deleting doctor profiles...")
profiles = db.query(models.DoctorProfile).all()
print(f"   Found {len(profiles)} doctor profiles")
for profile in profiles:
    db.delete(profile)
db.commit()
print("   ✅ Doctor profiles deleted")

# Step 5: Delete doctor users
print("\n👤 Step 5: Deleting doctor user accounts...")
doctor_users = db.query(models.User).filter(models.User.role == "doctor").all()
print(f"   Found {len(doctor_users)} doctor users")
for user in doctor_users:
    db.delete(user)
db.commit()
print("   ✅ Doctor users deleted")

print("\n" + "=" * 70)
print("✅ DATABASE CLEANED! All doctor-related data removed.")
print("=" * 70)

# Step 6: Now insert the correct doctors
print("\n📥 Step 6: Inserting correct doctor data...")
print("=" * 70)

# Real doctors data from Oladoc
doctors_data = [
    {"name": "Dr. Ayesha Ehsan", "specialty": "Hematologist", "hospital": "Lahore General Hospital", "fee": 2500, "city": "Lahore", "experience": 20, "rating": 4.9, "reviews": 71},
    {"name": "Dr. Nabila Aslam", "specialty": "Hematologist", "hospital": "Mayo Hospital", "fee": 2000, "city": "Lahore", "experience": 11, "rating": 5.0, "reviews": 8},
    {"name": "Prof. Dr. Syed Nadeem Mansoor", "specialty": "Hematologist", "hospital": "Shaukat Khanum Hospital", "fee": 3500, "city": "Lahore", "experience": 42, "rating": 4.9, "reviews": 458},
    {"name": "Dr. Muhammad Ahsan Zafar", "specialty": "Hematologist", "hospital": "Doctors Hospital", "fee": 3000, "city": "Lahore", "experience": 15, "rating": 4.8, "reviews": 143},
    {"name": "Dr. Ambreen Kashif", "specialty": "Hematologist", "hospital": "National Hospital", "fee": 2500, "city": "Lahore", "experience": 10, "rating": 4.8, "reviews": 83},
    {"name": "Dr. Rija Tariq", "specialty": "Hematologist", "hospital": "Saleem Memorial Hospital", "fee": 3500, "city": "Lahore", "experience": 13, "rating": 4.8, "reviews": 55},
    {"name": "Lt. Col. (R) Dr. Ghulam Rasool", "specialty": "Hematologist", "hospital": "CMH Lahore", "fee": 3000, "city": "Lahore", "experience": 35, "rating": 4.5, "reviews": 0},
    {"name": "Dr. Abdul Hameed", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 2000, "city": "Lahore", "experience": 12, "rating": 4.0, "reviews": 0},
    {"name": "Dr. Muhammad Arif", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 2500, "city": "Lahore", "experience": 17, "rating": 4.5, "reviews": 0},
    {"name": "Dr. Tooba Ammar", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 3000, "city": "Lahore", "experience": 28, "rating": 5.0, "reviews": 9},
    {"name": "Dr. Muhammad Asif Naveed", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 2500, "city": "Lahore", "experience": 10, "rating": 4.5, "reviews": 0},
    {"name": "Dr. Shabnam Bashir", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 2000, "city": "Lahore", "experience": 19, "rating": 5.0, "reviews": 3},
    {"name": "Dr. Nazia Ahmad", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 2000, "city": "Lahore", "experience": 15, "rating": 5.0, "reviews": 47},
    {"name": "Prof.Dr. Yasmeen Lodhi", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 3500, "city": "Lahore", "experience": 30, "rating": 4.8, "reviews": 0},
    {"name": "Dr. Saima Mansoor Bugvi", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 2500, "city": "Lahore", "experience": 15, "rating": 4.5, "reviews": 0},
    {"name": "Dr. Ghazanfar Ali Sirhindi", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 2500, "city": "Lahore", "experience": 20, "rating": 4.5, "reviews": 0},
    {"name": "Dr. Hussain Farooq", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 2500, "city": "Lahore", "experience": 10, "rating": 4.5, "reviews": 0},
    {"name": "Brig. (R) Dr. Maqbool Alam", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 2000, "city": "Lahore", "experience": 35, "rating": 4.8, "reviews": 0},
]

added = 0
for doc in doctors_data:
    # Create clean email
    email = doc['name'].lower()
    email = email.replace("dr.", "").replace("prof.", "").replace("lt.", "").replace("col.", "").replace("(r)", "").replace("brig.", "")
    email = email.replace(" ", ".").replace("..", ".").strip('.') + "@hospital.com"
    
    # Create user
    user = models.User(
        full_name=doc['name'],
        email=email,
        hashed_password=hash_password("Doctor123!"),
        role="doctor",
        phone="042-111-111-111",
        is_active=True
    )
    db.add(user)
    db.flush()
    
    # Create doctor profile
    profile = models.DoctorProfile(
        user_id=user.id,
        specialization=doc['specialty'],
        hospital_name=doc['hospital'],
        hospital_address=doc['city'],
        city=doc['city'],
        consultation_fee=doc['fee'],
        available_days="Mon,Tue,Wed,Thu,Fri,Sat",
        available_start="09:00",
        available_end="17:00",
        bio=f"{doc['name']} is a practicing {doc['specialty']} with {doc['experience']} years of experience.",
        rating=doc['rating'],
        total_reviews=doc['reviews'],
        is_claimed=True,
        is_verified=True,
        verification_status="approved"
    )
    db.add(profile)
    added += 1
    print(f"✅ Added: {doc['name']}")

db.commit()
db.close()

print("\n" + "=" * 70)
print(f"📊 COMPLETE! {added} doctors added successfully!")
print("=" * 70)