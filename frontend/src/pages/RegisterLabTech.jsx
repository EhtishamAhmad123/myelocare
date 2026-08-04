import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'
import toast from 'react-hot-toast'

export default function RegisterLabTech() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    cnic: '',
    ahpc_registration_no: '',
    lab_name: '',
    lab_address: '',
    city: 'Lahore',
    institution_name: '',
    employee_id: '',
    supervisor_pmdc_no: '',
    qualification_document: null
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      qualification_document: e.target.files[0]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Format CNIC (remove hyphens if present)
      let cnic = formData.cnic.replace(/-/g, '')
      
      const submitData = new FormData()
      submitData.append('full_name', formData.full_name)
      submitData.append('email', formData.email)
      submitData.append('password', formData.password)
      submitData.append('phone', formData.phone)
      submitData.append('cnic', cnic)
      submitData.append('ahpc_registration_no', formData.ahpc_registration_no)
      submitData.append('lab_name', formData.lab_name)
      submitData.append('lab_address', formData.lab_address)
      submitData.append('city', formData.city)
      submitData.append('institution_name', formData.institution_name)
      submitData.append('employee_id', formData.employee_id)
      submitData.append('supervisor_pmdc_no', formData.supervisor_pmdc_no)
      
      if (formData.qualification_document) {
        submitData.append('qualification_document', formData.qualification_document)
      }
      
      const response = await authAPI.registerLabTech(submitData)
      toast.success(response.data.message || 'Registration submitted for admin verification')
      navigate('/login')
    } catch (err) {
      console.error('Registration error:', err)
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">AHPC</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Technician Registration</h1>
          <p className="text-gray-500 mt-1">AHPC Registered Medical Laboratory Technologist</p>
          <p className="text-xs text-gray-400 mt-2">* All fields are required for verification</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" name="full_name" className="input" value={formData.full_name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" className="input" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type="password" name="password" className="input" value={formData.password} onChange={handleChange} required minLength={8} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input type="tel" name="phone" className="input" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">AHPC Verification Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNIC Number *</label>
                <input type="text" name="cnic" className="input" placeholder="12345-1234567-1" value={formData.cnic} onChange={handleChange} required />
                <p className="text-xs text-gray-400 mt-1">Format: 12345-1234567-1</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AHPC Registration No *</label>
                <input type="text" name="ahpc_registration_no" className="input" placeholder="AHPC-12345-67890" value={formData.ahpc_registration_no} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Laboratory Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lab/Hospital Name *</label>
                <input type="text" name="lab_name" className="input" value={formData.lab_name} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lab Address *</label>
                <input type="text" name="lab_address" className="input" value={formData.lab_address} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <select name="city" className="input" value={formData.city} onChange={handleChange} required>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input type="text" name="employee_id" className="input" value={formData.employee_id} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Supervisor / Consultant Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor PMDC Number *</label>
              <input type="text" name="supervisor_pmdc_no" className="input" placeholder="PMDC-XXXXX" value={formData.supervisor_pmdc_no} onChange={handleChange} required />
              <p className="text-xs text-gray-400 mt-1">PMDC number of supervising hematologist</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Qualification Document</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Degree/Diploma *</label>
              <input type="file" name="qualification_document" accept=".pdf,.jpg,.png" className="w-full" onChange={handleFileChange} required />
              <p className="text-xs text-gray-400 mt-1">Upload BS MLT, BS MLS, or Diploma MLT certificate (PDF/Image)</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mt-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Your registration will be verified by admin against AHPC registry.
              You will be notified once approved.
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-4">
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}