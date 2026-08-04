from database import SessionLocal
import models
from auth import hash_password
import re

db = SessionLocal()

# Complete doctors data from Oladoc
doctors_data = [
    {"name": "Dr. Ayesha Ehsan", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 2500, "city": "Lahore", "experience": 20, "rating": 4.9, "reviews": 71},
    {"name": "Dr. Nabila Aslam", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 2000, "city": "Lahore", "experience": 11, "rating": 5.0, "reviews": 8},
    {"name": "Prof. Dr. Syed Nadeem Mansoor", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 3500, "city": "Lahore", "experience": 42, "rating": 4.9, "reviews": 458},
    {"name": "Dr. Muhammad Ahsan Zafar", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 3000, "city": "Lahore", "experience": 15, "rating": 4.8, "reviews": 143},
    {"name": "Dr. Ambreen Kashif", "specialty": "Hematologist", "hospital": "Lahore Hospital", "fee": 2500, "city": "Lahore", "experience": 10, "rating": 4.8, "reviews": 83},
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

print("=" * 60)
print("Adding ALL 18 doctors to database...")
print("=" * 60)

added_count = 0
skipped_count = 0

for doc in doctors_data:
    # Create email from name
    email = doc['name'].lower()
    email = re.sub(r'[^a-z0-9]', '.', email)
    email = re.sub(r'\.+', '.', email)
    email = email.strip('.') + "@hospital.com"
    
    # Check if doctor already exists
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        print(f"⚠️ Skipping {doc['name']} - already exists")
        skipped_count += 1
        continue
    
    # Create user
    user = models.User(
        full_name=doc['name'],
        email=email,
        hashed_password=hash_password("Doctor123!"),
        role="doctor",
        phone="042-111-111-111"
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
        bio=f"{doc['name']} is a practicing {doc['specialty']} with {doc['experience']} years of experience in Lahore.",
        rating=doc['rating'],
        total_reviews=doc['reviews']
    )
    db.add(profile)
    added_count += 1
    print(f"✅ Added: {doc['name']} - {doc['specialty']} - PKR {doc['fee']}")

db.commit()
db.close()

print("\n" + "=" * 60)
print(f"📊 Summary: {added_count} doctors added, {skipped_count} skipped")
print("=" * 60)
print("\n🎉 All doctors added successfully!")