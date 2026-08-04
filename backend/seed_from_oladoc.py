import json
from database import SessionLocal
import models
from auth import hash_password

db = SessionLocal()

# Load the scraped data
with open('doctors_data.json', 'r', encoding='utf-8') as f:
    doctors = json.load(f)

for doc in doctors:
    # Create user account for doctor
    doctor_email = doc.get('email', doc.get('doctor_id', '') + '@example.com')
    doctor_name = doc.get('name', 'Unknown Doctor')
    
    # Check if doctor already exists
    existing = db.query(models.User).filter(models.User.email == doctor_email).first()
    if existing:
        print(f"Skipping {doctor_name} - already exists")
        continue
    
    # Create user
    user = models.User(
        full_name=doctor_name,
        email=doctor_email,
        hashed_password=hash_password("Doctor123!"),  # Default password
        role="doctor",
        phone=doc.get('phone', '')
    )
    db.add(user)
    db.flush()
    
    # Get consultation fee
    fee_str = doc.get('consultation_fee', '0')
    fee = 0
    if fee_str:
        import re
        numbers = re.findall(r'\d+', str(fee_str))
        fee = int(numbers[0]) if numbers else 0
    
    # Create doctor profile
    profile = models.DoctorProfile(
        user_id=user.id,
        specialization=doc.get('specialty', 'Hematologist'),
        hospital_name=doc.get('hospitals', [{}])[0].get('name', 'Lahore Hospital') if doc.get('hospitals') else 'Lahore Hospital',
        hospital_address=doc.get('locality', 'Lahore'),
        city=doc.get('city', 'Lahore'),
        consultation_fee=fee,
        available_days="Mon,Tue,Wed,Thu,Fri,Sat",
        available_start="09:00",
        available_end="17:00",
        bio=doc.get('description', f"{doctor_name} is a practicing hematologist in Lahore."),
        rating=doc.get('rating', 0.0),
        total_reviews=doc.get('reviews_count', 0)
    )
    db.add(profile)
    print(f"✅ Added doctor: {doctor_name}")

db.commit()
db.close()
print("🎉 All doctors added successfully!")