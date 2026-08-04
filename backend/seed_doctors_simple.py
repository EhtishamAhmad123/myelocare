from database import SessionLocal
import models
from auth import hash_password

db = SessionLocal()

doctors_data = [
    {"name": "Dr. Ayesha Ehsan", "specialty": "Hematologist", "hospital": "Lahore General Hospital", "fee": 2500, "city": "Lahore", "experience": 12, "rating": 4.9, "reviews": 71},
    {"name": "Dr. Nabila Aslam", "specialty": "Hematologist", "hospital": "Mayo Hospital", "fee": 2000, "city": "Lahore", "experience": 11, "rating": 5.0, "reviews": 8},
    {"name": "Prof. Dr. Syed Nadeem Mansoor", "specialty": "Hematologist", "hospital": "Shaukat Khanum Hospital", "fee": 3500, "city": "Lahore", "experience": 42, "rating": 4.9, "reviews": 458},
    {"name": "Dr. Muhammad Ahsan Zafar", "specialty": "Hematologist", "hospital": "Doctors Hospital", "fee": 3000, "city": "Lahore", "experience": 15, "rating": 4.8, "reviews": 143},
    {"name": "Dr. Ambreen Kashif", "specialty": "Hematologist", "hospital": "National Hospital", "fee": 2500, "city": "Lahore", "experience": 10, "rating": 4.8, "reviews": 83},
    {"name": "Dr. Rija Tariq", "specialty": "Hematologist", "hospital": "Saleem Memorial Hospital", "fee": 3500, "city": "Lahore", "experience": 13, "rating": 4.8, "reviews": 55},
]

print("=" * 60)
print("Adding doctors to database...")
print("=" * 60)

added = 0
for doc in doctors_data:
    email = doc['name'].lower().replace(" ", ".") + "@hospital.com"
    
    # Check if already exists
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        print(f"⚠️ Skipping {doc['name']} - already exists")
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
    
    # Create profile
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
        total_reviews=doc['reviews']
    )
    db.add(profile)
    added += 1
    print(f"✅ Added: {doc['name']} - {doc['specialty']} - PKR {doc['fee']}")

db.commit()
db.close()

print(f"\n🎉 Successfully added {added} doctors to database!")