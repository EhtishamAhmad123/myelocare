import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import LabTechAllTests from './pages/labtech/AllTests'

// Public Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RegisterLabTech from './pages/RegisterLabTech'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard'
import FindDoctors from './pages/patient/FindDoctors'
import BookAppointment from './pages/patient/BookAppointment'
import PatientAppointments from './pages/patient/Appointments'
import AppointmentDetail from './pages/patient/AppointmentDetail'
import TestResults from './pages/patient/TestResults'

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorAppointmentDetail from './pages/doctor/AppointmentDetail'
import DoctorProfile from './pages/doctor/Profile'

// Lab Tech Pages
import LabTechDashboard from './pages/labtech/Dashboard'
import LabTechProfile from './pages/labtech/Profile'
import LabTestDetail from './pages/labtech/TestDetail'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminDoctors from './pages/admin/Doctors'
import AdminPatients from './pages/admin/Patients'
import AdminLabTechs from './pages/admin/LabTechs'
import PendingUpdates from './pages/admin/PendingUpdates'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-labtech" element={<RegisterLabTech />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ========== PATIENT ROUTES ========== */}
          <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><Layout /></ProtectedRoute>}>
            <Route index element={<PatientDashboard />} />
            <Route path="doctors" element={<FindDoctors />} />
            <Route path="book/:doctorId" element={<BookAppointment />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="appointments/:id" element={<AppointmentDetail />} />
            <Route path="results" element={<TestResults />} />
          </Route>

          {/* ========== DOCTOR ROUTES ========== */}
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><Layout /></ProtectedRoute>}>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="appointments/:id" element={<DoctorAppointmentDetail />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Route>

          {/* ========== LAB TECH ROUTES ========== */}
<Route path="/labtech" element={<ProtectedRoute allowedRoles={['labtech']}><Layout /></ProtectedRoute>}>
  <Route index element={<LabTechDashboard />} />
  <Route path="profile" element={<LabTechProfile />} />
  <Route path="tests" element={<LabTechAllTests />} />
  <Route path="tests/:id" element={<LabTestDetail />} />
</Route>

          {/* ========== ADMIN ROUTES ========== */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="labtechs" element={<AdminLabTechs />} />
            <Route path="pending-updates" element={<PendingUpdates />} />
          </Route>

          {/* ========== FALLBACK ========== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App