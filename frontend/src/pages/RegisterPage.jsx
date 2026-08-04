import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'
import toast from 'react-hot-toast'
import { Heart, Mail, Lock, User, Phone, Stethoscope, Microscope, ChevronRight, Eye, EyeOff, Shield, Sparkles, CheckCircle } from 'lucide-react'

const roles = [
  { value: 'patient', label: 'Patient', desc: 'Book appointments and view results', icon: '👤', color: 'from-blue-500 to-cyan-500' },
  { value: 'doctor', label: 'Doctor / Hematologist', desc: 'Manage patients and order tests', icon: '👨‍⚕️', color: 'from-emerald-500 to-teal-500' },
  { value: 'labtech', label: 'Lab Technician', desc: 'Upload images and run diagnostics', icon: '🔬', color: 'from-purple-500 to-pink-500' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    doctor_profile_id: '',
    pmdc_license: ''
  })
  const [doctorType, setDoctorType] = useState('existing')
  const [unclaimedDoctors, setUnclaimedDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (form.role === 'doctor' && doctorType === 'existing') {
      fetchUnclaimedDoctors()
    }
  }, [form.role, doctorType])

  const fetchUnclaimedDoctors = async () => {
    setLoadingDoctors(true)
    try {
      const response = await authAPI.getUnclaimedDoctors()
      setUnclaimedDoctors(response.data)
    } catch (err) {
      console.error('Error fetching doctors:', err)
    } finally {
      setLoadingDoctors(false)
    }
  }

  const checkPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setForm({ ...form, password: newPassword })
    checkPasswordStrength(newPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (form.role === 'doctor' && !form.pmdc_license) {
      toast.error('PMDC license number is required for doctors')
      return
    }
    
    if (passwordStrength < 3) {
      toast.error('Password must be at least 8 characters with a number and special character')
      return
    }
    
    setLoading(true)
    
    try {
      const registerData = {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        pmdc_license: form.pmdc_license
      }
      
      if (form.role === 'doctor' && doctorType === 'existing' && form.doctor_profile_id) {
        registerData.doctor_profile_id = parseInt(form.doctor_profile_id)
      }
      
      const res = await authAPI.register(registerData)
      
      if (res.data.requires_verification) {
        toast.success('Registration successful! Your profile is pending admin verification.')
        navigate('/login')
      } else {
        toast.success('Account created successfully!')
        const routes = { patient: '/patient', doctor: '/doctor', labtech: '/labtech' }
        navigate(routes[res.data.role])
      }
    } catch (err) {
      console.error('Registration error:', err)
      const errorMsg = err.response?.data?.detail || 'Registration failed'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200'
    if (passwordStrength === 1) return 'bg-red-500'
    if (passwordStrength === 2) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return 'Enter password'
    if (passwordStrength === 1) return 'Weak'
    if (passwordStrength === 2) return 'Medium'
    return 'Strong'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left Side - Brand Section */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-xl">MyeloCare</span>
              </div>
              
              <div className="space-y-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  Join Our<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                    Healthcare Community
                  </span>
                </h1>
                <p className="text-blue-100 text-sm">
                  Create your account and take control of your health journey.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                {[
                  { icon: Shield, text: "HIPAA-compliant & Secure" },
                  { icon: Sparkles, text: "AI-Powered Diagnosis" },
                  { icon: CheckCircle, text: "24/7 Access to Records" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-white/80 text-sm">
                    <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
                      <item.icon className="w-3 h-3" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/60 text-xs text-center">
                Already registered?{' '}
                <Link to="/login" className="text-white hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="bg-white p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Create Account</h2>
              <p className="text-gray-500 text-xs mt-1">Join MyeloCare today</p>
            </div>

            {/* Role Selection Cards */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value, doctor_profile_id: '' })}
                  className={`p-2 rounded-xl border-2 text-center transition-all ${
                    form.role === r.value 
                      ? `border-${r.color.split('-')[1]}-500 bg-gradient-to-r ${r.color} text-white shadow-lg scale-105`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-xl mb-1">{r.icon}</div>
                  <p className={`text-xs font-medium ${form.role === r.value ? 'text-white' : 'text-gray-700'}`}>
                    {r.label}
                  </p>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${getStrengthColor()} transition-all`} style={{ width: `${passwordStrength * 33.33}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{getStrengthText()}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">8+ chars, number & special character</p>
                  </div>
                )}
              </div>

              {/* Doctor-specific fields */}
              {form.role === 'doctor' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">PMDC License Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., PMDC-12345"
                      value={form.pmdc_license}
                      onChange={(e) => setForm({ ...form, pmdc_license: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Are you already listed on MyeloCare?</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={doctorType === 'existing'}
                          onChange={() => setDoctorType('existing')}
                          className="w-4 h-4"
                        />
                        Claim my profile
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={doctorType === 'new'}
                          onChange={() => setDoctorType('new')}
                          className="w-4 h-4"
                        />
                        Register as new
                      </label>
                    </div>
                  </div>

                  {doctorType === 'existing' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Select Your Profile</label>
                      {loadingDoctors ? (
                        <div className="text-center py-2 text-gray-500 text-sm">Loading doctors...</div>
                      ) : unclaimedDoctors.length === 0 ? (
                        <div className="p-2 bg-yellow-50 rounded-lg text-xs text-yellow-800">
                          No unclaimed profiles found. Please register as a new doctor.
                        </div>
                      ) : (
                        <select
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={form.doctor_profile_id}
                          onChange={(e) => setForm({ ...form, doctor_profile_id: e.target.value })}
                          required
                        >
                          <option value="">-- Select your name --</option>
                          {unclaimedDoctors.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              Dr. {doc.name} - {doc.specialization}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {doctorType === 'new' && (
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        ⚠️ New doctor registrations require admin approval.
                      </p>
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <ChevronRight className="w-3 h-3" /></>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}