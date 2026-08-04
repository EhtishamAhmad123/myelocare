# MyeloCare - Full Stack Website
About
MyeloCare is a comprehensive hospital management and AI diagnostic platform for Multiple Myeloma (MM) diagnosis using Federated Deep Learning. This is the complete web application with role-based access for patients, doctors, lab technicians, and administrators.

🩸 Live Demo
Repository: https://github.com/EhtishamAhmad123/myelocare

Branch: https://github.com/EhtishamAhmad123/myelocare/tree/website

🏗️ Tech Stack
Backend
Framework: FastAPI

Language: Python 3.9+

Database: SQLAlchemy + MySQL/SQLite

AI/ML: YOLOv8, PyTorch, Ultralytics

Federated Learning: Flower (FL framework)

Authentication: JWT, bcrypt

Frontend
Framework: React 18

Styling: Tailwind CSS

Build Tool: Vite

Routing: React Router v6

HTTP Client: Axios

🚀 Features
🔐 Authentication & Authorization
JWT-based authentication

Role-based access control (Admin, Doctor, Patient, Lab Tech)

Password reset functionality

Protected routes

👨‍⚕️ Patient Portal
Book appointments with doctors

View appointment history

Upload lab test images

View AI diagnostic results

Manage profile

👨‍🔬 Doctor Portal
View scheduled appointments

Update appointment status

View patient medical history

Manage availability

AI-assisted diagnosis

🧪 Lab Tech Portal
Upload and process lab tests

View test requests

Update test status

AI-powered image analysis

👑 Admin Dashboard
Manage all users (Patients, Doctors, Lab Techs)

View system statistics

Manage appointments

System configuration

🤖 AI Features
YOLOv8-based Multiple Myeloma detection

Automated diagnostic reports

Real-time analysis of bone marrow images

High accuracy plasma cell detection

📦 Installation
Prerequisites
Python 3.9 or higher

Node.js 18 or higher

MySQL (optional, SQLite works for development)

Git

Clone the Repository
bash
# Clone the repository
git clone https://github.com/EhtishamAhmad123/myelocare.git

# Navigate to project
cd myelocare

# Switch to website branch
git checkout website
🔧 Backend Setup
1. Create Virtual Environment
bash
cd backend
python -m venv venv
Windows:

bash
venv\Scripts\activate
Linux/Mac:

bash
source venv/bin/activate
2. Install Dependencies
bash
pip install -r requirements.txt
3. Configure Environment Variables
Create a .env file in the backend directory:

bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=myelocare

# JWT Configuration
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Model Path
MODEL_PATH=backend/best.pt
4. Initialize Database
bash
# Create database tables
python -c "from database import engine, Base; Base.metadata.create_all(engine)"

# Seed initial doctors
python seed_doctors_simple.py
5. Run Backend Server
bash
uvicorn main:app --reload --port 8000
The API will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs
